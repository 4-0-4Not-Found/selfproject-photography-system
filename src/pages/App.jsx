// src/pages/App.jsx - UPDATED
import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./Home";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import Navbar from "../components/Navbar";
import Bookings from "./Bookings";
import ProtectedRoute from "../components/ProtectedRoute";
import Orders from "./Orders";

export default function App() {
  return (
    <div>
      <Navbar />
      <Routes>
  <Route path="/" element={<Home />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/dashboard" element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } />
  <Route path="/bookings" element={
    <ProtectedRoute>
      <Bookings />
    </ProtectedRoute>
  } />
  
  <Route path="/orders" element={
  <ProtectedRoute>
    <Orders />
  </ProtectedRoute>
} />
      </Routes>
    </div>
  );
}
