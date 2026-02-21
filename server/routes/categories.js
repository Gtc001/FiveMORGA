const router = require('express').Router();
const pool = require('../config/database');
const authenticate = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, COUNT(t.id)::int AS task_count
       FROM categories c
       LEFT JOIN tasks t ON t.category_id = c.id
       WHERE c.user_id = $1
       GROUP BY c.id
       ORDER BY c.position, c.id`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, color, icon } = req.body;
    if (!name) return res.status(400).json({ error: 'Nom requis' });

    const posResult = await pool.query(
      'SELECT COALESCE(MAX(position), -1) + 1 AS next_pos FROM categories WHERE user_id = $1',
      [req.userId]
    );
    const position = posResult.rows[0].next_pos;

    const result = await pool.query(
      'INSERT INTO categories (name, color, icon, position, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, color || '#6366f1', icon || 'folder', position, req.userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, color, icon, position } = req.body;
    const result = await pool.query(
      `UPDATE categories SET
        name = COALESCE($1, name),
        color = COALESCE($2, color),
        icon = COALESCE($3, icon),
        position = COALESCE($4, position)
       WHERE id = $5 AND user_id = $6 RETURNING *`,
      [name, color, icon, position, req.params.id, req.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Catégorie non trouvée' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM categories WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Catégorie non trouvée' });
    res.json({ message: 'Catégorie supprimée' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
