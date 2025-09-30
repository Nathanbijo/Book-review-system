import React from "react";
import { Link } from "react-router-dom";

function Home() {
  const reviews = [
    { id: "1", title: "Atomic Habits", review: "Great book about habits!", author: "James Clear" },
    { id: "2", title: "The Alchemist", review: "A classic with deep lessons.", author: "Paulo Coelho" },
  ];

  return (
    <div className="container">
      <h2>Book Reviews</h2>
      {reviews.map((book) => (
        <div className="card" key={book.id}>
          <h3>{book.title}</h3>
          <p>{book.review}</p>
          <p><em>- {book.author}</em></p>

          {/* Action Buttons */}
          <div style={{ marginTop: "10px" }}>
            <Link to={`/edit/${book.id}`} className="btn">✏️ Edit</Link>
            <button
              className="btn danger"
              onClick={() => alert(`Deleted review: ${book.title}`)}
              style={{ marginLeft: "10px" }}
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Home;
