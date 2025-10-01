// backend/server.js
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// IMPORTANT: point this to the same db you created in TablePlus
const dbPath = path.join(__dirname, 'db.sqlite'); // adjust if you saved it elsewhere
const db = new Database(dbPath);

// helper: book with avg rating + count
const bookWithAgg = db.prepare(`
SELECT b.*,
       (SELECT ROUND(AVG(stars),1) FROM ratings r WHERE r.book_id=b.id) AS avg_rating,
       (SELECT COUNT(*) FROM ratings r WHERE r.book_id=b.id) AS ratings_count
FROM books b WHERE b.id = ?`);

// ROUTES
app.get('/books', (req, res) => {
  const rows = db.prepare(`
    SELECT b.*,
           (SELECT ROUND(AVG(stars),1) FROM ratings r WHERE r.book_id=b.id) AS avg_rating,
           (SELECT COUNT(*) FROM ratings r WHERE r.book_id=b.id) AS ratings_count
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

app.post('/books', (req, res) => {
  const { title, author, year, genre, cover, description } = req.body;
  if (!title || !author) return res.status(400).json({ error: 'title & author required' });
  const info = db.prepare(`
    INSERT INTO books (title, author, year, genre, cover, description)
    VALUES (?,?,?,?,?,?)
  `).run(title, author, year, genre, cover, description);
  res.status(201).json(bookWithAgg.get(info.lastInsertRowid));
});

app.put('/books/:id', (req, res) => {
  const { title, author, year, genre, cover, description } = req.body;
  const info = db.prepare(`
    UPDATE books SET title=?, author=?, year=?, genre=?, cover=?, description=?
    WHERE id=?
  `).run(title, author, year, genre, cover, description, req.params.id);
  if (!info.changes) return res.status(404).json({ error: 'Not found' });
  res.json(bookWithAgg.get(req.params.id));
});

app.delete('/books/:id', (req, res) => {
  const info = db.prepare('DELETE FROM books WHERE id=?').run(req.params.id);
  if (!info.changes) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

app.post('/books/:id/rate', (req, res) => {
  const stars = Number(req.body.stars || 0);
  if (stars < 1 || stars > 5) return res.status(400).json({ error: 'stars must be 1..5' });
  db.prepare('INSERT INTO ratings (book_id, stars) VALUES (?, ?)').run(req.params.id, stars);
  res.json(bookWithAgg.get(req.params.id));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API ready → http://localhost:${PORT}`));
