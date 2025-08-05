const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const isAuthenticated = require('../middleware/isAuthenticated');
const path = require('path');

// Search API
router.get('/search-files', async (req, res) => {
    const { subname, category } = req.query;

    try {
        let baseQuery = `
            SELECT subject_name, subject_code, category, academic_year, file_url, filetype, filename
            FROM uploads
            WHERE status = 'approved'
        `;

        const conditions = [];
        const values = [];

        if (subname) {
            conditions.push(`(LOWER(subject_name) = LOWER($${values.length + 1}) OR LOWER(subject_code) = LOWER($${values.length + 1}))`);
            values.push(subname);
        }

        if (category) {
            conditions.push(`LOWER(category) = LOWER($${values.length + 1})`);
            values.push(category);
        }

        if (conditions.length > 0) {
            baseQuery += ' AND ' + conditions.join(' AND ');
        }

        const result = await pool.query(baseQuery, values);
        res.json(result.rows);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Typeahead subjects
router.get('/api/get-subjects', async (req, res) => {
    const query = req.query.query || '';
    const category = req.query.category;

    try {
        const queryText = `
      SELECT DISTINCT subject_name, subject_code
      FROM uploads
      WHERE 
        (LOWER(subject_name) LIKE LOWER($1) OR LOWER(subject_code) LIKE LOWER($1))
        AND ($2::text IS NULL OR LOWER(category) = LOWER($2))
        AND status = 'approved'
    `;

        const values = [`%${query}%`, category || null];
        const { rows } = await pool.query(queryText, values);

        res.json(rows);
    } catch (err) {
        console.error('Typeahead error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Search results page
router.get('/search-results', isAuthenticated, (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.sendFile(path.join(__dirname, '../views/searchResult.html'));
});

module.exports = router;
