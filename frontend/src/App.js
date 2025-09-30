import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import Navbar and all pages
import Navbar from "./components/navbar";
import Home from "./pages/Home";
import AddReview from "./pages/Addreview";
import EditReview from "./pages/Editreview";
import ReviewDetails from "./pages/Reviewdetails";
import DeleteReview from "./pages/Deletereview";
import "./App.css";


function App() {
  return (
    <Router>
      {/* Navbar will always show at the top */}
      <Navbar />

      {/* Page content will change depending on route */}
      <div style={{ padding: "20px" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add" element={<AddReview />} />
          <Route path="/edit/:id" element={<EditReview />} />
          <Route path="/review/:id" element={<ReviewDetails />} />
          <Route path="/delete/:id" element={<DeleteReview />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
