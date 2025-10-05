// src/components/navbar.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../App";
import { logout } from "../api";

function Avatar({ name = "?" }) {
  const letter = (name || "?").slice(0, 1).toUpperCase();
  return <div className="avatar-circle" aria-hidden>{letter}</div>;
}

export default function Navbar() {
  const { user, setUser } = React.useContext(AuthContext);
  const navigate = useNavigate();

  const doLogout = async () => {
    try { await logout(); } catch {}
    localStorage.removeItem("sessionId");
    setUser(null);
    navigate("/login", { replace: true });
  };

  return (
    <header className="site-header center-header">
      <Link to="/" className="brand">
        <img src="/wordwave-logo.png" alt="WordWave logo" className="brand-logo lg" />
        <span className="brand-text xl">QuillMark</span>
      </Link>

      <div className="page-actions">
        {user && (
          <div className="user-chip" title={`${user.username} (${user.role})`}>
            <Avatar name={user.username} />
            <span className="user-name">{user.username}</span>
            <span className="user-role">{user.role}</span>
            <button className="btn tiny" onClick={doLogout}>Logout</button>
          </div>
        )}
      </div>
    </header>
  );
}
