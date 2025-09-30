import React from "react";
import { useParams } from "react-router-dom";

function ReviewDetails() {
  const { id } = useParams();

  // Dummy data for demo
  const review = {
    id,
    title: "The Alchemist",
    review: "A magical story about following your dreams.",
    author: "Paulo Coelho",
  };

  return (
    <div className="container">
      <div className="card">
        <h2>{review.title}</h2>
        <p>{review.review}</p>
        <small>- {review.author}</small>
      </div>
    </div>
  );
}

export default ReviewDetails;
