const express = require('express');
const path = require('path');
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const transporter = require('../config/mailer');

const router = express.Router();

router.get('/forgot-password', (req, res) => {
     res.sendFile(path.join(__dirname, '../views', 'forgot-password.html'));
});

router.post('/forgot-password', async (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ error: 'Username is required.' });
    }

    try {
        const query = 'SELECT email FROM users WHERE username = $1;';
        const { rows } = await pool.query(query, [username]);

        if (rows.length === 0) {
            return res.status(400).json({ error: 'User not found.' });
        }

        const email = rows[0].email;
        const resetToken = Math.random().toString(36).substr(2, 8);

        // Save the token in the database with an expiry time
        await pool.query(`
            UPDATE users
            SET reset_token = $1, reset_token_expires = NOW() + INTERVAL '1 hour'
            WHERE username = $2;
        `, [resetToken, username]);

        // Generate a reset link
        const resetLink = `http://localhost:3002/reset-password?token=${resetToken}`;

        // Sending an email with the reset link
        await transporter.sendMail({
            from: 'team.pyqhub@gmail.com',
            to: email,
            subject: 'Password Reset Request',
            text: `You requested to reset your password. Click the link below or copy and paste it into your browser:\n\n${resetLink}\n\nIf you did not request this, please ignore this email.`,
        });

        return res.status(200).json({ message: 'An email with password reset instructions has been sent.' });
    } catch (error) {
        console.error('Error in forgot-password:', error);
        return res.status(400).json({ error: 'Server error.' });

    }
});

router.get('/reset-password', (req, res) => {
    const { token } = req.query;
    
        if (!token) {
            return res.status(400).json({ error: 'Invalid or missing reset token.' });
        }
    
        res.sendFile(path.join(__dirname, '../views', 'reset-password.html'));
});

router.post('/reset-password', async (req, res) => {
    const { resetToken, newPassword, confirmPassword } = req.body;
    
        if (!resetToken || !newPassword) {
            return res.status(400).json({ error: 'Invalid request data.' });
        }
    
        try {
            const query = `
            SELECT username 
                FROM users 
                WHERE reset_token = $1 
                AND reset_token_expires > CURRENT_TIMESTAMP AT TIME ZONE 'UTC';
                `;
            const result = await pool.query(query, [resetToken]);
    
            if (result.rows.length === 0) {
                return res.status(400).json({ error: 'Reset token is invalid or expired.' });
            }
    
            const { username } = result.rows[0];
    
            // Password strength validation
            if (newPassword.length < 8) {
                return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
            }
            if (!/[A-Z]/.test(newPassword)) {
                return res.status(400).json({ error: 'Password must contain atleast an uppercase letter.' });
            }
            if (!/[a-z]/.test(newPassword)) {
                return res.status(400).json({ error: 'Password must contain atleast a lowercase letter.' });
            }
            if (!/[0-9]/.test(newPassword)) {
                return res.status(400).json({ error: 'Password must contain atleast a number.' });
            }
    
            if (newPassword !== confirmPassword) {
                return res.status(400).json({ error: 'Passwords do not match.' });
            }
    
            const hashedPassword = await bcrypt.hash(newPassword, 10);
    
            await pool.query(
                `UPDATE users 
                SET password = $1, reset_token = NULL, reset_token_expires = NULL 
                WHERE username = $2;`,
                [hashedPassword, username]
            );
    
            return res.status(200).json({ message: 'Password reset successfully.' });
        } catch (error) {
            console.error('Error resetting password:', error);
            return res.status(500).json({ error: 'Server error. Please try again later.' });
        }
});

module.exports = router;
