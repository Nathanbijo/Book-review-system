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
 * Order: coverId → ISBN → OLID.
 */
function buildCoverUrl({ coverId, isbn, olid, size = 'M' }) {
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

module.exports = {
  fetchWork,
  fetchSubject,
  buildCoverUrl,
  normalizeWorkFromSubject,
};
