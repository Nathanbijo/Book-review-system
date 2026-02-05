// backend/routes/externalBooks.js
const express = require('express');
const router = express.Router();
const Database = require('better-sqlite3');
const path = require('path');

const {
  fetchWork,
  fetchSubject,
  normalizeWorkFromSubject,
  buildCoverUrl,
} = require('../openLibraryClient');

// TODO: add caching for subject/work responses to reduce Open Library calls.
// TODO: handle Open Library rate limits and timeouts more gracefully.

// Initialize SQLite connection
const dbPath = path.join(__dirname, '../db.sqlite');
const db = new Database(dbPath);

/**
 * Helper: fetch local aggregates for a set of book_keys from SQLite.
 * Assumes a table reviews(book_key TEXT, stars INTEGER, ...).
 */
function getAggregatesForBookKeys(bookKeys) {
  if (!bookKeys.length) return {};
  const placeholders = bookKeys.map(() => '?').join(',');
  const sql = `
    SELECT book_key, AVG(stars) AS avgStars, COUNT(*) AS reviewCount
    FROM reviews
    WHERE book_key IN (${placeholders})
    GROUP BY book_key
  `;
  try {
    const rows = db.prepare(sql).all(...bookKeys);
    return rows.reduce((acc, row) => {
      acc[row.book_key] = {
        avgStars: row.avgStars ? Number(row.avgStars.toFixed(2)) : null,
        reviewCount: row.reviewCount || 0,
      };
      return acc;
    }, {});
  } catch (e) {
    console.error('Error fetching aggregates:', e);
    return {};
  }
}

/**
 * GET /books/external/:olid
 * Fetch details for a single work by OLID and merge with local aggregates.
 */
router.get('/external/:olid', async (req, res) => {
  const { olid } = req.params;

  try {
    const work = await fetchWork(olid);

    const coverId = Array.isArray(work.covers) ? work.covers[0] : null;
    const title = work.title || 'Untitled';
    const description =
      typeof work.description === 'string'
        ? work.description
        : work.description && typeof work.description.value === 'string'
          ? work.description.value
          : null;
    const subjects = Array.isArray(work.subjects) ? work.subjects : [];
    const year = work.first_publish_date || work.created?.value || null;

    const coverUrl = buildCoverUrl({ coverId, olid });

    const aggregates = getAggregatesForBookKeys([olid]);
    const agg = aggregates[olid] || { avgStars: null, reviewCount: 0 };

    res.json({
      id: olid,
      title,
      description,
      subjects,
      year,
      coverUrl,
      avgStars: agg.avgStars,
      reviewCount: agg.reviewCount,
    });
  } catch (err) {
    console.error(`Error in GET /books/external/${olid}:`, err);
    res.status(500).json({ error: 'Failed to fetch book details' });
  }
});

/**
 * GET /books/genre/:subject?sort=popularity&page=1
 * List works for a subject (genre) and sort by popularity.
 */
router.get('/genre/:subject', async (req, res) => {
  const { subject } = req.params;
  const page = parseInt(req.query.page || '1', 10);
  const sort = req.query.sort || 'popularity';
  const limit = 30;
  const offset = (page - 1) * limit;

  try {
    const subjectData = await fetchSubject(subject, { limit, offset });
    const works = subjectData.works || [];

    const normalized = works.map(normalizeWorkFromSubject);
    const keys = normalized.map(w => w.id);
    const aggregates = getAggregatesForBookKeys(keys);

    const enriched = normalized.map(book => {
      const agg = aggregates[book.id] || { avgStars: null, reviewCount: 0 };
      return {
        ...book,
        avgStars: agg.avgStars,
        reviewCount: agg.reviewCount,
      };
    });

    let sorted = enriched;
    if (sort === 'popularity') {
      sorted = [...enriched].sort((a, b) => {
        const aCount = a.reviewCount || 0;
        const bCount = b.reviewCount || 0;
        const aStars = a.avgStars || 0;
        const bStars = b.avgStars || 0;
        const aScore = Math.log(1 + aCount) * aStars;
        const bScore = Math.log(1 + bCount) * bStars;
        return bScore - aScore;
      });
    }

    res.json({
      page,
      subject,
      totalWorks: subjectData.work_count || works.length,
      books: sorted,
    });
  } catch (err) {
    console.error(`Error in GET /books/genre/${subject}:`, err);
    res.status(500).json({ error: 'Failed to fetch genre books' });
  }
});

module.exports = router;
