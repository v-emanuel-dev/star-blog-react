const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { protect } = require("../middleware/authMiddleware");

router.get('/', async (req, res) => {
  try {
    // Note: This won't include likedByCurrentUser for performance reasons on list view
    // Frontend would need a separate call or check based on stored likes if needed
    const sql = `
        SELECT
            p.id, p.title, p.excerpt, p.author, p.date, p.categories,
            p.created_at, p.updated_at,
            COUNT(pl.user_id) AS likes
        FROM posts p
        LEFT JOIN post_likes pl ON p.id = pl.post_id
        GROUP BY p.id
        ORDER BY p.created_at DESC
    `;
    const [results] = await pool.query(sql);

    const finalResults = results.map(post => ({
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      author: post.author,
      date: post.date,
      categories: (typeof post.categories === 'string') ? JSON.parse(post.categories) : post.categories ?? [],
      likes: Number(post.likes),
      createdAt: post.created_at,
      updatedAt: post.updated_at
    }));
    res.json(finalResults);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: "Internal server error while fetching posts.", error: error.message });
  }
});
router.get("/:id", async (req, res) => {
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
      categories:
        typeof results[0].categories === "string"
          ? JSON.parse(results[0].categories)
          : results[0].categories ?? [],
    };
    res.json(post);
  } catch (error) {
    console.error(`Error fetching post with ID ${postId}:`, error);
    res
      .status(500)
      .json({
        message: "Internal server error while fetching the post.",
        error: error.message,
      });
  }
});

router.post("/", protect, async (req, res) => {
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
      title,
      excerpt || null,
      content || null,
      author || null,
      date || null,
      JSON.stringify(categories || []),
    ];
    const [results] = await pool.query(sql, values);
    res.status(201).json({
      message: "Post successfully created!",
      insertedId: results.insertId,
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res
      .status(500)
      .json({
        message: "Internal server error while creating the post.",
        error: error.message,
      });
  }
});

router.put("/:id", protect, async (req, res) => {
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
      title,
      excerpt || null,
      content || null,
      author || null,
      date || null,
      JSON.stringify(categories || []),
      postId,
    ];
    const [results] = await pool.query(sql, values);
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Post not found for update." });
    }
    const [updatedPostResult] = await pool.query(
      "SELECT * FROM posts WHERE id = ?",
      [postId]
    );
    if (updatedPostResult.length === 0) {
      return res.status(404).json({ message: "Post not found after update." });
    }
    const updatedPost = {
      ...updatedPostResult[0],
      categories:
        typeof updatedPostResult[0].categories === "string"
          ? JSON.parse(updatedPostResult[0].categories)
          : updatedPostResult[0].categories ?? [],
    };
    res.status(200).json({
      message: "Post successfully updated!",
      post: updatedPost,
    });
  } catch (error) {
    console.error(`Error updating post with ID ${postId}:`, error);
    res
      .status(500)
      .json({
        message: "Internal server error while updating the post.",
        error: error.message,
      });
  }
});

router.delete("/:id", protect, async (req, res) => {
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
    res
      .status(500)
      .json({
        message: "Internal server error while deleting the post.",
        error: error.message,
      });
  }
});

router.get("/:postId/comments", async (req, res) => {
  const postId = req.params.postId;

  // Validate postId
  if (isNaN(parseInt(postId))) {
    return res.status(400).json({ message: "Invalid post ID." });
  }

  try {
    // Query comments and join with users table to get commenter info
    const sql = `
          SELECT
              c.id,
              c.content,
              c.created_at,
              c.user_id AS userId,
              u.name AS userName,
              u.avatar_url AS userAvatarUrl
          FROM comments c
          JOIN users u ON c.user_id = u.id
          WHERE c.post_id = ?
          ORDER BY c.created_at ASC
      `;
    const [comments] = await pool.query(sql, [postId]);

    // Map snake_case field from DB to camelCase for frontend consistency
    const mappedComments = comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.created_at, // <-- Map to camelCase
      user: {
        id: comment.userId,
        name: comment.userName,
        avatarUrl: comment.userAvatarUrl, // Already camelCase
      },
    }));

    res.json(mappedComments);
  } catch (error) {
    console.error(`Error fetching comments for post ${postId}:`, error);
    res
      .status(500)
      .json({
        message: "Internal server error while fetching comments.",
        error: error.message,
      });
  }
});

router.post("/:postId/comments", protect, async (req, res) => {
  const postId = req.params.postId;
  const userId = req.user.id; // Get user ID from authenticated user (via 'protect' middleware)
  const { content } = req.body; // Get comment content from request body

  // Validate postId
  if (isNaN(parseInt(postId))) {
    return res.status(400).json({ message: "Invalid post ID." });
  }
  // Validate content
  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return res
      .status(400)
      .json({ message: "Comment content cannot be empty." });
  }

  try {
    // 1. Insert the new comment
    const insertSql =
      "INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)";
    const [results] = await pool.query(insertSql, [
      postId,
      userId,
      content.trim(),
    ]);
    const newCommentId = results.insertId;

    // 2. Fetch the newly created comment WITH user info to return it
    const selectSql = `
          SELECT
              c.id, c.content, c.created_at,
              u.id as userId, u.name as userName, u.avatar_url as userAvatarUrl
          FROM comments c
          JOIN users u ON c.user_id = u.id
          WHERE c.id = ?
      `;
    const [newCommentData] = await pool.query(selectSql, [newCommentId]);

    if (newCommentData.length === 0) {
      // Should not happen if insert succeeded
      throw new Error("Failed to retrieve newly created comment.");
    }

    // Map to consistent frontend format
    const createdComment = {
      id: newCommentData[0].id,
      content: newCommentData[0].content,
      createdAt: newCommentData[0].created_at, // <-- Map to camelCase
      user: {
        id: newCommentData[0].userId,
        name: newCommentData[0].userName,
        avatarUrl: newCommentData[0].userAvatarUrl, // Already camelCase
      },
    };

    res.status(201).json(createdComment); // Return the full new comment object
  } catch (error) {
    console.error(
      `Error adding comment for post ${postId} by user ${userId}:`,
      error
    );
    // Check for foreign key constraint error (if post_id doesn't exist)
    if (
      error.code === "ER_NO_REFERENCED_ROW_2" &&
      error.message.includes("fk_comment_post")
    ) {
      return res
        .status(404)
        .json({ message: "Cannot add comment: Post not found." });
    }
    res
      .status(500)
      .json({
        message: "Internal server error while adding comment.",
        error: error.message,
      });
  }
});

router.post('/:postId/like', protect, async (req, res) => {
  const postId = req.params.postId;
  const userId = req.user.id;
  if (isNaN(parseInt(postId))) { return res.status(400).json({ message: "Invalid post ID." }); }
  let connection;
  try {
      connection = await pool.getConnection();
      await connection.beginTransaction();
      const checkSql = "SELECT COUNT(*) as count FROM post_likes WHERE user_id = ? AND post_id = ?";
      const [rows] = await connection.query(checkSql, [userId, postId]);
      const alreadyLiked = rows[0].count > 0;
      let userNowLikes;
      if (alreadyLiked) {
          const deleteSql = "DELETE FROM post_likes WHERE user_id = ? AND post_id = ?";
          await connection.query(deleteSql, [userId, postId]);
          userNowLikes = false;
      } else {
          const insertSql = "INSERT INTO post_likes (user_id, post_id) VALUES (?, ?)";
          await connection.query(insertSql, [userId, postId]);
          userNowLikes = true;
      }
      const countSql = "SELECT COUNT(*) as totalLikes FROM post_likes WHERE post_id = ?";
      const [countResult] = await connection.query(countSql, [postId]);
      const totalLikes = countResult[0].totalLikes;
      await connection.commit();
      res.status(200).json({ message: userNowLikes ? "Post liked successfully!" : "Post unliked successfully!", liked: userNowLikes, likes: totalLikes });
  } catch (error) {
      if (connection) await connection.rollback();
      console.error(`Error toggling like for post ${postId} by user ${userId}:`, error);
       if (error.code === 'ER_NO_REFERENCED_ROW_2') { return res.status(404).json({ message: "Post not found to like/unlike." }); }
      res.status(500).json({ message: "Internal server error while toggling like.", error: error.message });
  } finally { if (connection) connection.release(); }
});

module.exports = router;
