require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { waitForDB, initTables } = require('./startup');

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const categoryRoutes = require('./routes/categories');
const statsRoutes = require('./routes/stats');
const adminRoutes = require('./routes/admin');
const ideasRoutes = require('./routes/ideas');
const uploadRoutes = require('./routes/upload');
const patchnotesRoutes = require('./routes/patchnotes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ideas', ideasRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/patchnotes', patchnotesRoutes);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
  });
}

async function start() {
  await waitForDB();
  await initTables();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[FiveM ORGA] Server running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('[FiveM ORGA] Failed to start:', err);
  process.exit(1);
});
