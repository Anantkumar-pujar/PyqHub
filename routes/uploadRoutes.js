const express = require('express');
const multer = require('multer');
const { storage, cloudinary } = require('../config/cloudinary');
const pool = require('../config/db');
const path = require('path');
const isAuthenticated = require('../middleware/isAuthenticated');
const isAdmin = require('../middleware/isAdmin');

const router = express.Router();
const upload = multer({ storage });

router.get('/upload', (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    if (!req.session || !req.session.userId) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, '../views', 'upload.html'));
});

// Upload file (auto-marked as pending)
router.post('/upload', isAuthenticated, upload.single('file'), async (req, res) => {
    const {
        subject_name,
        subject_code,
        academic_year,
        category,
        uploaded_by,
        description,
    } = req.body;

    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded.' });

    const fileUrl = file.path;
    const rawViewUrl = fileUrl.replace('/image/upload/', '/raw/upload/');
    const downloadUrl = `${fileUrl}?fl_attachment=${file.filename}`;
    const publicId = file.filename.replace(/\.[^/.]+$/, '');

    try {
        const query = `
      INSERT INTO uploads 
      (filename, filetype, filesize, uploaded_by, uploaded_at, description, subject_name, subject_code, academic_year, category, status, file_url, public_id)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5, $6, $7, $8, $9, 'pending', $10, $11)
    `;

        const values = [
            file.originalname,
            file.mimetype,
            file.size,
            uploaded_by,
            description,
            subject_name,
            subject_code,
            academic_year,
            category,
            fileUrl,      // ✅ Cloudinary secure_url
            publicId,   // This becomes public_id because of how we define it in cloudinary.js
        ];

        await pool.query(query, values);
        res.status(200).json({ message: 'File uploaded successfully. Awaiting admin approval.' });
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ error: 'Failed to save file metadata.' });
    }
});

// Approve file (just update status)
router.post('/approve/:id', isAuthenticated, isAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(`SELECT * FROM uploads WHERE id = $1 AND status = 'pending'`, [id]);

        if (result.rowCount === 0) {
            return res.status(404).send('File not found or already processed.');
        }

        await pool.query(`UPDATE uploads SET status = 'approved' WHERE id = $1`, [id]);
        res.send('File approved successfully.');
    } catch (err) {
        console.error('Approval error:', err);
        res.status(500).send('An error occurred while approving the file.');
    }
});

// Reject file (delete from Cloudinary + DB)
router.post('/reject/:id', isAuthenticated, isAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(`SELECT * FROM uploads WHERE id = $1 AND status = 'pending'`, [id]);
        if (result.rowCount === 0) {
            return res.status(404).send('File not found or already processed.');
        }

        const file = result.rows[0];

        // Delete from Cloudinary
        await cloudinary.uploader.destroy(file.public_id);

        // Remove metadata from DB
        await pool.query(`DELETE FROM uploads WHERE id = $1`, [id]);

        res.send('File rejected and deleted successfully.');
    } catch (err) {
        console.error('Rejection error:', err);
        res.status(500).send('An error occurred while rejecting the file.');
    }
});

// Get all pending uploads
router.get('/pending', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM uploads WHERE status = 'pending'`);
        res.json(result.rows);
    } catch (err) {
        console.error('Pending fetch error:', err);
        res.status(500).send('An error occurred while retrieving pending files.');
    }
});

module.exports = router;
