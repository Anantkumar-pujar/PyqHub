const express = require('express');
const path = require('path');
const isAuthenticated = require('../middleware/isAuthenticated');
const isAdmin = require('../middleware/isAdmin');

const router = express.Router();

router.get('/dashboard', isAuthenticated, isAdmin, (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.sendFile(path.join(__dirname, '../views', 'dashboard.html'));
});

router.get('/access-denied', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Access Denied</title>
            <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
        </head>
        <body>
            <script>
                Swal.fire({
                    icon: 'error',
                    title: 'Access Denied',
                    text: 'You are not authorized to access this page.'
                }).then(() => {
                    window.location.href = '/home';
                });
            </script>
        </body>
        </html>
    `);
});

module.exports = router;
