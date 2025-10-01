import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getBook, rateBook } from "../api";
import { getCover } from "../data/books";
import StarRating from "../components/StarRating";

function ReviewDetails() {
  const { id } = useParams();
  const [book, setBook] = useState(null);

  useEffect(() => { getBook(id).then(setBook); }, [id]);

  if (!book) {
    return (
      <div className="container">
        <div className="card"><h2>Loading…</h2></div>
      </div>
    );
  }

  const onRate = async (stars) => {
    const updated = await rateBook(book.id, stars);
    setBook(updated);
  };

  return (
    <div className="container">
      <div className="card book-details">
        <div className="details-hero">
          <img className="details-cover" src={getCover(book.cover)} alt={`${book.title} cover`} />
          <div className="details-text">
            <h2>{book.title}</h2>
            <p className="muted">{book.author} • {book.year} • {book.genre}</p>
            <StarRating value={book.avg_rating} onRate={onRate} />
            <p className="muted" style={{ marginTop: 4 }}>
              {book.ratings_count ? `${book.ratings_count} rating(s)` : "Be the first to rate"}
            </p>
          </div>
        </div>

        <div className="details-body">
          <h3>About this book</h3>
          <p>{book.description}</p>
        </div>

        <div style={{ marginTop: 16 }}>
          <Link className="btn" to={`/edit/${book.id}`}>✏️ Edit</Link>
          <Link className="btn danger" style={{ marginLeft: 8 }} to={`/delete/${book.id}`}>🗑️ Delete</Link>
          <Link className="btn" style={{ marginLeft: 8 }} to="/">← Back</Link>
        </div>
      </div>
    </div>
  );
}

export default ReviewDetails;
