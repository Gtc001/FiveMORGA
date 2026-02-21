const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const pool = require('../config/database');
const authenticate = require('../middleware/auth');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = crypto.randomUUID() + ext;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|pdf|txt|md|zip|rar|lua|js|json|cfg|yaml|yml/;
    const ext = path.extname(file.originalname).toLowerCase().slice(1);
    if (allowed.test(ext)) return cb(null, true);
    cb(new Error('Type de fichier non autorisé'));
  },
});

router.use(authenticate);

router.post('/', upload.array('files', 10), async (req, res) => {
  try {
    const ideaId = req.body.idea_id || null;
    const results = [];

    for (const file of req.files) {
      const result = await pool.query(
        `INSERT INTO files (filename, original_name, mime_type, size, idea_id, user_id)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [file.filename, file.originalname, file.mimetype, file.size, ideaId, req.userId]
      );
      results.push(result.rows[0]);
    }

    res.status(201).json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur upload' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM files WHERE id = $1 RETURNING filename', [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Fichier non trouvé' });

    const filepath = path.join(UPLOAD_DIR, result.rows[0].filename);
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);

    res.json({ message: 'Fichier supprimé' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
