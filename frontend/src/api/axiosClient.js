// src/api/axiosClient.js
import axios from "axios";

function resolveApiBaseURL() {
  const fromEnv = import.meta.env.VITE_API_URL?.trim();
  if (fromEnv) return fromEnv;
  if (import.meta.env.DEV) return "http://localhost:3001/api";
  if (typeof window !== "undefined") return `${window.location.origin}/api`;
  return "http://localhost:3001/api";
}

const api = axios.create({
  baseURL: resolveApiBaseURL(),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
