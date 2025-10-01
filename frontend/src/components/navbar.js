// src/components/navbar.js
import React from "react";
import { Link } from "react-router-dom";

/**
 * Put your logo at:  public/wordwave-logo.png
 */
function Navbar() {
  return (
    <header className="site-header center-header">
      <Link to="/" className="brand">
        <img src="/wordwave-logo.png" alt="WordWave logo" className="brand-logo lg" />
        <span className="brand-text xl">WordWave</span>
      </Link>
    </header>
  );
}

export default Navbar;
