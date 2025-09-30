import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Dummy reviews (later you’ll fetch from backend)
const dummyReviews = [
  { id: "1", title: "Atomic Habits", review: "Great book about habits!", author: "James Clear" },
  { id: "2", title: "The Alchemist", review: "A classic with deep lessons.", author: "Paulo Coelho" },
];

function EditReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [review, setReview] = useState("");
  const [author, setAuthor] = useState("");

  // Load the review based on ID
  useEffect(() => {
    const book = dummyReviews.find((item) => item.id === id);
    if (book) {
      setTitle(book.title);
      setReview(book.review);
      setAuthor(book.author);
    }
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Updated Review:", { id, title, review, author });
    alert("Review updated successfully!");
    navigate("/"); // send back to home after editing
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Edit Review</h2>
        <form onSubmit={handleSubmit}>
          <label>Book Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />

          <label>Review</label>
          <textarea value={review} onChange={(e) => setReview(e.target.value)} required />

          <label>Author</label>
          <input value={author} onChange={(e) => setAuthor(e.target.value)} required />

          <button type="submit">Update Review</button>
        </form>
      </div>
    </div>
  );
}

export default EditReview;
