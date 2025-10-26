import React, { useState } from "react";
import { addBook } from "../api";
useEffect(() => { document.title = "Home - Book Review System"; }, []);

function AddReview() {
  const [title, setTitle] = useState("");
  const [review, setReview] = useState(""); // maps to description
  const [author, setAuthor] = useState("");
  const [year, setYear] = useState("");
  const [genre, setGenre] = useState("");
  const [cover, setCover] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addBook({ title, author, year: Number(year) || null, genre, cover, description: review });
    alert("Book added!");
    setTitle(""); setAuthor(""); setYear(""); setGenre(""); setCover(""); setReview("");
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Add a New Book</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label>Title</label><br/>
            <input value={title} onChange={e=>setTitle(e.target.value)} required style={{ width:"100%", padding:8 }}/>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Author</label><br/>
            <input value={author} onChange={e=>setAuthor(e.target.value)} required style={{ width:"100%", padding:8 }}/>
          </div>
          <div style={{ marginBottom: 12, display:"flex", gap:12 }}>
            <div style={{ flex:1 }}>
              <label>Year</label><br/>
              <input type="number" value={year} onChange={e=>setYear(e.target.value)} style={{ width:"100%", padding:8 }}/>
            </div>
            <div style={{ flex:1 }}>
              <label>Genre</label><br/>
              <input value={genre} onChange={e=>setGenre(e.target.value)} style={{ width:"100%", padding:8 }}/>
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Cover (relative path like /covers/xyz.jpg)</label><br/>
            <input value={cover} onChange={e=>setCover(e.target.value)} placeholder="/covers/..." style={{ width:"100%", padding:8 }}/>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Review / Description</label><br/>
            <textarea value={review} onChange={e=>setReview(e.target.value)} rows={4} style={{ width:"100%", padding:8 }}/>
          </div>
          <button type="submit" className="btn">Save</button>
        </form>
      </div>
    </div>
  );
}

export default AddReview;
  