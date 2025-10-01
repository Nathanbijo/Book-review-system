import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBooks } from "../api";
import { getCover } from "../data/books";

function Home() {
  const [books, setBooks] = useState([]);
  useEffect(() => { getBooks().then(setBooks).catch(() => setBooks([])); }, []);

  return (
    <div className="container">
      <h2 style={{ marginBottom: 20 }}>Browse Books</h2>
      <div className="grid">
        {books.map(b => (
          <Link key={b.id} to={`/review/${b.id}`} className="book-card">
            <img className="book-cover" src={getCover(b.cover)} alt={`${b.title} cover`} />
            <div className="book-meta">
              <h3 className="book-title">{b.title}</h3>
              <p className="book-author">{b.author}</p>
              {b.avg_rating
                ? <p className="muted">⭐ {b.avg_rating} ({b.ratings_count})</p>
                : <p className="muted">No ratings</p>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Home;
