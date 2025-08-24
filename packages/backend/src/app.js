const express = require('express');
const cors = require('cors');
const medicamentoRoutes = require('./routes/medicamentoRoutes');
const doacaoRoutes = require('./routes/doacaoRoutes');
const assistidasRoutes = require('./routes/assistidasRoutes');
const doadorRoutes = require('./routes/doadorRoutes');
const unidadeMedidaRoutes = require('./routes/unidadeMedidaRoutes');
const tipoDespesaRoutes = require('./routes/tipoDespesaRoutes');
const despesaRoutes = require('./routes/despesaRoutes');

const app = express();

//middlewares
app.use(cors());
app.use(express.json());


//routes
app.use('/api/medicamentos', medicamentoRoutes);
app.use('/api/doacoes', doacaoRoutes);
app.use('/api/assistidas', assistidasRoutes);
app.use('/api/doadores', doadorRoutes);
app.use('/api/unidades_medida', unidadeMedidaRoutes);
app.use('/api/tipos-despesas', tipoDespesaRoutes);
app.use('/api/despesas', despesaRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API Casa+ funcionando!' });
})

module.exports = app;
