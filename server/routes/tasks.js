const router = require('express').Router();
const pool = require('../config/database');
const authenticate = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { status, priority, category_id, search } = req.query;
    let query = `
      SELECT t.*, c.name AS category_name, c.color AS category_color
      FROM tasks t
      LEFT JOIN categories c ON c.id = t.category_id
      WHERE t.user_id = $1
    `;
    const params = [req.userId];
    let idx = 2;

    if (status) {
      query += ` AND t.status = $${idx++}`;
      params.push(status);
    }
    if (priority) {
      query += ` AND t.priority = $${idx++}`;
      params.push(priority);
    }
    if (category_id) {
      query += ` AND t.category_id = $${idx++}`;
      params.push(category_id);
    }
    if (search) {
      query += ` AND (t.title ILIKE $${idx} OR t.description ILIKE $${idx} OR t.notes ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }

    query += ' ORDER BY t.position, t.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description, notes, status, priority, category_id } = req.body;
    if (!title) return res.status(400).json({ error: 'Titre requis' });

    const posResult = await pool.query(
      'SELECT COALESCE(MAX(position), -1) + 1 AS next_pos FROM tasks WHERE user_id = $1',
      [req.userId]
    );
    const position = posResult.rows[0].next_pos;

    const result = await pool.query(
      `INSERT INTO tasks (title, description, notes, status, priority, category_id, user_id, position)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        title,
        description || null,
        notes || null,
        status || 'todo',
        priority || 'medium',
        category_id || null,
        req.userId,
        position,
      ]
    );

    const task = result.rows[0];
    if (task.category_id) {
      const cat = await pool.query('SELECT name, color FROM categories WHERE id = $1', [task.category_id]);
      if (cat.rows.length) {
        task.category_name = cat.rows[0].name;
        task.category_color = cat.rows[0].color;
      }
    }

    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { title, description, notes, status, priority, category_id, position } = req.body;
    const result = await pool.query(
      `UPDATE tasks SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        notes = COALESCE($3, notes),
        status = COALESCE($4, status),
        priority = COALESCE($5, priority),
        category_id = $6,
        position = COALESCE($7, position),
        updated_at = NOW()
       WHERE id = $8 AND user_id = $9
       RETURNING *`,
      [title, description, notes, status, priority, category_id, position, req.params.id, req.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Tâche non trouvée' });

    const task = result.rows[0];
    if (task.category_id) {
      const cat = await pool.query('SELECT name, color FROM categories WHERE id = $1', [task.category_id]);
      if (cat.rows.length) {
        task.category_name = cat.rows[0].name;
        task.category_color = cat.rows[0].color;
      }
    }

    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['todo', 'in_progress', 'testing', 'done'];
    if (!valid.includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    const result = await pool.query(
      `UPDATE tasks SET status = $1, updated_at = NOW()
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [status, req.params.id, req.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Tâche non trouvée' });

    const task = result.rows[0];
    if (task.category_id) {
      const cat = await pool.query('SELECT name, color FROM categories WHERE id = $1', [task.category_id]);
      if (cat.rows.length) {
        task.category_name = cat.rows[0].name;
        task.category_color = cat.rows[0].color;
      }
    }

    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Tâche non trouvée' });
    res.json({ message: 'Tâche supprimée' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
