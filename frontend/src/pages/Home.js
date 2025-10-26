import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getBooks } from "../api";            // <-- uses your backend
import { getCover } from "../data/books";     // fallback util you already have
useEffect(() => { document.title = "Home - Book Review System"; }, []);
if (loading) return <div className="spinner"></div>;

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

export default function Home() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [genre, setGenre] = useState("All");

  // fetch from DB
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getBooks();   // GET /books from backend
        if (mounted) setBooks(Array.isArray(data) ? data : []);
      } catch (e) {
        if (mounted) setBooks([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // genres from fetched data
  const genres = useMemo(() => {
    const g = new Set(books.map((b) => b.genre).filter(Boolean));
    return ["All", ...Array.from(g)];
  }, [books]);

  // filter + search
  const filtered = useMemo(() => {
    return books.filter((b) => {
      const matchesGenre = genre === "All" || b.genre === genre;
      const matchesQ =
        q.trim() === "" ||
        [b.title, b.author, b.genre, String(b.year)]
          .join(" ")
          .toLowerCase()
          .includes(q.toLowerCase());
      return matchesGenre && matchesQ;
    });
  }, [books, genre, q]);

  return (
    <div className="home">
      {/* Hero */}
      <header className="home-hero">
        <h1>Browse Books</h1>
        <p>Find something great to read. Filter by genre or search by title/author.</p>

        <div className="filters">
          <div className="search">
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by title, author, year…"
              aria-label="Search books"
            />
          </div>
          <div className="select">
            <label htmlFor="genre">Genre</label>
            <select id="genre" value={genre} onChange={(e) => setGenre(e.target.value)}>
              {genres.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Grid */}
      <section className="book-grid">
        {loading && <div className="empty">Loading…</div>}

        {!loading && filtered.map((b) => {
          const rating = b.avg_rating ? Number(b.avg_rating) : 0;
          return (
            <Link to={`/review/${b.id}`} key={b.id} className="book-card">
              <figure className="book-cover">
                <img
                  src={getCover(b.cover)}                 // use DB cover or fallback
                  alt={`${b.title} cover`}
                  loading="lazy"
                  onError={(e) => { e.currentTarget.src = getCover(""); }}  // final safety
                />
              </figure>
              <div className="book-meta">
                <h3 className="book-title">{b.title}</h3>
                <p className="book-author">{b.author}</p>
                <div className="book-row">
                  <Stars value={rating} />
                  <span className="book-rating">
                    {b.ratings_count ? `${rating}/5 (${b.ratings_count})` : "No ratings"}
                  </span>
                </div>
                <div className="book-tags">
                  <span className="tag">{b.genre || "—"}</span>
                  <span className="dot">•</span>
                  <span className="muted">{b.year || "—"}</span>
                </div>
              </div>
            </Link>
          );
        })}

        {!loading && filtered.length === 0 && (
          <div className="empty">No books found. Try clearing filters or searching something else.</div>
        )}
      </section>
    </div>
  );
}
