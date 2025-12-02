const bcrypt = require('bcrypt');

async function generateHashes() {
  // Hash para senha "123456"
  const hash123456 = await bcrypt.hash('123456', 10);
  console.log('Hash para senha "123456":', hash123456);

  // Hash para senha "senha123" (para confirmar)
  const hashSenha123 = await bcrypt.hash('senha123', 10);
  console.log('Hash para senha "senha123":', hashSenha123);

  // Verificar se o hash existente está correto
  const isValid = await bcrypt.compare('senha123', '$2b$10$7toN9KYo2miv3yRV4OqrDebG1G5SjMMjxhFXgycgo86XfcxOkhXtC');
  console.log('Hash existente para senha123 está correto?', isValid);
}

generateHashes();