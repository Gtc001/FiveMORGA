const pool = require('../config/database');

async function requireAdmin(req, res, next) {
  try {
    const result = await pool.query('SELECT role FROM users WHERE id = $1', [req.userId]);
    if (result.rows.length === 0 || result.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
    }
    next();
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

module.exports = requireAdmin;
