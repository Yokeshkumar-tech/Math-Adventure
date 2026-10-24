// server/routes/adminRoutes.js
import express from "express";
import {
  requireAdmin,
  requirePermission,
  requireSuperAdmin,
} from "../middleware/adminAuthMiddleware.js";

import { adminLogin, adminLogout, getAdminMe } from "../controllers/adminAuthController.js";
import { getDashboardSummary, getDashboardCharts } from "../controllers/adminDashboardController.js";
import {
  listQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  togglePublish,
  previewImport,
  commitImport,
  exportQuestions,
  getImportTemplate,
} from "../controllers/adminQuestionController.js";
import {
  listQuizzes,
  createQuiz,
  getQuizById,
  updateQuiz,
  deleteQuiz,
} from "../controllers/adminQuizController.js";
import {
  listRealms,
  createRealm,
  updateRealm,
  listMissions,
  createMission,
  updateMission,
} from "../controllers/adminRealmController.js";
import {
  listPlayers,
  getPlayerById,
  updatePlayerStatus,
  resetPlayerProgress,
} from "../controllers/adminPlayerController.js";
import { getEconomyConfig, updateEconomyConfig } from "../controllers/adminEconomyController.js";
import { getDetailedAnalytics } from "../controllers/adminAnalyticsController.js";
import {
  listAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getActiveAnnouncements,
} from "../controllers/adminAnnouncementController.js";
import { generateAiQuestions } from "../controllers/adminAiController.js";
import { listAuditLogs } from "../controllers/adminAuditController.js";
import {
  listAdminUsers,
  createAdminUser,
  updateAdminUser,
} from "../controllers/adminUsersController.js";

const router = express.Router();

// ==========================================
// 1. ADMIN AUTHENTICATION
// ==========================================
router.post("/auth/login", adminLogin);
router.post("/auth/logout", requireAdmin, adminLogout);
router.get("/auth/me", requireAdmin, getAdminMe);

// ==========================================
// 2. DASHBOARD OVERVIEW & CHARTS
// ==========================================
router.get("/dashboard/summary", requireAdmin, getDashboardSummary);
router.get("/dashboard/charts", requireAdmin, getDashboardCharts);

// ==========================================
// 3. QUESTION BANK & BULK UPLOAD
// ==========================================
router.get("/questions/template", requireAdmin, getImportTemplate);
router.get("/questions/export", requireAdmin, exportQuestions);
router.get("/questions", requireAdmin, listQuestions);
router.get("/questions/:id", requireAdmin, getQuestionById);
router.post("/questions", requireAdmin, requirePermission("manage_questions"), createQuestion);
router.put("/questions/:id", requireAdmin, requirePermission("manage_questions"), updateQuestion);
router.delete("/questions/:id", requireAdmin, requirePermission("manage_questions"), deleteQuestion);
router.post("/questions/:id/publish", requireAdmin, requirePermission("publish_content"), togglePublish);
router.post("/questions/import/preview", requireAdmin, requirePermission("manage_questions"), previewImport);
router.post("/questions/import/commit", requireAdmin, requirePermission("manage_questions"), commitImport);

// ==========================================
// 4. QUIZ BUILDER
// ==========================================
router.get("/quizzes", requireAdmin, listQuizzes);
router.get("/quizzes/:id", requireAdmin, getQuizById);
router.post("/quizzes", requireAdmin, requirePermission("manage_quizzes"), createQuiz);
router.put("/quizzes/:id", requireAdmin, requirePermission("manage_quizzes"), updateQuiz);
router.delete("/quizzes/:id", requireAdmin, requirePermission("manage_quizzes"), deleteQuiz);

// ==========================================
// 5. REALMS & MISSIONS
// ==========================================
router.get("/realms", requireAdmin, listRealms);
router.post("/realms", requireAdmin, requirePermission("manage_realms"), createRealm);
router.put("/realms/:id", requireAdmin, requirePermission("manage_realms"), updateRealm);
router.get("/missions", requireAdmin, listMissions);
router.post("/missions", requireAdmin, requirePermission("manage_missions"), createMission);
router.put("/missions/:id", requireAdmin, requirePermission("manage_missions"), updateMission);

// ==========================================
// 6. PLAYER MANAGEMENT
// ==========================================
router.get("/players", requireAdmin, requirePermission("manage_players"), listPlayers);
router.get("/players/:id", requireAdmin, requirePermission("manage_players"), getPlayerById);
router.patch("/players/:id/status", requireAdmin, requirePermission("manage_players"), updatePlayerStatus);
router.post("/players/:id/reset", requireAdmin, requirePermission("manage_players"), resetPlayerProgress);

// ==========================================
// 7. REWARDS & GAME ECONOMY
// ==========================================
router.get("/economy", requireAdmin, getEconomyConfig);
router.put("/economy", requireAdmin, requirePermission("manage_economy"), updateEconomyConfig);

// ==========================================
// 8. LEARNING ANALYTICS
// ==========================================
router.get("/analytics/detailed", requireAdmin, requirePermission("view_analytics"), getDetailedAnalytics);

// ==========================================
// 9. ANNOUNCEMENTS
// ==========================================
router.get("/announcements", requireAdmin, listAnnouncements);
router.post("/announcements", requireAdmin, requirePermission("manage_announcements"), createAnnouncement);
router.put("/announcements/:id", requireAdmin, requirePermission("manage_announcements"), updateAnnouncement);
router.delete("/announcements/:id", requireAdmin, requirePermission("manage_announcements"), deleteAnnouncement);

// ==========================================
// 10. AI QUESTION GENERATOR
// ==========================================
router.post("/ai/generate", requireAdmin, requirePermission("manage_questions"), generateAiQuestions);

// ==========================================
// 11. AUDIT LOGS
// ==========================================
router.get("/audit-logs", requireAdmin, listAuditLogs);

// ==========================================
// 12. ADMIN USERS & PERMISSIONS (SUPER ADMIN)
// ==========================================
router.get("/users", requireAdmin, requireSuperAdmin, listAdminUsers);
router.post("/users", requireAdmin, requireSuperAdmin, createAdminUser);
router.patch("/users/:id", requireAdmin, requireSuperAdmin, updateAdminUser);

export default router;
