import React from "react";
import { useParams, useNavigate } from "react-router-dom";

function DeleteReview() {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleDelete = () => {
    console.log("Deleted Review ID:", id);
    alert("Review deleted!");
    navigate("/");
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Delete Review</h2>
        <p>Are you sure you want to delete this review?</p>
        <button
          onClick={handleDelete}
          style={{
            padding: "10px 20px",
            backgroundColor: "red",
            color: "white",
            border: "none",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          Yes, Delete
        </button>
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "10px 20px",
            backgroundColor: "gray",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default DeleteReview;
