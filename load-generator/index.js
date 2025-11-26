const mysql = require('mysql2/promise');

const {
  MYSQL_HOST,
  MYSQL_PORT,
  MYSQL_USER,
  MYSQL_PASSWORD,
  MYSQL_DATABASE
} = process.env;

console.log('🚀 Load Generator iniciado');
console.log(`📊 Conectando ao MySQL: ${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DATABASE}`);

async function waitForDatabase(pool, maxRetries = 30) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await pool.query('SELECT 1');
      console.log('✅ Conexão com banco estabelecida');
      return true;
    } catch (err) {
      console.log(`⏳ Tentativa ${i + 1}/${maxRetries} - Aguardando banco... ${err.message}`);
      await new Promise(res => setTimeout(res, 2000));
    }
  }
  throw new Error('❌ Não foi possível conectar ao banco após várias tentativas');
}

async function main() {
  const pool = mysql.createPool({
    host: MYSQL_HOST,
    port: parseInt(MYSQL_PORT) || 3306,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
  });

  // Aguardar banco estar disponível
  await waitForDatabase(pool);

  // Create table if not exists
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS observacao (
      id INT AUTO_INCREMENT PRIMARY KEY,
      valor VARCHAR(255),
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    console.log('📋 Tabela observacao verificada/criada');
  } catch (err) {
    console.error('❌ Erro ao criar tabela:', err);
    process.exit(1);
  }

  let operationCount = 0;
  console.log('🔄 Iniciando operações CRUD...');

  while (true) {
    try {
      // Insert
      const [insertResult] = await pool.query('INSERT INTO observacao (valor) VALUES (?)', [Math.random().toString(36).substring(2)]);
      const insertedId = insertResult.insertId;

      // Read
      await pool.query('SELECT * FROM observacao WHERE id = ?', [insertedId]);

      // Update
      await pool.query('UPDATE observacao SET valor = ? WHERE id = ?', [Math.random().toString(36).substring(2), insertedId]);

      // Delete
      await pool.query('DELETE FROM observacao WHERE id = ?', [insertedId]);

      operationCount++;
      if (operationCount % 10 === 0) {
        console.log(`✨ ${operationCount} operações CRUD executadas`);
      }

      // Wait random interval (0.5s - 2s)
      await new Promise(res => setTimeout(res, 500 + Math.random() * 1500));
    } catch (err) {
      console.error('⚠️ Erro na operação CRUD:', err.message);
      await new Promise(res => setTimeout(res, 5000));
    }
  }
}

main();
