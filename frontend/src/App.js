// src/App.js
import React, { useEffect, useMemo, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/navbar";
import Home from "./pages/Home";
import AddReview from "./pages/Addreview";
import EditReview from "./pages/Editreview";
import ReviewDetails from "./pages/Reviewdetails";
import DeleteReview from "./pages/Deletereview";
import Login from "./pages/login";
import Signup from "./pages/signup";
import { me } from "./api";
import "./App.css";

export const AuthContext = React.createContext(null);

function Protected({ children }) {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) return <div className="page-loading">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="btn sm"
      style={{
        position: "fixed",
        bottom: "30px",
        right: "30px",
        borderRadius: "50%",
        width: "45px",
        height: "45px",
        fontSize: "20px",
        boxShadow: "0 4px 12px rgba(0,0,0,.2)",
        background: "#2563eb",
        color: "white",
        border: "none",
        cursor: "pointer",
        zIndex: 1000,
      }}
      title="Back to top"
    >
      ↑
    </button>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // restore session on page load
  useEffect(() => {
    (async () => {
      try {
        const { user } = await me();
        setUser(user);
      } catch {
        // user not logged in or session expired
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const authValue = useMemo(() => ({ user, setUser, loading }), [user, loading]);

  return (
    <AuthContext.Provider value={authValue}>
      <Router>
        {/* Show navbar only after login */}
        {user && <Navbar />}

        <div style={{ padding: user ? "20px" : 0 }}>
          <Routes>
            {/* PUBLIC: Login / Signup */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* PRIVATE ROUTES */}
            <Route
              path="/"
              element={
                <Protected>
                  <Home />
                </Protected>
              }
            />
            <Route
              path="/review/:id"
              element={
                <Protected>
                  <ReviewDetails />
                </Protected>
              }
            />
            <Route
              path="/add"
              element={
                <Protected>
                  <AddReview />
                </Protected>
              }
            />
            <Route
              path="/edit/:id"
              element={
                <Protected>
                  <EditReview />
                </Protected>
              }
            />
            <Route
              path="/delete/:id"
              element={
                <Protected>
                  <DeleteReview />
                </Protected>
              }
            />

            {/* fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        {/* Back to top button always available */}
        <BackToTop />
      </Router>
    </AuthContext.Provider>
  );
}
