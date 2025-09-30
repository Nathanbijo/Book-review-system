import React, { useState } from "react";

function AddReview() {
  const [title, setTitle] = useState("");
  const [review, setReview] = useState("");
  const [author, setAuthor] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("New Review:", { title, review, author });
    alert("Review added successfully!");
    setTitle("");
    setReview("");
    setAuthor("");
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Add a New Review</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <label>Book Title</label><br />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label>Review</label><br />
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              required
              style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label>Author</label><br />
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
              style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            />
          </div>
          <button type="submit" style={{ padding: "10px 20px", cursor: "pointer" }}>
            Submit Review
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddReview;
