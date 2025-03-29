// backend/routes/posts.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// ROTA GET / (corresponderá a GET /api/posts) - Buscar todos os posts
router.get('/', async (req, res) => {
  try {
    // Define a query SQL para selecionar todos os posts, ordenados pelos mais recentes
    const sql = "SELECT * FROM posts ORDER BY created_at DESC";

    // Executa a query usando o pool de conexões
    // pool.query retorna [results, fields], pegamos apenas os results
    const [results] = await pool.query(sql);

    // Envia os resultados (lista de posts) como resposta JSON
    // Nota: A coluna 'categories' virá como string se for JSON no DB,
    // o frontend precisará fazer JSON.parse() se necessário.
    res.json(results);

  } catch (error) {
    // Em caso de erro no banco de dados ou outro problema
    console.error('Erro ao buscar posts:', error);
    // Envia uma resposta de erro genérica com status 500
    res.status(500).json({ message: "Erro interno do servidor ao buscar posts.", error: error.message });
  }
});

// --- Adicionar outras rotas (GET /:id, POST, PUT, DELETE) aqui depois ---

module.exports = router;