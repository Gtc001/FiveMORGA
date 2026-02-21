const pool = require('./config/database');

async function waitForDB(retries = 15, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.query('SELECT 1');
      console.log('[Startup] Database connected');
      return true;
    } catch {
      console.log(`[Startup] Waiting for database... (${i + 1}/${retries})`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error('Database not reachable after retries');
}

async function initTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
      created_at TIMESTAMP DEFAULT NOW()
    );

    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'role'
      ) THEN
        ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'member';
      END IF;
    END $$;

    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      color VARCHAR(7) DEFAULT '#6366f1',
      icon VARCHAR(50) DEFAULT 'folder',
      position INTEGER DEFAULT 0,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      notes TEXT,
      status VARCHAR(20) DEFAULT 'todo'
        CHECK (status IN ('todo', 'in_progress', 'testing', 'done')),
      priority VARCHAR(10) DEFAULT 'medium'
        CHECK (priority IN ('low', 'medium', 'high', 'critical')),
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      position INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS ideas (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT,
      links TEXT DEFAULT '[]',
      color VARCHAR(7) DEFAULT '#6366f1',
      pinned BOOLEAN DEFAULT false,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ideas' AND column_name = 'links'
      ) THEN
        ALTER TABLE ideas ADD COLUMN links TEXT DEFAULT '[]';
      END IF;
    END $$;

    CREATE TABLE IF NOT EXISTS files (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      mime_type VARCHAR(100),
      size INTEGER,
      idea_id INTEGER REFERENCES ideas(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category_id);
    CREATE INDEX IF NOT EXISTS idx_categories_user ON categories(user_id);
    CREATE INDEX IF NOT EXISTS idx_ideas_user ON ideas(user_id);
    CREATE INDEX IF NOT EXISTS idx_files_idea ON files(idea_id);
  `);
  console.log('[Startup] Tables ready');
}

module.exports = { waitForDB, initTables };
