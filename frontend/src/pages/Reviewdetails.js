// src/pages/Reviewdetails.js
import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getBook, getReviews, addReview } from "../api";
import { getCover } from "../data/books";
import StarRating from "../components/StarRating";
import { AuthContext } from "../App";

function pastelFromString(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return `hsl(${h} 70% 95%)`;
}

export default function ReviewDetails() {
  const { id } = useParams();
  const { user } = React.useContext(AuthContext);

  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [username, setUsername] = useState("");
  const [stars, setStars] = useState(0);
  const [text, setText] = useState("");

  const bg = useMemo(() => pastelFromString(id || "book"), [id]);
  useEffect(() => { document.body.style.setProperty("--page-bg", bg); return () => document.body.style.removeProperty("--page-bg"); }, [bg]);

  useEffect(() => {
    getBook(id).then(setBook);
    getReviews(id).then(setReviews);
  }, [id]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!username || !stars) { alert("Please add your name and a star rating."); return; }
    const { book: updatedBook, reviews: updatedList } = await addReview(id, { username, stars, text });
    setBook(updatedBook);
    setReviews(updatedList);
    setUsername(""); setStars(0); setText("");
  };

  if (!book) return <div className="container"><div className="card">Loading…</div></div>;

  const isAdmin = user && user.role === "admin";

  return (
    <div className="container details-shell">
      <div className="details-banner vstack">
        <h1 className="details-title pop">{book.title}</h1>
        <p className="details-meta">{book.author} • {book.year} • {book.genre}</p>
        <div className="orange-stars"><StarRating value={book.avg_rating} /></div>
        <div className="details-rating-sub">
          {book.ratings_count ? `${book.ratings_count} rating(s)` : "Be the first to rate"}
        </div>
      </div>

      <div className="floating-hero cover-wrap">
        <img className="details-cover-float" src={getCover(book.cover)} alt={`${book.title} cover`} />
        {isAdmin && (
          <div className="cover-actions">
            <Link className="icon-btn" to={`/edit/${book.id}`} title="Edit">✏️</Link>
            <Link className="icon-btn danger" to={`/delete/${book.id}`} title="Delete">🗑️</Link>
          </div>
        )}
      </div>

      <div className="card details-card lifted no-overlap titlecard-stripe">
        {book.description && (
          <div className="details-about">
            <h3>About this book</h3>
            <p>{book.description}</p>
          </div>
        )}

        <div className="details-form">
          <h3>Add your review</h3>
          <form onSubmit={submitReview}>
            <div className="form-row">
              <div className="form-col">
                <label>Username</label>
                <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Your name" required />
              </div>
              <div className="form-col">
                <label>Your rating</label>
                <div className="orange-stars">
                  <StarRating value={stars} editable onChange={setStars} />
                </div>
              </div>
            </div>
            <div className="form-row">
              <div className="form-col full">
                <label>Your review</label>
                <textarea rows={4} value={text} onChange={e=>setText(e.target.value)} placeholder="Share what you liked..." />
              </div>
            </div>
            <button type="submit" className="btn gray">Submit Review</button>
          </form>
        </div>

        <div className="details-reviews">
          <h3>What readers say</h3>
          {reviews.length === 0 && <p className="muted">No reviews yet.</p>}
          <ul className="review-list">
            {reviews.map(r => (
              <li key={r.id} className="review-item">
                <div className="review-date">{new Date(r.created_at).toLocaleString()}</div>
                {r.text && <p className="review-text italic bigger">{r.text}</p>}
                <div className="review-user italic">- {r.username}</div>
                <div className="review-stars orange-stars">
                  <StarRating value={r.stars} showLabel={false} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
