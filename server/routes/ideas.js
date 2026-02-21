const router = require('express').Router();
const pool = require('../config/database');
const authenticate = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { search, pinned } = req.query;
    let query = `
      SELECT i.*, u.username AS author,
        COALESCE(json_agg(
          json_build_object('id', f.id, 'filename', f.filename, 'original_name', f.original_name, 'mime_type', f.mime_type, 'size', f.size)
        ) FILTER (WHERE f.id IS NOT NULL), '[]') AS files
      FROM ideas i
      LEFT JOIN users u ON u.id = i.user_id
      LEFT JOIN files f ON f.idea_id = i.id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (search) {
      query += ` AND (i.title ILIKE $${idx} OR i.content ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }
    if (pinned === 'true') {
      query += ` AND i.pinned = true`;
    }

    query += ` GROUP BY i.id, u.username ORDER BY i.pinned DESC, i.created_at DESC`;

    const result = await pool.query(query, params);
    const rows = result.rows.map((r) => ({
      ...r,
      links: safeParse(r.links),
    }));
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, content, notes, links, color, pinned } = req.body;
    if (!title) return res.status(400).json({ error: 'Titre requis' });

    const result = await pool.query(
      `INSERT INTO ideas (title, content, notes, links, color, pinned, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, content || null, notes || null, JSON.stringify(links || []), color || '#6366f1', pinned || false, req.userId]
    );

    const idea = result.rows[0];
    idea.links = safeParse(idea.links);
    idea.files = [];
    idea.author = (await pool.query('SELECT username FROM users WHERE id = $1', [req.userId])).rows[0].username;
    res.status(201).json(idea);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { title, content, notes, links, color, pinned } = req.body;
    const linksStr = links !== undefined ? JSON.stringify(links) : undefined;
    const result = await pool.query(
      `UPDATE ideas SET
        title = COALESCE($1, title),
        content = COALESCE($2, content),
        notes = COALESCE($3, notes),
        links = COALESCE($4, links),
        color = COALESCE($5, color),
        pinned = COALESCE($6, pinned),
        updated_at = NOW()
       WHERE id = $7 RETURNING *`,
      [title, content, notes, linksStr, color, pinned, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Idée non trouvée' });
    const idea = result.rows[0];
    idea.links = safeParse(idea.links);
    res.json(idea);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM ideas WHERE id = $1 RETURNING id', [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Idée non trouvée' });
    res.json({ message: 'Idée supprimée' });
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
