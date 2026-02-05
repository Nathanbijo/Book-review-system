import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchGenreBooks } from "../api";
import CoverImage from "../components/CoverImage";

// small star renderer for list cards
function Stars({ value = 0, size = 16 }) {
  const n = Math.round(Number(value || 0));
  return (
    <span className="stars" aria-label={`Rating ${value || 0} out of 5`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          className={`star ${s <= n ? "on" : "off"}`}
        >
          <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
    </span>
  );
}

const GENRES = ["fantasy", "fiction", "romance", "science_fiction", "history", "thriller"];

export default function Home() {
  const [books, setBooks] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("fantasy");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { document.title = "Home - Book Review System"; }, []);

  // fetch from Open Library by genre
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchGenreBooks(selectedGenre, { page: 1, sort: 'popularity' });
        if (mounted) setBooks(data.books || []);
      } catch (err) {
        console.error(err);
        if (mounted) setError("Failed to load books");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [selectedGenre]);

  return (
    <div className="home">
      {/* Hero */}
      <header className="home-hero">
        <h1>Browse Books</h1>
        <p>Find something great to read. Filter by genre from Open Library.</p>

        <div className="filters">
          <div className="select">
            <label htmlFor="genre">Genre</label>
            <select
              id="genre"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
            >
              {GENRES.map((g) => (
                <option key={g} value={g}>
                  {g.replace("_", " ").toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Grid */}
      <section className="book-grid">
        {loading && <div className="spinner"></div>}
        {error && <div className="error">{error}</div>}

        {!loading && !error && books.map((b) => {
          // b is from Open Library: { id, title, authors: [], coverUrl, first_publish_year }
          const rating = b.avgStars || 0;
          // Use merged stats from backend if available, else 0

          return (
            <Link to={`/review/${b.id}`} key={b.id} className="book-card">
              <figure className="book-cover">
                <CoverImage coverUrl={b.coverUrl} title={b.title} />
              </figure>
              <div className="book-meta">
                <h3 className="book-title">{b.title}</h3>
                <p className="book-author">{b.authors?.join(", ") || "Unknown Author"}</p>
                <div className="book-row">
                  <Stars value={rating} />
                  <span className="book-rating">
                    {b.reviewCount ? `${rating}/5 (${b.reviewCount})` : "No ratings"}
                  </span>
                </div>
                <div className="book-tags">
                  <span className="tag">{selectedGenre}</span>
                  <span className="dot">•</span>
                  <span className="muted">{b.first_publish_year || "—"}</span>
                </div>
              </div>
            </Link>
          );
        })}

        {!loading && !error && books.length === 0 && (
          <div className="empty">No books found.</div>
        )}
      </section>
    </div>
  );
}
