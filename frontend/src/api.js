// src/api.js
const API = process.env.REACT_APP_API_URL || "http://localhost:4000";

export const getBooks = () => fetch(`${API}/books`).then(r => r.json());
export const getBook  = (id) => fetch(`${API}/books/${id}`).then(r => r.json());

export const addBook  = (data) =>
  fetch(`${API}/books`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data)
  }).then(r => r.json());

export const updBook  = (id, data) =>
  fetch(`${API}/books/${id}`, {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data)
  }).then(r => r.json());

export const delBook  = (id) =>
  fetch(`${API}/books/${id}`, { method: "DELETE" }).then(r => r.json());

export const rateBook = (id, stars) =>
  fetch(`${API}/books/${id}/rate`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ stars })
  }).then(r => r.json());
