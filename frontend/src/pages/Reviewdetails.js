
// src/pages/Reviewdetails.js
import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchExternalBookDetails, getReviews, addReview, mongoInsert } from "../api";
import StarRating from "../components/StarRating";
import CoverImage from "../components/CoverImage";
import { AuthContext } from "../App";

function pastelFromString(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return `hsl(${h}, 70 %, 95 %)`;
}

export default function ReviewDetails() {
  const { id } = useParams(); // This is now the OLID (e.g., OL123W)
  const { user } = React.useContext(AuthContext);

  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [username, setUsername] = useState("");
  const [stars, setStars] = useState(0);
  const [text, setText] = useState("");
  const [mongoBusy, setMongoBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmitToMongo(e) {
    e.preventDefault();
    try {
      setMongoBusy(true);
      // Build a review-shaped doc for Mongo
      const doc = {
        kind: "review",
        book_id: id,
        book_title: book?.title,
        username: username || (user?.username ?? "Anonymous"),
        stars: Number(stars) || 0,
        text: text || null,
        appVersion: "book-review-system v1"
      };
      const resp = await mongoInsert(doc);
      if (resp?.insertedId) {
        alert("Saved to MongoDB ✔");
      } else {
        alert("Mongo insert did not return an insertedId");
      }
    } catch (err) {
      alert("Mongo insert failed: " + (err?.message || String(err)));
    } finally {
      setMongoBusy(false);
    }
  }

  const bg = useMemo(() => pastelFromString(id || "book"), [id]);
  useEffect(() => { document.body.style.setProperty("--page-bg", bg); return () => document.body.style.removeProperty("--page-bg"); }, [bg]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [bookData, reviewsData] = await Promise.all([
          fetchExternalBookDetails(id),
          getReviews(id)
        ]);
        setBook(bookData);
        setReviews(reviewsData);
      } catch (err) {
        console.error(err);
        setError("Failed to load book details");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!username || !stars) { alert("Please add your name and a star rating."); return; }
    // POST to /books/:id/reviews using OLID
    const { reviews: updatedList } = await addReview(id, { username, stars, text });
    setReviews(updatedList);
    setUsername(""); setStars(0); setText("");
    // Note: addReview returns { book, reviews }, but since 'book' is now external, 
    // we probably just rely on the API returning reviews or re-fetching.
    // The existing api method adds a review and returns updated data.
    // If backend logic for `addReview` updates a 'local' book, it might be irrelevant now,
    // but returning reviews is key.
  };

  if (loading) return <div className="container"><div className="card">Loading…</div></div>;
  if (error) return <div className="container"><div className="error">{error}</div></div>;
  if (!book) return <div className="container"><div className="card">Book not found</div></div>;

  const title = book.title;
  const authors = Array.isArray(book.authors) ? book.authors.join(", ") : (book.authors || "Unknown Author");
  const coverUrl = book.coverUrl || "/logo192.png";
  // If backend external details includes 'description' as string or object
  const description = typeof book.description === 'object' ? book.description?.value : book.description;
  const avgRating = book.avg_rating || 0;
  // Note: Open Library might not give us our local rating average easily unless we mix it in.
  // For now, we display mostly static data or if `getReviews` or `bookData` includes it.

  // Check if we need to merge local rating info. 
  // If `getReviews` returns reviews, we can calculate local rating on the fly if needed,
  // or rely on what `fetchExternalBookDetails` gave us (if it merged it). 
  // The user prompt implies `fetchExternalBookDetails` just gets data.
  // Let's compute average from reviews if `book.avg_rating` is missing?
  // Existing `book` object had `avg_rating`.
  // I'll use what's available.

  return (
    <div className="container details-shell">
      <div className="details-banner vstack">
        <h1 className="details-title pop">{title}</h1>
        <p className="details-meta">{authors} • {book.year} • {book.genre || "Genre"}</p>
        <div className="orange-stars"><StarRating value={avgRating} /></div>
        <div className="details-rating-sub">
          {reviews.length ? `${reviews.length} rating(s)` : "Be the first to rate"}
        </div>
      </div>

      <div className="floating-hero cover-wrap">
        <CoverImage
          className="details-cover-float"
          coverUrl={coverUrl}
          title={title}
        />
        {/* Admin/Edit actions might be legacy now, can check user role but links might point to legacy routes */}
      </div>

      <div className="card details-card lifted no-overlap titlecard-stripe">
        {description && (
          <div className="details-about">
            <h3>About this book</h3>
            <p>{description}</p>
          </div>
        )}

        <div className="details-form">
          <h3>Add your review</h3>
          <form onSubmit={submitReview}>
            <div className="form-row">
              <div className="form-col">
                <label>Username</label>
                <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Your name" required />
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
                <textarea rows={4} value={text} onChange={e => setText(e.target.value)} placeholder="Share what you liked..." />
              </div>
            </div>
            <button type="submit" className="btn gray">Submit Review</button>
            <button
              onClick={handleSubmitToMongo}
              className="btn"
              type="button"
              disabled={mongoBusy}
              style={{ marginLeft: 8 }}
            >
              {mongoBusy ? "Saving…" : "Submit to MongoDB"}
            </button>

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
