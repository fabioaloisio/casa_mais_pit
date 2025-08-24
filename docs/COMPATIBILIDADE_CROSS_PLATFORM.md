# Compatibilidade Cross-Platform

Configurações para garantir consistência entre sistemas operacionais.

## Arquivos

- `.gitattributes` - Line endings e encoding
- `.editorconfig` - Configuração de editores  
- `.vscode/settings.json` - Configurações VS Code

### `.gitattributes`

Controla como o Git trata diferentes tipos de arquivo:

```gitattributes
# Normalize line endings for all text files
* text=auto

# Ensure Markdown files use LF line endings on all platforms
*.md text eol=lf

# Ensure other text files use consistent line endings
*.js text eol=lf
*.json text eol=lf
*.css text eol=lf
*.html text eol=lf
*.jsx text eol=lf
*.sql text eol=lf
*.sh text eol=lf

# Force UTF-8 encoding for documentation
*.md text charset=utf-8
README.md text charset=utf-8

# Binary files
*.png binary
*.jpg binary
*.jpeg binary
*.gif binary
*.ico binary
*.pdf binary
```

### `.editorconfig`

Configurações consistentes para editores de código:

```ini
# EditorConfig helps maintain consistent coding styles
root = true

# All files
[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

# Markdown files
[*.md]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = false

# JavaScript files
[*.{js,jsx}]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
```

### `.vscode/settings.json`

Configurações específicas para o VS Code (locais ao projeto):

```json
{
  "files.encoding": "utf8",
  "files.eol": "\n", 
  "files.insertFinalNewline": true,
  "files.trimTrailingWhitespace": true,
  "editor.insertSpaces": true,
  "editor.detectIndentation": false,
  "editor.tabSize": 2,
  "[markdown]": {
    "files.trimTrailingWhitespace": false,
    "editor.wordWrap": "on",
    "editor.quickSuggestions": false
  }
}
```

## ⚙️ Configurações Git

### Configurações Aplicadas

```bash
# Normaliza line endings no commit (macOS/Linux)
git config core.autocrlf input

# Avisa sobre conversões de line endings
git config core.safecrlf warn
```

### Para Usuários Windows

```bash
# Configuração recomendada para Windows
git config core.autocrlf true
```

## 🔧 Como Funciona

### Line Endings

| Sistema   | Padrão      | Configuração |
|-----------|-------------|--------------|
| Windows   | CRLF (`\r\n`) | Convertido para LF |
| macOS     | LF (`\n`)     | Mantido LF |
| Linux     | LF (`\n`)     | Mantido LF |

### Encoding

- **Todos os arquivos de texto**: UTF-8
- **Arquivos Markdown**: UTF-8 com BOM implícito
- **Arquivos binários**: Não processados

## 🚀 Benefícios

### ✅ **Consistência**
- Mesmo comportamento em todos os sistemas
- Formatação preservada entre commits
- Caracteres especiais sempre funcionam

### ✅ **Colaboração**
- Desenvolvedores em diferentes OS podem colaborar
- Sem conflitos de merge por line endings
- Documentação sempre legível

### ✅ **Automação**
- Git normaliza automaticamente
- Editores aplicam configurações automaticamente
- Sem necessidade de configuração manual

## 🛠️ Configuração para Novos Desenvolvedores

### 1. Configuração Git Inicial

```bash
# Para macOS/Linux
git config --global core.autocrlf input

# Para Windows
git config --global core.autocrlf true

# Opcional: avisos sobre conversões
git config --global core.safecrlf warn
```

### 2. Editor de Código

**VS Code** (recomendado):
- O projeto já inclui `.vscode/settings.json` com configurações locais
- **Importante**: Configurações locais substituem as globais automaticamente
- Não é necessário configurar manualmente

**Outros editores**: Instalar plugin EditorConfig

### 3. Verificação

```bash
# Clonar o projeto
git clone <url-do-repo>

# Verificar configurações
git config --list | grep -E "(autocrlf|safecrlf)"

# Testar arquivos markdown
cat README.md | head -5
```

## 🐛 Resolução de Problemas

### Caracteres Estranhos em Markdown

**Problema**: Emojis e acentos aparecem como `=�` ou símbolos estranhos

**Solução**:
1. Verificar se o editor está em UTF-8
2. Recriar o arquivo com encoding correto
3. Verificar configurações do Git

### Conflitos de Line Ending

**Problema**: Git mostra mudanças em arquivos não modificados

**Solução**:
```bash
# Normalizar todos os arquivos
git add --renormalize .
git commit -m "Normalize line endings"
```

### Editor Não Aplica Configurações

**Problema**: EditorConfig não funciona

**Solução**:
1. Instalar plugin EditorConfig no editor
2. Verificar se `.editorconfig` está no root do projeto
3. Reiniciar o editor

## 📚 Referências Técnicas

### Especificações

- **EditorConfig**: https://editorconfig.org/
- **Git Attributes**: https://git-scm.com/docs/gitattributes
- **UTF-8 Encoding**: https://tools.ietf.org/html/rfc3629

### Ferramentas Suportadas

- **VS Code**: Suporte nativo para EditorConfig
- **IntelliJ/WebStorm**: Plugin EditorConfig
- **Sublime Text**: Plugin EditorConfig
- **Vim/Neovim**: Plugin editorconfig-vim

## 🔄 Manutenção

### Verificação Periódica

```bash
# Verificar arquivos com problemas de encoding
file *.md

# Verificar line endings
od -c README.md | head -5

# Verificar configurações Git
git config --list | grep -E "(autocrlf|safecrlf|eol)"
```

### Atualização de Configurações

Quando adicionar novos tipos de arquivo:

1. Atualizar `.gitattributes`
2. Atualizar `.editorconfig`
3. Testar em diferentes sistemas
4. Documentar mudanças neste arquivo

---

**Configurado para garantir experiência consistente em todos os sistemas operacionais! 🚀**