const router = require('express').Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const authenticate = require('../middleware/auth');
const requireAdmin = require('../middleware/admin');

router.use(authenticate);
router.use(requireAdmin);

router.get('/users', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, role, created_at FROM users ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/users', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username et password requis' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Ce nom d\'utilisateur existe déjà' });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING id, username, role, created_at',
      [username, hash, role || 'member']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const targetId = parseInt(req.params.id, 10);

    if (targetId === req.userId && role && role !== 'admin') {
      return res.status(400).json({ error: 'Vous ne pouvez pas retirer votre propre rôle admin' });
    }

    let query = 'UPDATE users SET ';
    const sets = [];
    const params = [];
    let idx = 1;

    if (username) { sets.push(`username = $${idx++}`); params.push(username); }
    if (password) { sets.push(`password_hash = $${idx++}`); params.push(await bcrypt.hash(password, 10)); }
    if (role) { sets.push(`role = $${idx++}`); params.push(role); }

    if (sets.length === 0) return res.status(400).json({ error: 'Rien à modifier' });

    query += sets.join(', ') + ` WHERE id = $${idx} RETURNING id, username, role, created_at`;
    params.push(targetId);

    const result = await pool.query(query, params);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const targetId = parseInt(req.params.id, 10);
    if (targetId === req.userId) {
      return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' });
    }

    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id', [targetId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json({ message: 'Utilisateur supprimé' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
