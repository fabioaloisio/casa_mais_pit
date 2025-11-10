const fs = require('fs');
const path = require('path');

class SQLExecutor {
  constructor(connection) {
    this.connection = connection;
  }

  /**
   * Executa um arquivo SQL
   */
  async executeFile(sqlFilePath, showOutput = true) {
    try {
      // Verificar se arquivo existe
      if (!fs.existsSync(sqlFilePath)) {
        throw new Error(`Arquivo SQL não encontrado: ${sqlFilePath}`);
      }

      // Ler conteúdo do arquivo
      const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

      if (showOutput) {
        console.log(`📂 Executando: ${path.basename(sqlFilePath)}`);
      }

      // Verificar se o arquivo contém DELIMITER (para triggers)
      if (sqlContent.includes('DELIMITER')) {
        await this.executeWithDelimiter(sqlContent, showOutput);
      } else {
        //  Executar SQL normal (lógica original)
        await this.executeSQL(sqlContent, showOutput);
      }

      if (showOutput) {
        console.log(`✅ ${path.basename(sqlFilePath)} executado com sucesso`);
      }

    } catch (error) {
      console.error(`❌ Erro ao executar ${path.basename(sqlFilePath)}:`, error.message);
      throw error;
    }
  }
  async executeWithDelimiter(sqlContent, showOutput = true) {
    try {
      // Remover comentários de múltiplas linhas
      let content = sqlContent.replace(/\/\*[\s\S]*?\*\//g, '');

      // Dividir por DELIMITER
      const parts = content.split(/DELIMITER\s+/i);

      // Primeira parte (antes do primeiro DELIMITER) usa delimitador padrão ;
      if (parts[0] && parts[0].trim()) {
        const statements = parts[0]
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith('--'));

        for (const statement of statements) {
          if (statement) {
            await this.connection.query(statement);
            if (showOutput && statement.toLowerCase().includes('drop trigger')) {
              const match = statement.match(/drop trigger(?:\s+if exists)?\s+(\w+)/i);
              if (match) console.log(`  ✓ Trigger ${match[1]} removido`);
            }
          }
        }
      }

      // Processar partes com DELIMITER customizado
      for (let i = 1; i < parts.length; i++) {
        const part = parts[i].trim();
        if (!part) continue;

        // Primeira linha define o novo delimitador
        const lines = part.split('\n');
        const newDelimiter = lines[0].trim();

        if (newDelimiter === ';') {
          // Voltou ao delimitador padrão
          const remainingContent = lines.slice(1).join('\n');
          const statements = remainingContent
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

          for (const statement of statements) {
            if (statement) {
              await this.connection.query(statement);
            }
          }
        } else {
          // Delimitador customizado ($$)
          const code = lines.slice(1).join('\n');

          // Dividir pelo delimitador customizado
          // Usar split mais simples e remover o delimitador de cada parte
          const parts = code.split(newDelimiter);

          for (const statement of parts) {
            const cleaned = statement.trim();
            // Ignorar partes vazias, comentários e linha final
            if (cleaned &&
                !cleaned.startsWith('--') &&
                !cleaned.toLowerCase().startsWith('select \'triggers')) {
              await this.connection.query(cleaned);
              if (showOutput && cleaned.toLowerCase().includes('create trigger')) {
                const match = cleaned.match(/create trigger\s+(\w+)/i);
                if (match) console.log(`  ✓ Trigger ${match[1]} criado`);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Erro na execução SQL com DELIMITER:', error.message);
      throw error;
    }
  }

  /**
   *  Executa SQL diretamente
   */
  async executeSQL(sqlContent, showOutput = true) {
    try {
      // Dividir por statements (separados por ;)
      const allStatements = sqlContent.split(';');

      const statements = allStatements
        .map(stmt => stmt.trim())
        .filter(stmt => {
          const cleaned = stmt.replace(/\n/g, ' ').trim();
          // Aceitar statements que contêm comandos SQL válidos
          const sqlCommands = [
            'create ', 'insert ', 'use ', 'select ', 'update ', 'delete ',
            'alter ', 'drop ', 'truncate ', 'set ', 'show ', '--'
          ];
          const hasValidCommand = sqlCommands.some(cmd => cleaned.toLowerCase().includes(cmd));
          const isValid = cleaned.length > 0 && (hasValidCommand || cleaned.startsWith('--'));

          return isValid;
        });


      for (const statement of statements) {
        if (statement.trim()) {
          // Usar sempre query() para evitar problemas com prepared statements nos scripts
          // Scripts SQL não precisam de prepared statements por motivos de segurança
          await this.connection.query(statement);

          if (showOutput && statement.toLowerCase().includes('create table')) {
            const match = statement.match(/create table(?:\s+if not exists)?\s+(\w+)/i);
            if (match) {
              console.log(`  ✓ Tabela ${match[1]} criada`);
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Erro na execução SQL:', error.message);
      throw error;
    }
  }

  /**
   *  Conta registros em tabelas
   */
  async showTableStats(tableNames) {
    console.log('\n📊 Estatísticas das tabelas:');

    for (const table of tableNames) {
      try {
        const [result] = await this.connection.execute(`SELECT COUNT(*) as total FROM ${table}`);
        console.log(`📋 ${table}: ${result[0].total} registros`);
      } catch (error) {
        console.log(`⚠️  ${table}: ${error.message}`);
      }
    }
  }

  /**
Verifica Foreign Keys
   */
  async showForeignKeys() {
    try {
      console.log('\n🔗 Foreign Keys configuradas:');

      const [foreignKeys] = await this.connection.execute(`
        SELECT
          TABLE_NAME,
          COLUMN_NAME,
          REFERENCED_TABLE_NAME,
          REFERENCED_COLUMN_NAME
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = 'casamais_db'
        AND REFERENCED_TABLE_NAME IS NOT NULL
      `);

      if (foreignKeys.length === 0) {
        console.log('  Nenhuma Foreign Key encontrada');
      } else {
        foreignKeys.forEach(fk => {
          console.log(`  ✓ ${fk.TABLE_NAME}.${fk.COLUMN_NAME} → ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
        });
      }
    } catch (error) {
      console.log('⚠️ Erro ao verificar Foreign Keys:', error.message);
    }
  }
}

module.exports = SQLExecutor;
