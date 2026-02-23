const router = require('express').Router();
const pool = require('../config/database');
const authenticate = require('../middleware/auth');

router.use(authenticate);

// ── Patchnote Categories ──

router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM patchnote_categories WHERE user_id = $1 ORDER BY name',
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/categories', async (req, res) => {
  try {
    const { name, color } = req.body;
    if (!name) return res.status(400).json({ error: 'Nom requis' });
    const result = await pool.query(
      'INSERT INTO patchnote_categories (name, color, user_id) VALUES ($1, $2, $3) RETURNING *',
      [name, color || '#6366f1', req.userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM patchnote_categories WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Catégorie non trouvée' });
    res.json({ message: 'Catégorie supprimée' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ── Patchnotes ──

router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let query = `
      SELECT p.*, u.username AS author
      FROM patchnotes p
      LEFT JOIN users u ON u.id = p.user_id
      WHERE p.user_id = $1
    `;
    const params = [req.userId];

    query += ' ORDER BY p.created_at DESC';

    const result = await pool.query(query, params);
    let rows = result.rows.map((r) => ({
      ...r,
      entries: safeParse(r.entries),
    }));

    if (category) {
      rows = rows.filter((r) =>
        r.entries.some((e) => e.category?.toLowerCase() === category.toLowerCase())
      );
    }

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, entries } = req.body;
    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ error: 'Au moins une entrée requise' });
    }

    const valid = entries.every((e) => e.category && e.name && e.action);
    if (!valid) {
      return res.status(400).json({ error: 'Chaque entrée doit avoir: category, name, action' });
    }

    const result = await pool.query(
      'INSERT INTO patchnotes (title, entries, user_id) VALUES ($1, $2, $3) RETURNING *',
      [title || null, JSON.stringify(entries), req.userId]
    );

    const patchnote = result.rows[0];
    patchnote.entries = safeParse(patchnote.entries);
    const user = await pool.query('SELECT username FROM users WHERE id = $1', [req.userId]);
    patchnote.author = user.rows[0].username;
    res.status(201).json(patchnote);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM patchnotes WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Patchnote non trouvé' });
    res.json({ message: 'Patchnote supprimé' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

function safeParse(val) {
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val || '[]'); } catch { return []; }
}

module.exports = router;
