// backend/config/db.js
const mysql = require('mysql2/promise'); // Importa a versão com suporte a Promises
require('dotenv').config(); // Carrega variáveis do .env (redundante se já carregado no server.js, mas seguro)

// Cria um "Pool de Conexões" - mais eficiente que criar conexões individuais
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true, // Espera se todas as conexões estiverem em uso
  connectionLimit: 10, // Número máximo de conexões no pool
  queueLimit: 0 // Fila de espera ilimitada (0)
});

// Função para testar a conexão (opcional, mas útil)
async function testConnection() {
  let connection;
  try {
    connection = await pool.getConnection(); // Tenta pegar uma conexão do pool
    console.log('Conexão com o banco de dados MySQL bem-sucedida!');
  } catch (error) {
    console.error('Erro ao conectar com o banco de dados:', error);
  } finally {
    if (connection) {
      connection.release(); // Libera a conexão de volta para o pool
      console.log('Conexão liberada.');
    }
  }
}

// Testa a conexão assim que o módulo é carregado (opcional)
// testConnection();

// Exporta o pool para que outros módulos possam usá-lo para fazer queries
module.exports = pool;