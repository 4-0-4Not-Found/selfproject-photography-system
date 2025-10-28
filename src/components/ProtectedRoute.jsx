import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const token = localStorage.getItem("token");
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If adminOnly is specified, check user role
  if (adminOnly) {
    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      if (tokenData.role !== "admin") {
        return <Navigate to="/dashboard" replace />;
      }
    } catch (error) {
      localStorage.removeItem("token");
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;