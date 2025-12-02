const express = require('express');
const cors = require('cors');
const medicamentoRoutes = require('./routes/medicamentoRoutes');
const doacaoRoutes = require('./routes/doacaoRoutes');
const assistidasRoutes = require('./routes/assistidasRoutes');
const doadorRoutes = require('./routes/doadorRoutes');
const unidadeMedidaRoutes = require('./routes/unidadeMedidaRoutes');
const tipoDespesaRoutes = require('./routes/tipoDespesaRoutes');
const despesaRoutes = require('./routes/despesaRoutes');
const authRoutes = require('./routes/authRoutes');
const approvalRoutes = require('./routes/approvalRoutes');
const activationRoutes = require('./routes/activationRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const substanciasRoutes = require('./routes/substanciasRoutes');
const hprRoutes = require('./routes/hprRoutes');
const saidaRoutes = require('./routes/saidaRoutes');

// Novas rotas para requisitos funcionais
const internacaoRoutes = require('./routes/internacaoRoutes');
const caixaRoutes = require('./routes/caixaRoutes');
const consultaRoutes = require('./routes/consultaRoutes');
const relatorioRoutes = require('./routes/relatorioRoutes');
const medicosRoutes = require('./routes/medicosRoutes');
const especialidadesRoutes = require('./routes/especialidadesRoutes');
const campanhaRoutes = require('./routes/campanhaRoutes');


const app = express();

//middlewares
app.use(cors());
app.use(express.json());


//routes
app.use('/api/auth', authRoutes);
app.use('/api/approval', approvalRoutes);
app.use('/api/activation', activationRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/medicamentos', medicamentoRoutes);
app.use('/api/doacoes', doacaoRoutes);
app.use('/api/assistidas', assistidasRoutes);
app.use('/api/doadores', doadorRoutes);
app.use('/api/unidades_medida', unidadeMedidaRoutes);
app.use('/api/tipos-despesas', tipoDespesaRoutes);
app.use('/api/despesas', despesaRoutes);
app.use('/api/substancias', substanciasRoutes);
app.use('/api/saidas', saidaRoutes);
app.use('/api/hpr', hprRoutes);

// Novas rotas dos requisitos funcionais
app.use('/api/internacoes', internacaoRoutes);
app.use('/api/caixa', caixaRoutes);
app.use('/api/consultas', consultaRoutes);
app.use('/api/relatorios', relatorioRoutes);
app.use('/api/medicos', medicosRoutes);
app.use('/api/especialidades', especialidadesRoutes);
app.use('/api/campanhas', campanhaRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API Casa+ funcionando!' });
})

module.exports = app;
