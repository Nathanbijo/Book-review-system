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

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // restore session on page load
  useEffect(() => {
    (async () => {
      try {
        const { user } = await me();
        setUser(user);
      } catch {}
      setLoading(false);
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
            {/* PUBLIC: Login/Signup */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* PRIVATE: everything else */}
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
      </Router>
    </AuthContext.Provider>
  );
}
