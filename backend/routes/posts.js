// backend/routes/posts.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// ROTA GET / - Buscar todos os posts (já implementada)
router.get('/', async (req, res) => {
  try {
    const sql = "SELECT * FROM posts ORDER BY created_at DESC";
    const [results] = await pool.query(sql);
    res.json(results);
  } catch (error) {
    console.error('Erro ao buscar posts:', error);
    res.status(500).json({ message: "Erro interno do servidor ao buscar posts.", error: error.message });
  }
});

// NOVA ROTA: GET /:id - Buscar um post específico pelo ID
// :id define um parâmetro de rota chamado 'id'
router.get('/:id', async (req, res) => {
  // Pega o ID dos parâmetros da requisição (vem da URL)
  const postId = req.params.id;

  // Validação básica: verifica se o ID é um número
  // (poderia ser mais robusta, mas ajuda a evitar erros básicos)
  if (isNaN(parseInt(postId))) {
       return res.status(400).json({ message: "ID do post inválido." });
  }

  try {
    // Query SQL para buscar um post pelo ID
    // Usamos '?' como placeholder para segurança (evita SQL Injection)
    const sql = "SELECT * FROM posts WHERE id = ?";

    // Executa a query passando o postId como valor para o placeholder '?'
    const [results] = await pool.query(sql, [postId]);

    // Verifica se algum post foi encontrado
    if (results.length === 0) {
      // Se não encontrou, envia resposta 404 (Not Found)
      return res.status(404).json({ message: "Post não encontrado." });
    }

    // Se encontrou, envia o primeiro (e único) resultado
    // Lembre-se que categories virá como string se for JSON no DB
    res.json(results[0]);

  } catch (error) {
    // Em caso de erro no banco de dados
    console.error(`Erro ao buscar post com ID ${postId}:`, error);
    res.status(500).json({ message: "Erro interno do servidor ao buscar o post.", error: error.message });
  }
});

// --- Adicionar outras rotas (POST, PUT, DELETE) aqui depois ---

module.exports = router;