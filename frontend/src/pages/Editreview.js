import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBook, updBook } from "../api";

function EditReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [review, setReview] = useState("");
  const [author, setAuthor] = useState("");
  const [year, setYear] = useState("");
  const [genre, setGenre] = useState("");
  const [cover, setCover] = useState("");

  useEffect(() => {
    getBook(id).then(b => {
      if (!b || b.error) return;
      setTitle(b.title || "");
      setAuthor(b.author || "");
      setYear(b.year || "");
      setGenre(b.genre || "");
      setCover(b.cover || "");
      setReview(b.description || "");
    });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updBook(id, {
      title, author,
      year: Number(year) || null,
      genre, cover,
      description: review
    });
    alert("Book updated!");
    navigate(`/review/${id}`);
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Edit Book</h2>
        <form onSubmit={handleSubmit}>
          <label>Title</label>
          <input value={title} onChange={e=>setTitle(e.target.value)} required/>

          <label>Author</label>
          <input value={author} onChange={e=>setAuthor(e.target.value)} required/>

          <div style={{ display:"flex", gap:12 }}>
            <div style={{ flex:1 }}>
              <label>Year</label>
              <input type="number" value={year} onChange={e=>setYear(e.target.value)}/>
            </div>
            <div style={{ flex:1 }}>
              <label>Genre</label>
              <input value={genre} onChange={e=>setGenre(e.target.value)}/>
            </div>
          </div>

          <label>Cover (/covers/...)</label>
          <input value={cover} onChange={e=>setCover(e.target.value)}/>

          <label>Review / Description</label>
          <textarea value={review} onChange={e=>setReview(e.target.value)} rows={4}/>

          <button type="submit" className="btn" style={{ marginTop: 10 }}>Update</button>
        </form>
      </div>
    </div>
  );
}

export default EditReview;
