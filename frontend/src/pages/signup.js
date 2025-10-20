// src/pages/signup.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup } from "../api";
import { AuthContext } from "../App";
import "./auth.css";
import bgLogin from "../assets/bg-login.jpg"; 

export default function Signup() {
  const { setUser } = React.useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const isValid = () => username.trim().length >= 3 && password.length >= 6;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!isValid()) { setError("Username (min 3) and Password (min 6) required."); return; }
    const res = await signup({ username, password }); // role defaults to "user"
    if (res.error) { setError(res.error); return; }
    if (res.sessionId) localStorage.setItem("sessionId", res.sessionId);
    setUser(res.user || null);
    navigate("/", { replace: true });
  };

  return (
    <div className="auth-screen">
  <div className="auth-bg" style={{ backgroundImage: `url(${bgLogin})` }} />  {/* CHANGED */}
  <div className="auth-card glass">
        <h1 className="login-title">Create account</h1>
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <label htmlFor="u2">Username</label>
          <input id="u2" type="text" value={username} onChange={(e)=>setUsername(e.target.value)} minLength={3} required />

          <label htmlFor="p2">Password</label>
          <input id="p2" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} minLength={6} required />

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="btn block">Sign up</button>
          <div className="small muted center">
            Already have an account? <Link to="/login">Log in</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
