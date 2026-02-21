const router = require('express').Router();
const pool = require('../config/database');
const authenticate = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const statusCounts = await pool.query(
      `SELECT status, COUNT(*)::int AS count
       FROM tasks WHERE user_id = $1
       GROUP BY status`,
      [req.userId]
    );

    const priorityCounts = await pool.query(
      `SELECT priority, COUNT(*)::int AS count
       FROM tasks WHERE user_id = $1
       GROUP BY priority`,
      [req.userId]
    );

    const categoryCounts = await pool.query(
      `SELECT c.id, c.name, c.color, COUNT(t.id)::int AS total,
              COUNT(t.id) FILTER (WHERE t.status = 'done')::int AS done
       FROM categories c
       LEFT JOIN tasks t ON t.category_id = c.id
       WHERE c.user_id = $1
       GROUP BY c.id
       ORDER BY c.position`,
      [req.userId]
    );

    const totalResult = await pool.query(
      'SELECT COUNT(*)::int AS total FROM tasks WHERE user_id = $1',
      [req.userId]
    );

    const statuses = { todo: 0, in_progress: 0, testing: 0, done: 0 };
    statusCounts.rows.forEach((r) => { statuses[r.status] = r.count; });

    const priorities = { low: 0, medium: 0, high: 0, critical: 0 };
    priorityCounts.rows.forEach((r) => { priorities[r.priority] = r.count; });

    res.json({
      total: totalResult.rows[0].total,
      statuses,
      priorities,
      categories: categoryCounts.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
