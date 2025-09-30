import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <h2 style={{ color: "white" }}>📚 Book Review App</h2>
      <div>
        <Link to="/">Home</Link>
        <Link to="/add">Add Review</Link>
      </div>
    </nav>
  );
}

export default Navbar;
