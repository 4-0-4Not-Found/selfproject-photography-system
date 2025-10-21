import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axios"; // Use your axios instance

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      console.log("Attempting registration...");
      const response = await api.post("/auth/register", { 
        name, email, password 
      });
      console.log("Registration success:", response.data);
      alert("Registration successful! You can now login.");
      navigate("/login");
    } catch (err) {
      console.error("Registration error:", err);
      alert(`Registration failed: ${err.response?.data?.error || err.message}`);
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <h2>Register</h2>
      <input type="text" placeholder="Name" value={name}
        onChange={(e) => setName(e.target.value)} required />
      <input type="email" placeholder="Email" value={email}
        onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" placeholder="Password" value={password}
        onChange={(e) => setPassword(e.target.value)} required />
      <button type="submit">Register</button>
    </form>
  );
}