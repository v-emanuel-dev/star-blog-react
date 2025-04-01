const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { protect } = require("../middleware/authMiddleware");

router.get('/', async (req, res) => {
  try {
    const sql = `
        SELECT
            p.id, p.title, p.excerpt, p.date, p.categories,
            p.created_at, p.updated_at,
            u.id AS authorId,         /* Select author's ID */
            u.name AS authorName,     /* Select author's Name */
            COUNT(DISTINCT pl.user_id) AS likes,
            COUNT(DISTINCT c.id) AS commentCount
        FROM posts p
        LEFT JOIN users u ON p.author_id = u.id /* Join based on author_id */
        LEFT JOIN post_likes pl ON p.id = pl.post_id
        LEFT JOIN comments c ON p.id = c.post_id
        GROUP BY p.id
        ORDER BY p.created_at DESC
    `;
    const [results] = await pool.query(sql);

    const finalResults = results.map(post => ({
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      date: post.date,
      author: { id: post.authorId, name: post.authorName || 'Unknown Author' }, // Create nested author object
      categories: (typeof post.categories === 'string') ? JSON.parse(post.categories) : post.categories ?? [],
      likes: Number(post.likes),
      commentCount: Number(post.commentCount),
      createdAt: post.created_at,
      updatedAt: post.updated_at
    }));
    res.json(finalResults);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: "Internal server error while fetching posts.", error: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  const postId = req.params.id;
  const userId = req.user?.id;
  if (isNaN(parseInt(postId))) { return res.status(400).json({ message: "Invalid post ID." }); }
  try {
      const postSql = `SELECT p.*, u.id AS authorId, u.name AS authorName FROM posts p LEFT JOIN users u ON p.author_id = u.id WHERE p.id = ?`;
      const [postResult] = await pool.query(postSql, [postId]);
      if (postResult.length === 0) { return res.status(404).json({ message: "Post not found." }); }
      const postData = postResult[0];
      const countSql = "SELECT COUNT(*) as totalLikes FROM post_likes WHERE post_id = ?";
      const [countResult] = await pool.query(countSql, [postId]);
      const totalLikes = countResult[0].totalLikes;
      let likedByCurrentUser = false;
      if (userId) {
          const likeCheckSql = "SELECT COUNT(*) as count FROM post_likes WHERE post_id = ? AND user_id = ?";
          const [likeCheckResult] = await pool.query(likeCheckSql, [postId, userId]);
          likedByCurrentUser = likeCheckResult[0].count > 0;
      }
      const post = {
          id: postData.id, title: postData.title, excerpt: postData.excerpt, content: postData.content, date: postData.date,
          author: { id: postData.authorId, name: postData.authorName || 'Unknown Author' },
          categories: (typeof postData.categories === 'string') ? JSON.parse(postData.categories) : postData.categories ?? [],
          likes: Number(totalLikes), likedByCurrentUser: likedByCurrentUser,
          createdAt: postData.created_at, updatedAt: postData.updated_at
      };
      res.json(post);
  } catch (error) {
     console.error(`Error fetching post with ID ${postId}:`, error);
     res.status(500).json({ message: "Internal server error while fetching the post.", error: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  const authorId = req.user.id;
  const { title, excerpt, content, date, categories } = req.body;
  if (!title) { return res.status(400).json({ message: "Title is required." }); }
  try {
      const sql = `INSERT INTO posts (title, excerpt, content, author_id, date, categories) VALUES (?, ?, ?, ?, ?, ?)`;
      const values = [ title, excerpt || null, content || null, authorId, date || null, JSON.stringify(categories || []) ];
      const [results] = await pool.query(sql, values);
      res.status(201).json({ message: "Post successfully created!", insertedId: results.insertId });
  } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Internal server error while creating the post.", error: error.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  const postId = req.params.id;
  const { title, excerpt, content, date, categories } = req.body;
  if (isNaN(parseInt(postId))) { return res.status(400).json({ message: "Invalid post ID." }); }
  if (!title) { return res.status(400).json({ message: "Title is required for updates." }); }
  try {
      const sql = `UPDATE posts SET title = ?, excerpt = ?, content = ?, date = ?, categories = ? WHERE id = ?`;
      const values = [ title, excerpt || null, content || null, date || null, JSON.stringify(categories || []), postId ];
      const [results] = await pool.query(sql, values);
      if (results.affectedRows === 0) { return res.status(404).json({ message: "Post not found for update." }); }
      const [updatedPostResult] = await pool.query("SELECT p.*, u.id AS authorId, u.name AS authorName FROM posts p LEFT JOIN users u ON p.author_id = u.id WHERE p.id = ?", [postId]);
      if (updatedPostResult.length === 0) { return res.status(404).json({ message: "Post not found after update." }); }
      const backendPost = updatedPostResult[0];
      const mappedPost = { id: backendPost.id, title: backendPost.title, excerpt: backendPost.excerpt, content: backendPost.content, date: backendPost.date, author: { id: backendPost.authorId, name: backendPost.authorName || 'Unknown Author' }, categories: (typeof backendPost.categories === 'string') ? JSON.parse(backendPost.categories) : backendPost.categories ?? [], likes: Number(backendPost.likes), createdAt: backendPost.created_at, updatedAt: backendPost.updated_at };
      res.status(200).json({ message: "Post successfully updated!", post: mappedPost });
  } catch (error) {
      console.error(`Error updating post with ID ${postId}:`, error);
      res.status(500).json({ message: "Internal server error while updating the post.", error: error.message });
  }
});

router.delete("/:id", protect, async (req, res) => {
  const postId = req.params.id;
  if (isNaN(parseInt(postId))) { return res.status(400).json({ message: "Invalid post ID." }); }
  try {
      const sql = "DELETE FROM posts WHERE id = ?";
      const [results] = await pool.query(sql, [postId]);
      if (results.affectedRows === 0) { return res.status(404).json({ message: "Post not found for deletion." }); }
      res.status(200).json({ message: "Post successfully deleted!" });
  } catch (error) {
      console.error(`Error deleting post with ID ${postId}:`, error);
      res.status(500).json({ message: "Internal server error while deleting the post.", error: error.message });
  }
});

router.post('/:postId/comments', protect, async (req, res) => {
  const postId = req.params.postId;
  const commenterId = req.user.id;
  const commenterName = req.user.name || req.user.email; // Use name or fallback to email
  const { content } = req.body;

  if (isNaN(parseInt(postId))) { return res.status(400).json({ message: "Invalid post ID." }); }
  if (!content || typeof content !== 'string' || content.trim().length === 0) { return res.status(400).json({ message: "Comment content cannot be empty." }); }

  let connection;
  try {
      connection = await pool.getConnection(); // Using connection for consistency if needed later

      // 1. Fetch post's author_id and title
      const [postData] = await connection.query("SELECT author_id, title FROM posts WHERE id = ?", [postId]);
      if (postData.length === 0) { return res.status(404).json({ message: "Cannot add comment: Post not found." }); }
      const postAuthorId = postData[0].author_id;
      const postTitle = postData[0].title;

      // 2. Insert the new comment
      const insertSql = "INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)";
      const [results] = await connection.query(insertSql, [postId, commenterId, content.trim()]);
      const newCommentId = results.insertId;

      // 3. Fetch the newly created comment WITH user info to return it
      const selectSql = `SELECT c.id, c.content, c.created_at, u.id as userId, u.name as userName, u.avatar_url as userAvatarUrl FROM comments c JOIN users u ON c.user_id = u.id WHERE c.id = ?`;
      const [newCommentData] = await connection.query(selectSql, [newCommentId]);
      if (newCommentData.length === 0) { throw new Error("Failed to retrieve newly created comment."); }
      const createdComment = { id: newCommentData[0].id, content: newCommentData[0].content, createdAt: newCommentData[0].created_at, user: { id: newCommentData[0].userId, name: newCommentData[0].userName, avatarUrl: newCommentData[0].userAvatarUrl } };

      // --- EMIT NOTIFICATION ---
      // Check if the author exists and is different from the commenter
      if (postAuthorId && postAuthorId !== commenterId) {
          try {
              const io = req.app.get('socketio'); // Get socket.io instance from app
              if (io) {
                  const notificationData = {
                      message: `${commenterName} commented on your post: "${postTitle}"`,
                      postId: parseInt(postId), // Ensure postId is number if needed
                      commentId: newCommentId,
                      timestamp: new Date().toISOString()
                  };
                  const authorRoom = postAuthorId.toString(); // Room name is user ID as string
                  io.to(authorRoom).emit('new_notification', notificationData);
                  console.log(`Notification sent to user room: ${authorRoom}`);
              } else {
                  console.error("Socket.IO instance not found in app context.");
              }
          } catch (socketError) {
               // Log error but don't fail the comment creation
              console.error("Error emitting socket notification:", socketError);
          }
      }
      // --- END NOTIFICATION ---

      res.status(201).json(createdComment); // Return the new comment

  } catch (error) {
      if (connection) await connection.rollback(); // Rollback needed if using transactions
       console.error(`Error adding comment for post ${postId} by user ${commenterId}:`, error);
       if (error.code === "ER_NO_REFERENCED_ROW_2") { return res.status(404).json({ message: "Cannot add comment: Post not found." }); }
       res.status(500).json({ message: "Internal server error while adding comment.", error: error.message });
  } finally {
      if (connection) connection.release();
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
