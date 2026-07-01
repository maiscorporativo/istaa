const mysql = require('mysql2/promise');
const fs = require('fs');

async function exportData() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'guia_parceiros'
  });

  const tables = ['users', 'organizations', 'tags', 'organization_tags'];
  let sqlDump = '';

  for (const table of tables) {
    const [rows] = await connection.query(`SELECT * FROM ${table}`);
    if (rows.length === 0) continue;

    for (const row of rows) {
      const keys = Object.keys(row).map(k => `\`${k}\``).join(', ');
      const values = Object.values(row).map(v => {
        if (v === null) return 'NULL';
        if (v instanceof Date) {
          const pad = (n) => n < 10 ? '0' + n : n;
          const dateStr = `${v.getFullYear()}-${pad(v.getMonth() + 1)}-${pad(v.getDate())} ${pad(v.getHours())}:${pad(v.getMinutes())}:${pad(v.getSeconds())}`;
          return `'${dateStr}'`;
        }
        if (typeof v === 'string') return `'${v.replace(/'/g, "''")}'`;
        return v;
      }).join(', ');
      sqlDump += `INSERT IGNORE INTO \`${table}\` (${keys}) VALUES (${values});\n`;
    }
  }

  fs.writeFileSync('meu_banco_exportado.sql', sqlDump);
  console.log('Banco exportado com sucesso para meu_banco_exportado.sql!');
  await connection.end();
}

exportData().catch(console.error);
