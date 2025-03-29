// backend/routes/posts.js
const express = require('express');
const router = express.Router(); // Cria um objeto Router do Express
const pool = require('../config/db'); // Importa o pool de conexões do banco de dados

// --- ROTAS CRUD PARA POSTS ---

// ROTA GET / - Buscar todos os posts
router.get('/', async (req, res) => {
  try {
    const sql = "SELECT * FROM posts ORDER BY created_at DESC";
    const [results] = await pool.query(sql);
    // Para GET all, também precisamos garantir que categories seja um array
    const parsedResults = results.map(post => ({
        ...post,
        categories: (typeof post.categories === 'string')
                      ? JSON.parse(post.categories)
                      : post.categories ?? []
    }));
    res.json(parsedResults);
  } catch (error) {
    console.error('Erro ao buscar posts:', error);
    res.status(500).json({ message: "Erro interno do servidor ao buscar posts.", error: error.message });
  }
});

// ROTA GET /:id - Buscar um post específico pelo ID
router.get('/:id', async (req, res) => {
  const postId = req.params.id;
  if (isNaN(parseInt(postId))) {
       return res.status(400).json({ message: "ID do post inválido." });
  }
  try {
    const sql = "SELECT * FROM posts WHERE id = ?";
    const [results] = await pool.query(sql, [postId]);
    if (results.length === 0) {
      return res.status(404).json({ message: "Post não encontrado." });
    }
     // Parse categories para o post único retornado
    const post = {
        ...results[0],
        categories: (typeof results[0].categories === 'string')
                      ? JSON.parse(results[0].categories)
                      : results[0].categories ?? []
    };
    res.json(post); // Envia o post com categories parseado
  } catch (error) {
    console.error(`Erro ao buscar post com ID ${postId}:`, error);
    res.status(500).json({ message: "Erro interno do servidor ao buscar o post.", error: error.message });
  }
});

// ROTA POST / - Criar um novo post
router.post('/', async (req, res) => {
  const { title, excerpt, content, author, date, categories } = req.body;
  if (!title) {
    return res.status(400).json({ message: "O título é obrigatório." });
  }
  try {
    const sql = `
      INSERT INTO posts (title, excerpt, content, author, date, categories)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [
      title,
      excerpt || null,
      content || null,
      author || null,
      date || null,
      JSON.stringify(categories || []) // Salva categories como string JSON
    ];
    const [results] = await pool.query(sql, values);
    res.status(201).json({
      message: "Post criado com sucesso!",
      insertedId: results.insertId
    });
  } catch (error) {
    console.error('Erro ao criar post:', error);
    res.status(500).json({ message: "Erro interno do servidor ao criar o post.", error: error.message });
  }
});

// ROTA PUT /:id - Atualizar um post existente
router.put('/:id', async (req, res) => {
  const postId = req.params.id;
  const { title, excerpt, content, author, date, categories } = req.body;

  if (isNaN(parseInt(postId))) {
    return res.status(400).json({ message: "ID do post inválido." });
  }
  if (!title) {
      return res.status(400).json({ message: "O título é obrigatório ao atualizar." });
  }

  try {
    const sql = `
      UPDATE posts
      SET title = ?, excerpt = ?, content = ?, author = ?, date = ?, categories = ?
      WHERE id = ?
    `;
    const values = [
      title,
      excerpt || null,
      content || null,
      author || null,
      date || null,
      JSON.stringify(categories || []), // Salva categories como string JSON
      postId
    ];
    const [results] = await pool.query(sql, values);

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Post não encontrado para atualização." });
    }

    // Buscar o post atualizado para retornar
    const [updatedPostResult] = await pool.query("SELECT * FROM posts WHERE id = ?", [postId]);
    if (updatedPostResult.length === 0) {
        return res.status(404).json({ message: "Post não encontrado após atualização." });
    }
     // Parse categories do post buscado
     const updatedPost = {
         ...updatedPostResult[0],
         categories: (typeof updatedPostResult[0].categories === 'string')
                       ? JSON.parse(updatedPostResult[0].categories)
                       : updatedPostResult[0].categories ?? []
     };

    res.status(200).json({
      message: "Post atualizado com sucesso!",
      post: updatedPost // Retorna o post atualizado com categories parseado
    });

  } catch (error) {
    console.error(`Erro ao atualizar post com ID ${postId}:`, error);
    res.status(500).json({ message: "Erro interno do servidor ao atualizar o post.", error: error.message });
  }
});

// ROTA DELETE /:id - Deletar um post existente
router.delete('/:id', async (req, res) => {
  const postId = req.params.id;
  if (isNaN(parseInt(postId))) {
    return res.status(400).json({ message: "ID do post inválido." });
  }
  try {
    const sql = "DELETE FROM posts WHERE id = ?";
    const [results] = await pool.query(sql, [postId]);
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Post não encontrado para deletar." });
    }
    res.status(200).json({ message: "Post deletado com sucesso!" });
  } catch (error) {
    console.error(`Erro ao deletar post com ID ${postId}:`, error);
    res.status(500).json({ message: "Erro interno do servidor ao deletar o post.", error: error.message });
  }
});


module.exports = router; // Exporta o router com todas as rotas definidas