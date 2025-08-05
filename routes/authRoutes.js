const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../config/db');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const path = require('path');

// Rate limiter
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: JSON.stringify({ error: 'Too many login attempts.' }),
});

router.use('/login', loginLimiter);

router.get('/login', (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.sendFile('login.html', { root: path.join(__dirname, '../views') });
});

router.post('/login', async (req, res) => {
    const { username, password, role } = req.body;
    
        try {
            const query = `
                SELECT * FROM users
                WHERE username = $1 AND role = $2;
            `;
            const result = await pool.query(query, [username, role]);
    
            if (result.rows.length === 0) {
                return res.status(400).json({ error: 'Invalid username or role.' });
            }
    
            const user = result.rows[0];
            const passwordMatch = await bcrypt.compare(password, user.password);
    
            if (!passwordMatch) {
                return res.status(400).json({ error: 'Incorrect password.' });
            }
    
            req.session.userId = user.id;
            req.session.role = user.role;
    
            //return res.redirect('/home');
            return res.status(200).json({ message: 'Login successful! Redirecting...' });
        } catch (error) {
            console.error('Error logging in:', error);
            return res.status(400).json({ error: 'Server error.' });
        }
});

router.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, '../views', 'signup.html'));
});

router.post('/signup', async (req, res) => {
    const { username, password, 'confirm-password': confirmPassword, email } = req.body;
    
        // Password chhecking
        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match.' });
        }
    
        //password strength validation
        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
        }
        if (!/[A-Z]/.test(password)) {
            return res.status(400).json({ error: 'Password must contain atleast an uppercase letter.' });
        }
        if (!/[a-z]/.test(password)) {
            return res.status(400).json({ error: 'Password must contain atleast a lowercase letter.' });
        }
        if (!/[0-9]/.test(password)) {
            return res.status(400).json({ error: 'Password must contain atleast a number.' });
        }
    
        // Simple email format check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format.' });
        }
    
        try {
            // Hashing the password
            const hashedPassword = await bcrypt.hash(password, 10);
    
            // Insert into the database
            const query = `
                INSERT INTO users (username, email, password, role)
                VALUES ($1, $2, $3, 'user')
                RETURNING id;
            `;
            const result = await pool.query(query, [username, email, hashedPassword]);
    
            // Return a success message as JSON
            return res.status(200).json({ message: 'Sign Up Successful! Redirecting to login page...' });
        } catch (error) {
            if (error.code === '23505' && error.constraint === 'users_username_key') {
                return res.status(400).json({ error: 'Username already taken' });
            }
            console.error('Error signing up:', error);
            return res.status(500).json({ error: 'Server error. Please try again later.' });
        }
});

router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).send('Logout failed');
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
});

module.exports = router;
