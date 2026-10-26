// client/src/services/api.js
import axios from "axios";

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (cfg) => {
    const token = localStorage.getItem("math_adventure_token");
    if (token) {
      cfg.headers.Authorization = `Bearer ${token}`;
    }
    return cfg;
  },
  (err) => Promise.reject(err)
);

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // If token expired, clear and notify
    if (err.response && err.response.status === 401) {
      if (window.location.pathname !== "/login" && window.location.pathname !== "/") {
        localStorage.removeItem("math_adventure_token");
        localStorage.removeItem("math_adventure_user");
      }
    }
    return Promise.reject(err);
  }
);

export default api;
