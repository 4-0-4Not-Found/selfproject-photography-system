// src/utils/axios.js - ORIGINAL (this was fine)
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

export default api;