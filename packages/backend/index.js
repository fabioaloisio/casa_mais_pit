require('dotenv').config({ path: '../../.env' });
const app = require('./src/app.js');
const campanhaStatusService = require('./src/services/campanhaStatusService');

const PORT = process.env.PORT || 3003;

app.listen(PORT, async () => {
  console.log(`Servidor escutando em: http://localhost:${PORT}`);

  // Atualizar status das campanhas ao iniciar o servidor
  try {
    await campanhaStatusService.atualizarStatusCampanhas();

    // Configurar para executar a cada hora
    setInterval(async () => {
      await campanhaStatusService.atualizarStatusCampanhas();
    }, 60 * 60 * 1000); // 1 hora

  } catch (error) {
    console.error('Erro ao atualizar status das campanhas:', error);
  }
})
