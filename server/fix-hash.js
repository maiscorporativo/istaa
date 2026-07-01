const bcrypt = require('bcrypt');
const db = require('./db');

async function fixHash() {
  const password = 'Admin@123';
  const newHash = await bcrypt.hash(password, 10);
  
  await db.query('UPDATE users SET password_hash = ? WHERE email = ?', [newHash, 'paulo.cardoso@maiscorporativo.tur.br']);
  
  console.log("Senha corrigida no banco para:", password);
  process.exit();
}
fixHash();
