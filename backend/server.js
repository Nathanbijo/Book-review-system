// backend/server.js
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuid } = require('uuid');
const { MongoClient, ServerApiVersion } = require('mongodb'); // <-- ADD THIS


const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
// ==== MONGO (simple demo insert) ==================================
const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017';
const MONGO_DB  = process.env.MONGO_DB  || 'mwa_demo';

let __mongo = null;
async function getMongo() {
  if (!__mongo) {
    const client = new MongoClient(MONGO_URL, {
      serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
    });
    await client.connect();
    const db  = client.db(MONGO_DB);
    const col = db.collection('demo_inserts'); // simple collection
    __mongo = { client, db, col };
    console.log(`[mongo] connected → ${MONGO_URL}/${MONGO_DB}`);
  }
  return __mongo;
}

// Health check (optional)
app.get('/mongo/health', async (_req, res) => {
  try {
    const { db } = await getMongo();
    await db.command({ ping: 1 });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e.message || e) });
  }
});

// *** The one required simple insertion API ***
// Accept any JSON payload (so we can push review objects as-is)
app.post('/mongo/insert', async (req, res) => {
  try {
    const { col } = await getMongo();
    const payload = (req.body && typeof req.body === 'object') ? req.body : {};
    const doc = {
      ...payload,
      createdAt: new Date(),
      source: 'book-review-system'
    };
    const result = await col.insertOne(doc);
    res.status(201).json({ insertedId: result.insertedId, doc });
  } catch (e) {
    res.status(500).json({ error: 'mongo insert failed', details: String(e.message || e) });
  }
});

// (optional) tidy shutdown
process.on('SIGINT', async () => {
  if (__mongo?.client) await __mongo.client.close().catch(()=>{});
  process.exit(0);
});

// === DB ============================================================
const dbPath = path.join(__dirname, 'db.sqlite');
const db = new Database(dbPath);

db.exec(`
CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  year INTEGER,
  genre TEXT,
  cover TEXT,
  description TEXT
);

CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id INTEGER NOT NULL,
  username TEXT NOT NULL,
  stars INTEGER NOT NULL,
  text TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(book_id) REFERENCES books(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ratings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id INTEGER NOT NULL,
  stars INTEGER NOT NULL,
  FOREIGN KEY(book_id) REFERENCES books(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','user'))
);
`);

// Seed default admin (demo)
const hasUser = db.prepare('SELECT COUNT(*) c FROM users').get().c > 0;
if (!hasUser) {
  const hash = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?,?,?)')
    .run('admin', hash, 'admin');
  console.log('Seeded default admin → username: admin  password: admin123');
}

// Helper
const bookWithAgg = db.prepare(`
SELECT b.*,
       (SELECT ROUND(AVG(stars),1) FROM reviews r WHERE r.book_id=b.id) AS avg_rating,
       (SELECT COUNT(*) FROM reviews r WHERE r.book_id=b.id) AS ratings_count
FROM books b WHERE b.id = ?`);

// === SUPER-SIMPLE SESSIONS ========================================
// In-memory session store { sessionId -> {id, username, role} }
const sessions = new Map();

function authOptional(req, _res, next) {
  const sid = req.headers['x-session-id'];
  if (sid && sessions.has(sid)) req.user = sessions.get(sid);
  next();
}
function requireAuth(req, res, next) {
  const sid = req.headers['x-session-id'];
  if (!sid || !sessions.has(sid)) return res.status(401).json({ error: 'Unauthorized' });
  req.user = sessions.get(sid);
  next();
}
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

// === AUTH ROUTES ===================================================
app.post('/auth/signup', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username & password required' });
  try {
    const hash = bcrypt.hashSync(String(password), 10);
    const info = db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?,?,?)')
      .run(String(username).trim(), hash, 'user'); // signup -> role = user
    const user = { id: info.lastInsertRowid, username: String(username).trim(), role: 'user' };
    const sessionId = uuid();
    sessions.set(sessionId, user);
    return res.status(201).json({ sessionId, user });
  } catch (e) {
    if (String(e.message || '').includes('UNIQUE')) {
      return res.status(409).json({ error: 'username already exists' });
    }
    return res.status(500).json({ error: 'signup failed' });
  }
});

app.post('/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username & password required' });
  const row = db.prepare('SELECT * FROM users WHERE username=?').get(String(username).trim());
  if (!row || !bcrypt.compareSync(String(password), row.password_hash)) {
    return res.status(401).json({ error: 'invalid credentials' });
  }
  const user = { id: row.id, username: row.username, role: row.role };
  const sessionId = uuid();
  sessions.set(sessionId, user);
  res.json({ sessionId, user });
});

app.post('/auth/logout', requireAuth, (req, res) => {
  // remove this session only
  const sid = req.headers['x-session-id'];
  sessions.delete(sid);
  res.json({ ok: true });
});

app.get('/auth/me', authOptional, (req, res) => {
  res.json({ user: req.user || null });
});

// === BOOK ROUTES ===================================================
// public
app.get('/books', (req, res) => {
  const rows = db.prepare(`
   SELECT b.*,
       (SELECT ROUND(AVG(stars),1) FROM reviews r WHERE r.book_id=b.id) AS avg_rating,
       (SELECT COUNT(*) FROM reviews r WHERE r.book_id=b.id) AS ratings_count
   FROM books b
   ORDER BY b.id DESC
  `).all();
  res.json(rows);
});

app.get('/books/:id', (req, res) => {
  const row = bookWithAgg.get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

// admin-only
app.post('/books', requireAuth, requireRole('admin'), (req, res) => {
  const { title, author, year, genre, cover, description } = req.body || {};
  if (!title || !author) return res.status(400).json({ error: 'title & author required' });
  const info = db.prepare(`
    INSERT INTO books (title, author, year, genre, cover, description)
    VALUES (?,?,?,?,?,?)
  `).run(title, author, year, genre, cover, description);
  res.status(201).json(bookWithAgg.get(info.lastInsertRowid));
});

app.put('/books/:id', requireAuth, requireRole('admin'), (req, res) => {
  const { title, author, year, genre, cover, description } = req.body || {};
  const info = db.prepare(`
    UPDATE books SET title=?, author=?, year=?, genre=?, cover=?, description=?
    WHERE id=?
  `).run(title, author, year, genre, cover, description, req.params.id);
  if (!info.changes) return res.status(404).json({ error: 'Not found' });
  res.json(bookWithAgg.get(req.params.id));
});

app.delete('/books/:id', requireAuth, requireRole('admin'), (req, res) => {
  const info = db.prepare('DELETE FROM books WHERE id=?').run(req.params.id);
  if (!info.changes) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

// reviews public
app.get('/books/:id/reviews', (req, res) => {
  const rows = db.prepare(`
    SELECT id, username, stars, text, created_at
    FROM reviews
    WHERE book_id = ?
    ORDER BY id DESC
  `).all(req.params.id);
  res.json(rows);
});

app.post('/books/:id/reviews', (req, res) => {
  const { username, stars, text } = req.body || {};
  const s = Number(stars || 0);
  if (!username || !s || s < 1 || s > 5) {
    return res.status(400).json({ error: 'username and stars(1..5) required' });
  }
  db.prepare(`
    INSERT INTO reviews (book_id, username, stars, text)
    VALUES (?, ?, ?, ?)
  `).run(req.params.id, username.trim(), s, text || null);

  const book = bookWithAgg.get(req.params.id);
  const reviews = db.prepare(`
    SELECT id, username, stars, text, created_at
    FROM reviews
    WHERE book_id = ?
    ORDER BY id DESC
  `).all(req.params.id);
  res.status(201).json({ book, reviews });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API ready → http://localhost:${PORT}`));
