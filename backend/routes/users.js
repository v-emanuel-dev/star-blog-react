// backend/routes/users.js (WITH DEBUG LOGGING)
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const fs = require('fs').promises;
const path = require('path');
const { protect } = require('../middleware/authMiddleware');
const uploadAvatar = require('../middleware/uploadMiddleware');
const bcrypt = require('bcrypt');

router.put('/profile', protect, uploadAvatar, async (req, res) => {
    const userId = req.user.id;
    console.log(`[PUT /profile] User ID: ${userId}`);

    const { name } = req.body;
    const newAvatarFile = req.file;
    console.log(`[PUT /profile] Received name: ${name}`);
    console.log(`[PUT /profile] Received file:`, newAvatarFile ? newAvatarFile.filename : 'No file');

    const fieldsToUpdate = {};
    const values = [];

    if (name !== undefined) {
        fieldsToUpdate.name = name;
        values.push(fieldsToUpdate.name);
        console.log(`[PUT /profile] Prepared 'name' for update.`);
    }

    let oldAvatarPath = null;
    let newAvatarUrlPath = null;

    try {
        if (newAvatarFile) {
            newAvatarUrlPath = `/uploads/avatars/${newAvatarFile.filename}`;
            fieldsToUpdate.avatar_url = newAvatarUrlPath;
            values.push(fieldsToUpdate.avatar_url);
            console.log(`[PUT /profile] Prepared 'avatar_url' (${newAvatarUrlPath}) for update.`);

            console.log(`[PUT /profile] Fetching old avatar path for user ${userId}...`);
            const [currentUserData] = await pool.query("SELECT avatar_url FROM users WHERE id = ?", [userId]);
            if (currentUserData.length > 0 && currentUserData[0].avatar_url) {
                oldAvatarPath = currentUserData[0].avatar_url;
                console.log(`[PUT /profile] Found old avatar path: ${oldAvatarPath}`);
            } else {
                 console.log(`[PUT /profile] No old avatar path found for user ${userId}.`);
            }
        }

        if (values.length === 0) {
            console.log(`[PUT /profile] No data provided for update.`);
            return res.status(400).json({ message: "No update data provided." });
        }

        const setClauses = Object.keys(fieldsToUpdate).map(key => `${key} = ?`).join(', ');
        const sql = `UPDATE users SET ${setClauses} WHERE id = ?`;
        values.push(userId);

        console.log(`[PUT /profile] Executing SQL: ${sql}`);
        console.log(`[PUT /profile] With values:`, values);
        const [results] = await pool.query(sql, values);
        console.log(`[PUT /profile] DB Update results - Affected Rows: ${results.affectedRows}`);

        if (results.affectedRows === 0) {
             console.log(`[PUT /profile] User ${userId} not found for update.`);
            return res.status(404).json({ message: "User not found for update." });
        }

        if (newAvatarUrlPath && oldAvatarPath && oldAvatarPath.startsWith('/uploads/')) {
            const oldFilePath = path.join(__dirname, '..', oldAvatarPath);
            console.log(`[PUT /profile] Attempting to delete old avatar: ${oldFilePath}`);
            try {
                await fs.unlink(oldFilePath);
                console.log(`[PUT /profile] Successfully deleted old avatar: ${oldFilePath}`);
            } catch (unlinkError) {
                console.error(`[PUT /profile] Non-critical error deleting old avatar file: ${oldFilePath}`, unlinkError);
                // Log error but don't fail the overall request
            }
        }

        console.log(`[PUT /profile] Fetching updated user data for user ${userId}...`);
        const [updatedUserResult] = await pool.query(
            "SELECT id, email, name, avatar_url, created_at FROM users WHERE id = ?",
             [userId]
        );

        if (updatedUserResult.length === 0) {
            // This case is less likely if affectedRows was > 0, but check anyway
             console.error(`[PUT /profile] CRITICAL: User ${userId} not found AFTER successful update.`);
            return res.status(404).json({ message: "User disappeared after update." });
        }

        console.log(`[PUT /profile] Sending success response for user ${userId}.`);
        res.status(200).json({
            message: "Profile updated successfully!",
            user: updatedUserResult[0]
        });

    } catch (error) {
        console.error(`[PUT /profile] Error during profile update for user ID ${userId}:`, error);
        if (newAvatarFile && error) {
             const newFilePath = newAvatarFile.path; // multer saves full path here
             console.log(`[PUT /profile] Error occurred, attempting to delete uploaded file: ${newFilePath}`);
            try {
                await fs.unlink(newFilePath);
                console.log(`[PUT /profile] Deleted uploaded file due to error: ${newFilePath}`);
            } catch (unlinkError) {
                 console.error(`[PUT /profile] Error deleting newly uploaded file after main error: ${newFilePath}`, unlinkError);
            }
        }
        res.status(500).json({ message: "Internal server error while updating profile.", error: error.message });
    }
});

router.put('/password', protect, async (req, res) => {
    const userId = req.user.id; // From protect middleware

    // 1. Get passwords from request body
    const { currentPassword, newPassword } = req.body;

    // 2. Validation
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current password and new password are required.' });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
    }
    if (currentPassword === newPassword) {
         return res.status(400).json({ message: 'New password cannot be the same as the current password.' });
    }

    try {
        // 3. Fetch current password hash from DB
        const sqlSelect = "SELECT password_hash FROM users WHERE id = ?";
        const [users] = await pool.query(sqlSelect, [userId]);

        if (users.length === 0) {
             // Should not happen if 'protect' worked
            return res.status(404).json({ message: 'User not found.' });
        }
        const storedHash = users[0].password_hash;

        // Check if user might have registered via Google (no password hash initially)
         if (!storedHash) {
             return res.status(400).json({ message: 'Cannot change password for accounts registered via social login without a password set.' });
         }


        // 4. Verify current password
        const passwordMatch = await bcrypt.compare(currentPassword, storedHash);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Incorrect current password.' });
        }

        // 5. Hash the new password
        const saltRounds = 10; // Same as used in registration
        const newHashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // 6. Update the password hash in the database
        const sqlUpdate = "UPDATE users SET password_hash = ? WHERE id = ?";
        await pool.query(sqlUpdate, [newHashedPassword, userId]);

        // 7. Send success response
        res.status(200).json({ message: 'Password updated successfully!' });

    } catch (error) {
        console.error(`Error changing password for user ID ${userId}:`, error);
        res.status(500).json({ message: 'Internal server error while changing password.', error: error.message });
    }
});

module.exports = router;
