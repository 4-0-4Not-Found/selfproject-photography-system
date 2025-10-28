import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Get user role from token
  const getUserRole = () => {
    if (!token) return null;
    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      return tokenData.role;
    } catch (error) {
      return null;
    }
  };

  const userRole = getUserRole();

  return (
    <nav style={{ padding: "10px", background: "#eee", marginBottom: "20px" }}>
      <Link to="/" style={{ marginRight: "10px" }}>Home</Link>
      {!token ? (
        <>
          <Link to="/login" style={{ marginRight: "10px" }}>Login</Link>
          <Link to="/register" style={{ marginRight: "10px" }}>Register</Link>
        </>
      ) : (
        <>
          <Link to="/dashboard" style={{ marginRight: "10px" }}>Dashboard</Link>
          <Link to="/bookings" style={{ marginRight: "10px" }}>Bookings</Link>
          <Link to="/orders" style={{ marginRight: "10px" }}>Orders</Link>
          
          {/* ADMIN LINK - ONLY SHOW FOR ADMINS */}
          {userRole === 'admin' && (
            <Link to="/admin" style={{ marginRight: "10px", color: "red", fontWeight: "bold" }}>
              ⚙️ Admin
            </Link>
          )}
          
          <button onClick={handleLogout} style={{ marginLeft: "10px" }}>
            Logout
          </button>
        </>
      )}
    </nav>
  );
}