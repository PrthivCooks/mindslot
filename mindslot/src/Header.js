import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Simulating user role (You might fetch this from context or API)
  const userRole = localStorage.getItem("role") || "user"; // Example: "admin" or "user"

  const handleLogoClick = () => {
    if (userRole === "admin1") {
      navigate("/admin-homepage/1");
    } else if (userRole === "admin2"){
      navigate("/admin-homepage/2");
    }else if (userRole === "admin3"){
        navigate("/admin-homepage/3");
    }else{
        navigate("/")
      }
  };

  return (
    <div className="header">
      {/* Burger Menu Button */}
      <button
        className={`burger-menu ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </button>

      {/* Clickable Centered Logo */}
      <h1 className="logo" onClick={handleLogoClick}>MindSlot</h1>

      {/* Profile Button */}
      <div className="profile-section">
        <Link to="/profile" className="profile-btn">Profile</Link>
      </div>

      {/* Smooth Animated Dropdown Menu */}
      <div className={`dropdown-menu ${menuOpen ? "show" : ""}`}>
        <Link to="/rate-us" className="dropdown-item" onClick={() => setMenuOpen(false)}>Rate Us</Link>
        <Link to="/contact" className="dropdown-item" onClick={() => setMenuOpen(false)}>Contact Us</Link>
        <Link to="/credits" className="dropdown-item" onClick={() => setMenuOpen(false)}>Credits</Link>
      </div>
    </div>
  );
}
