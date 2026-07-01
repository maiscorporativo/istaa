const db = require('./db');

async function test() {
  try {
    console.log("Tentando conectar ao banco de dados...");
    const [rows] = await db.query('SELECT 1 + 1 AS result');
    console.log("Conexão bem-sucedida!", rows);
    
    console.log("Verificando se a tabela users existe e tem o usuário...");
    const [users] = await db.query('SELECT email FROM users');
    console.log("Usuários no banco:", users);
    
  } catch (err) {
    console.error("ERRO GRAVE AO CONECTAR NO BANCO:", err.message);
  } finally {
    process.exit();
  }
}

test();
