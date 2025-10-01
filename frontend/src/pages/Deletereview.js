import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { delBook } from "../api";

function DeleteReview() {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleDelete = async () => {
    await delBook(id);
    alert("Deleted!");
    navigate("/");
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Delete Book</h2>
        <p>Are you sure you want to delete this book?</p>
        <button className="btn danger" onClick={handleDelete}>Yes, Delete</button>
        <button className="btn" style={{ marginLeft: 8 }} onClick={() => navigate(-1)}>Cancel</button>
      </div>
    </div>
  );
}

export default DeleteReview;
