// client/src/services/adminApi.js
import axios from "axios";

const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/admin`
    : "http://localhost:5000/api/admin",
  headers: {
    "Content-Type": "application/json",
  },
});

adminApi.interceptors.request.use(
  (cfg) => {
    const token = localStorage.getItem("math_admin_token");
    if (token) {
      cfg.headers.Authorization = `Bearer ${token}`;
    }
    return cfg;
  },
  (err) => Promise.reject(err)
);

adminApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      if (!window.location.pathname.startsWith("/admin/login")) {
        localStorage.removeItem("math_admin_token");
        localStorage.removeItem("math_admin_user");
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(err);
  }
);

export const adminAuth = {
  login: (identifier, password) =>
    adminApi.post("/auth/login", { identifier, password }).then((r) => r.data),
  logout: () => adminApi.post("/auth/logout").then((r) => r.data),
  getMe: () => adminApi.get("/auth/me").then((r) => r.data),
};

export const adminDashboard = {
  getSummary: () => adminApi.get("/dashboard/summary").then((r) => r.data),
  getCharts: () => adminApi.get("/dashboard/charts").then((r) => r.data),
};

export const adminQuestions = {
  list: (params) => adminApi.get("/questions", { params }).then((r) => r.data),
  get: (id) => adminApi.get(`/questions/${id}`).then((r) => r.data),
  create: (data) => adminApi.post("/questions", data).then((r) => r.data),
  update: (id, data) => adminApi.put(`/questions/${id}`, data).then((r) => r.data),
  delete: (id) => adminApi.delete(`/questions/${id}`).then((r) => r.data),
  togglePublish: (id) => adminApi.post(`/questions/${id}/publish`).then((r) => r.data),
  previewImport: (rows) => adminApi.post("/questions/import/preview", { rows }).then((r) => r.data),
  commitImport: (rows, defaultStatus) =>
    adminApi.post("/questions/import/commit", { rows, defaultStatus }).then((r) => r.data),
  export: (params) => adminApi.get("/questions/export", { params }).then((r) => r.data),
  getTemplate: () => adminApi.get("/questions/template").then((r) => r.data),
};

export const adminQuizzes = {
  list: (params) => adminApi.get("/quizzes", { params }).then((r) => r.data),
  get: (id) => adminApi.get(`/quizzes/${id}`).then((r) => r.data),
  create: (data) => adminApi.post("/quizzes", data).then((r) => r.data),
  update: (id, data) => adminApi.put(`/quizzes/${id}`, data).then((r) => r.data),
  delete: (id) => adminApi.delete(`/quizzes/${id}`).then((r) => r.data),
};

export const adminRealms = {
  listRealms: () => adminApi.get("/realms").then((r) => r.data),
  createRealm: (data) => adminApi.post("/realms", data).then((r) => r.data),
  updateRealm: (id, data) => adminApi.put(`/realms/${id}`, data).then((r) => r.data),
  listMissions: (realmSlug) =>
    adminApi.get("/missions", { params: { realmSlug } }).then((r) => r.data),
  createMission: (data) => adminApi.post("/missions", data).then((r) => r.data),
  updateMission: (id, data) => adminApi.put(`/missions/${id}`, data).then((r) => r.data),
};

export const adminPlayers = {
  list: (params) => adminApi.get("/players", { params }).then((r) => r.data),
  get: (id) => adminApi.get(`/players/${id}`).then((r) => r.data),
  updateStatus: (id, status, reason) =>
    adminApi.patch(`/players/${id}/status`, { status, reason }).then((r) => r.data),
  resetProgress: (id, reason) =>
    adminApi.post(`/players/${id}/reset`, { reason }).then((r) => r.data),
};

export const adminEconomy = {
  get: () => adminApi.get("/economy").then((r) => r.data),
  update: (data) => adminApi.put("/economy", data).then((r) => r.data),
};

export const adminAnalytics = {
  getDetailed: (params) => adminApi.get("/analytics/detailed", { params }).then((r) => r.data),
};

export const adminAnnouncements = {
  list: () => adminApi.get("/announcements").then((r) => r.data),
  create: (data) => adminApi.post("/announcements", data).then((r) => r.data),
  update: (id, data) => adminApi.put(`/announcements/${id}`, data).then((r) => r.data),
  delete: (id) => adminApi.delete(`/announcements/${id}`).then((r) => r.data),
};

export const adminAi = {
  generate: (data) => adminApi.post("/ai/generate", data).then((r) => r.data),
};

export const adminAudit = {
  list: (params) => adminApi.get("/audit-logs", { params }).then((r) => r.data),
};

export const adminUsers = {
  list: () => adminApi.get("/users").then((r) => r.data),
  create: (data) => adminApi.post("/users", data).then((r) => r.data),
  update: (id, data) => adminApi.patch(`/users/${id}`, data).then((r) => r.data),
};

export default adminApi;
