// src/api.js
const API = process.env.REACT_APP_API_URL || "http://localhost:4000";

function withSession(init = {}) {
  const sessionId = localStorage.getItem("sessionId");
  return {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
      ...(sessionId ? { "X-Session-Id": sessionId } : {}),
    },
  };
}

// auth
export const signup = (payload) =>
  fetch(`${API}/auth/signup`, withSession({ method: "POST", body: JSON.stringify(payload) }))
    .then(r => r.json());

export const login = (payload) =>
  fetch(`${API}/auth/login`, withSession({ method: "POST", body: JSON.stringify(payload) }))
    .then(r => r.json());

export const logout = () =>
  fetch(`${API}/auth/logout`, withSession({ method: "POST" }))
    .then(r => r.json());

export const me = () => fetch(`${API}/auth/me`, withSession()).then(r => r.json());

// books
export const getBooks = () => fetch(`${API}/books`).then(r => r.json());
export const getBook = (id) => fetch(`${API}/books/${id}`).then(r => r.json());
export const addBook = (data) =>
  fetch(`${API}/books`, withSession({ method: "POST", body: JSON.stringify(data) })).then(r => r.json());
export const updBook = (id, data) =>
  fetch(`${API}/books/${id}`, withSession({ method: "PUT", body: JSON.stringify(data) })).then(r => r.json());
export const delBook = (id) =>
  fetch(`${API}/books/${id}`, withSession({ method: "DELETE" })).then(r => r.json());
export const mongoInsert = (payload) =>
  fetch(`${API}/mongo/insert`, withSession({
    method: "POST",
    body: JSON.stringify(payload)
  })).then(r => r.json());


// reviews
export const getReviews = (id) => fetch(`${API}/books/${id}/reviews`).then(r => r.json());
export const addReview = (id, payload) =>
  fetch(`${API}/books/${id}/reviews`, withSession({ method: "POST", body: JSON.stringify(payload) }))
    .then(r => r.json());
// external books (Open Library)
export async function fetchGenreBooks(subject, { page = 1, sort = 'popularity' } = {}) {
  const params = new URLSearchParams({ page: String(page), sort });
  const res = await fetch(`${API}/books/genre/${encodeURIComponent(subject)}?${params.toString()}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch genre books for subject "${subject}": ${res.status}`);
  }
  return res.json();
}

export async function fetchExternalBookDetails(olid) {
  const res = await fetch(`${API}/books/external/${encodeURIComponent(olid)}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch external book details for OLID "${olid}": ${res.status}`);
  }
  return res.json();
}