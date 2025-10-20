// src/pages/login.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api";
import { AuthContext } from "../App";
import "./auth.css";
import bgLogin from "../assets/bg-login.jpg"; // NEW


export default function Login() {
  const { setUser } = React.useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const isValid = () => username.trim().length >= 3 && password.length >= 6;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!isValid()) {
      setError("Username (min 3 chars) and Password (min 6) are required.");
      return;
    }
    const res = await login({ username, password });
    if (res.error) { setError(res.error); return; }
    if (res.sessionId) localStorage.setItem("sessionId", res.sessionId);
    setUser(res.user || null);
    navigate("/", { replace: true });
  };

  return (
    <div className="auth-screen">
  <div className="auth-bg" style={{ backgroundImage: `url(${bgLogin})` }} />  {/* CHANGED */}
  <div className="auth-card glass">
        <h1 className="login-title">𝓛𝓞𝓖𝓘𝓝</h1>
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <label htmlFor="u">Username</label>
          <input
            id="u"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            minLength={3}
            required
            placeholder="e.g. Arthur"/>

          <label htmlFor="p">Password</label>
          <input
            id="p"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
            placeholder="••••••"
          />

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="btn block">Sign in</button>

          <div className="small muted center">
            New here? <Link to="/signup">Create an account</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
