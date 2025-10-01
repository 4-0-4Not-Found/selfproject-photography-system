import React, { useState } from "react";
import api from "../utils/axios"; // Use axios instance instead of direct axios

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      console.log("Attempting login...");
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      console.log("Login success:", res.data);
      alert("Login successful!");
    } catch (err) {
      console.error("Login error:", err);
      alert(`Login failed: ${err.response?.data?.error || err.message}`);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
      <input type="email" placeholder="Email" value={email}
        onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" placeholder="Password" value={password}
        onChange={(e) => setPassword(e.target.value)} required />
      <button type="submit">Login</button>
    </form>
  );
}