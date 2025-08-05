const express = require('express');
const path = require('path');
const pool = require('../config/db');
const fs = require('fs');
const isAuthenticated = require('../middleware/isAuthenticated');
const router = express.Router();


router.get('/home', isAuthenticated, (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    if (!req.session || !req.session.userId) {
        return res.redirect('/login');
    }

    const filePath = path.join(__dirname, '../views', 'home.html');
    const roleScript = `<script>const userRole = "${req.session.role}";</script>`;

    // Injecting the role script into the HTML file
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).send('Server error.');
        }

        const modifiedHtml = data.replace(
            '</head>',
            `${roleScript}\n</head>`
        );

        res.send(modifiedHtml);
    });
});

module.exports = router;