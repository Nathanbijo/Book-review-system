const API = process.env.REACT_APP_API_URL || "http://localhost:4000";

export const getBooks   = () => fetch(`${API}/books`).then(r => r.json());
export const getBook    = (id) => fetch(`${API}/books/${id}`).then(r => r.json());
export const addBook    = (data) =>
  fetch(`${API}/books`, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(data)}).then(r=>r.json());
export const updBook    = (id,data) =>
  fetch(`${API}/books/${id}`, { method:"PUT", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(data)}).then(r=>r.json());
export const delBook    = (id) => fetch(`${API}/books/${id}`, { method:"DELETE" }).then(r=>r.json());

// NEW:
export const getReviews = (id) => fetch(`${API}/books/${id}/reviews`).then(r => r.json());
export const addReview  = (id, payload) =>
  fetch(`${API}/books/${id}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).then(r => r.json());
