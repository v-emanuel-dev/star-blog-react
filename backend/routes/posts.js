const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

router.get('/', async (req, res) => {
  try {
    const sql = "SELECT id, title, excerpt, author, date, categories, created_at FROM posts ORDER BY created_at DESC";
    const [results] = await pool.query(sql);
    const parsedResults = results.map(post => ({
      ...post,
      categories: (typeof post.categories === 'string') ? JSON.parse(post.categories) : post.categories ?? []
    }));
    res.json(parsedResults);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: "Internal server error while fetching posts.", error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  const postId = req.params.id;
  if (isNaN(parseInt(postId))) {
    return res.status(400).json({ message: "Invalid post ID." });
  }
  try {
    const sql = "SELECT * FROM posts WHERE id = ?";
    const [results] = await pool.query(sql, [postId]);
    if (results.length === 0) {
      return res.status(404).json({ message: "Post not found." });
    }
    const post = {
      ...results[0],
      categories: (typeof results[0].categories === 'string') ? JSON.parse(results[0].categories) : results[0].categories ?? []
    };
    res.json(post);
  } catch (error) {
    console.error(`Error fetching post with ID ${postId}:`, error);
    res.status(500).json({ message: "Internal server error while fetching the post.", error: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  const { title, excerpt, content, author, date, categories } = req.body;
  if (!title) {
    return res.status(400).json({ message: "Title is required." });
  }
  try {
    const sql = `
      INSERT INTO posts (title, excerpt, content, author, date, categories)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [
      title, excerpt || null, content || null, author || null, date || null, JSON.stringify(categories || [])
    ];
    const [results] = await pool.query(sql, values);
    res.status(201).json({
      message: "Post successfully created!",
      insertedId: results.insertId
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: "Internal server error while creating the post.", error: error.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  const postId = req.params.id;
  const { title, excerpt, content, author, date, categories } = req.body;
  if (isNaN(parseInt(postId))) {
    return res.status(400).json({ message: "Invalid post ID." });
  }
  if (!title) {
      return res.status(400).json({ message: "Title is required for updates." });
  }
  try {
    const sql = `
      UPDATE posts
      SET title = ?, excerpt = ?, content = ?, author = ?, date = ?, categories = ?
      WHERE id = ?
    `;
    const values = [
      title, excerpt || null, content || null, author || null, date || null, JSON.stringify(categories || []), postId
    ];
    const [results] = await pool.query(sql, values);
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Post not found for update." });
    }
    const [updatedPostResult] = await pool.query("SELECT * FROM posts WHERE id = ?", [postId]);
    if (updatedPostResult.length === 0) {
        return res.status(404).json({ message: "Post not found after update." });
    }
     const updatedPost = {
         ...updatedPostResult[0],
         categories: (typeof updatedPostResult[0].categories === 'string') ? JSON.parse(updatedPostResult[0].categories) : updatedPostResult[0].categories ?? []
     };
    res.status(200).json({
      message: "Post successfully updated!",
      post: updatedPost
    });
  } catch (error) {
    console.error(`Error updating post with ID ${postId}:`, error);
    res.status(500).json({ message: "Internal server error while updating the post.", error: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  const postId = req.params.id;
  if (isNaN(parseInt(postId))) {
    return res.status(400).json({ message: "Invalid post ID." });
  }
  try {
    const sql = "DELETE FROM posts WHERE id = ?";
    const [results] = await pool.query(sql, [postId]);
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Post not found for deletion." });
    }
    res.status(200).json({ message: "Post successfully deleted!" });
  } catch (error) {
    console.error(`Error deleting post with ID ${postId}:`, error);
    res.status(500).json({ message: "Internal server error while deleting the post.", error: error.message });
  }
});

module.exports = router;