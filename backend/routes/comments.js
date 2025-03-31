// backend/routes/comments.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

router.put('/:commentId', protect, async (req, res) => {
    const commentId = req.params.commentId;
    const userId = req.user.id;
    const { content } = req.body;

    if (isNaN(parseInt(commentId))) {
        return res.status(400).json({ message: "Invalid comment ID." });
    }
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return res.status(400).json({ message: "Comment content cannot be empty." });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [comments] = await connection.query("SELECT user_id FROM comments WHERE id = ?", [commentId]);

        if (comments.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: "Comment not found." });
        }

        const commentOwnerId = comments[0].user_id;
        if (commentOwnerId !== userId) {
            await connection.rollback();
            return res.status(403).json({ message: "User not authorized to edit this comment." });
        }

        const updateSql = "UPDATE comments SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        const [updateResult] = await connection.query(updateSql, [content.trim(), commentId]);

        if (updateResult.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ message: "Comment not found during update attempt." });
        }

        const selectSql = `
            SELECT c.id, c.content, c.created_at, c.updated_at,
                   u.id as userId, u.name as userName, u.avatar_url as userAvatarUrl
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.id = ?`;
        const [updatedCommentData] = await connection.query(selectSql, [commentId]);

        await connection.commit();

        if (updatedCommentData.length === 0) {
            throw new Error("Failed to retrieve comment after update.");
        }

        const updatedComment = {
            id: updatedCommentData[0].id,
            content: updatedCommentData[0].content,
            createdAt: updatedCommentData[0].created_at,
            updatedAt: updatedCommentData[0].updated_at,
            user: {
                id: updatedCommentData[0].userId,
                name: updatedCommentData[0].userName,
                avatarUrl: updatedCommentData[0].userAvatarUrl
            }
        };

        res.status(200).json({ message: "Comment updated successfully", comment: updatedComment });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error(`Error updating comment ${commentId} by user ${userId}:`, error);
        res.status(500).json({ message: "Internal server error while updating comment.", error: error.message });
    } finally {
         if (connection) connection.release();
    }
});

router.delete('/:commentId', protect, async (req, res) => {
    const commentId = req.params.commentId;
    const userId = req.user.id;

    if (isNaN(parseInt(commentId))) {
        return res.status(400).json({ message: "Invalid comment ID." });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [comments] = await connection.query("SELECT user_id FROM comments WHERE id = ?", [commentId]);

        if (comments.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: "Comment not found." });
        }

        const commentOwnerId = comments[0].user_id;
        if (commentOwnerId !== userId) {
            await connection.rollback();
            return res.status(403).json({ message: "User not authorized to delete this comment." });
        }

        const deleteSql = "DELETE FROM comments WHERE id = ?";
        const [deleteResult] = await connection.query(deleteSql, [commentId]);

        if (deleteResult.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ message: "Comment not found during delete attempt." });
        }

        await connection.commit();

        res.status(200).json({ message: "Comment deleted successfully!" });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error(`Error deleting comment ${commentId} by user ${userId}:`, error);
        res.status(500).json({ message: "Internal server error while deleting comment.", error: error.message });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;