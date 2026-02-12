// backend/openLibraryClient.js
const fetch = require('node-fetch');

const OPEN_LIBRARY_BASE = 'https://openlibrary.org';
const COVERS_BASE = 'https://covers.openlibrary.org';

/**
 * Fetch a work JSON by OLID (e.g. OL45883W).
 */
async function fetchWork(olid) {
  const res = await fetch(`${OPEN_LIBRARY_BASE}/works/${olid}.json`);
  if (!res.ok) {
    throw new Error(`Failed to fetch work ${olid}: ${res.status}`);
  }
  return res.json();
}

/**
 * Fetch a subject JSON (used for genre pages).
 */
async function fetchSubject(subject, { limit = 50, offset = 0 } = {}) {
  const url = `${OPEN_LIBRARY_BASE}/subjects/${encodeURIComponent(subject)}.json?limit=${limit}&offset=${offset}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch subject ${subject}: ${res.status}`);
  }
  return res.json();
}

/**
 * Build a cover URL from available identifiers.
 * Default size is 'L' (large). Pass size: 'M' or 'S' only for small thumbnails.
 * Order: coverId → ISBN → OLID.
 */
function buildCoverUrl({ coverId, isbn, olid, size = 'L' }) {
  if (coverId) {
    return `${COVERS_BASE}/b/id/${coverId}-${size}.jpg`;
  }
  if (isbn) {
    return `${COVERS_BASE}/b/isbn/${isbn}-${size}.jpg`;
  }
  if (olid) {
    return `${COVERS_BASE}/b/olid/${olid}-${size}.jpg`;
  }
  return null;
}

/**
 * Normalize a work object from the subject API into our internal shape.
 */
function normalizeWorkFromSubject(work) {
  const workKey = work.key.replace('/works/', '');
  const coverId = work.cover_id || (Array.isArray(work.covers) ? work.covers[0] : null);
  const authors = (work.authors || []).map(a => a.name).filter(Boolean);

  return {
    id: workKey,
    title: work.title || 'Untitled',
    authors,
    year: work.first_publish_year || null,
    coverUrl: buildCoverUrl({ coverId, olid: workKey }),
  };
}

/**
 * Normalize a search result doc from the Search API into our internal book card shape.
 */
function normalizeDocFromSearch(doc) {
  // doc.key is like "/works/OL27448W"
  const workKey = doc.key ? doc.key.replace('/works/', '') : null;
  const coverId = doc.cover_i || null;
  const authors = Array.isArray(doc.author_name) ? doc.author_name : [];

  return {
    id: workKey || null,
    title: doc.title || 'Untitled',
    authors,
    year: doc.first_publish_year || null,
    coverUrl: workKey || coverId
      ? buildCoverUrl({ coverId, olid: workKey })
      : null,
  };
}

// Search books by free text query using Open Library Search API.
// See: https://openlibrary.org/dev/docs/api/search
async function searchWorks(query, { page = 1 } = {}) {
  const params = new URLSearchParams({
    q: query,
    page: String(page),
  });
  const res = await fetch(`${OPEN_LIBRARY_BASE}/search.json?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to search works: ${res.status}`);
  }
  return res.json();
}

async function fetchEdition(olid) {
  const res = await fetch(`${OPEN_LIBRARY_BASE}/books/${olid}.json`);
  if (!res.ok) {
    throw new Error(`Failed to fetch edition ${olid}: ${res.status}`);
  }
  return res.json();
}

module.exports = {
  fetchWork,
  fetchSubject,
  buildCoverUrl,
  normalizeWorkFromSubject,
  searchWorks,
  normalizeDocFromSearch,
  fetchEdition, // <-- add
};
