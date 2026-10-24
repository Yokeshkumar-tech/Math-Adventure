// client/src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Student Pages
import Welcome from "./pages/Welcome.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Grades from "./pages/Grades.jsx";
import Topics from "./pages/Topics.jsx";
import Lesson from "./pages/Lesson.jsx";
import Practice from "./pages/Practice.jsx";
import Results from "./pages/Results.jsx";
import Achievements from "./pages/Achievements.jsx";
import Progress from "./pages/Progress.jsx";
import Tutor from "./pages/Tutor.jsx";
import Settings from "./pages/Settings.jsx";
import NotFound from "./pages/NotFound.jsx";

import AdventureMap from "./pages/AdventureMap.jsx";
import WorldMissions from "./pages/WorldMissions.jsx";
import MissionGame from "./pages/MissionGame.jsx";
import BossBattle from "./pages/BossBattle.jsx";
import Shop from "./pages/Shop.jsx";
import DailyChallenge from "./pages/DailyChallenge.jsx";
import Revision from "./pages/Revision.jsx";
import RealWorldMath from "./pages/RealWorldMath.jsx";
import MultiplayerArena from "./pages/MultiplayerArena.jsx";
import PlacementQuiz from "./pages/PlacementQuiz.jsx";
import LearningCenter from "./pages/LearningCenter.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";
import ParentTeacherDashboard from "./pages/ParentTeacherDashboard.jsx";

// Admin System
import AdminLogin from "./pages/admin/AdminLogin.jsx";
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute.jsx";
import AdminLayout from "./components/admin/AdminLayout.jsx";
import AdminOverview from "./pages/admin/AdminOverview.jsx";
import AdminQuestionBank from "./pages/admin/AdminQuestionBank.jsx";
import AdminQuestionEditor from "./pages/admin/AdminQuestionEditor.jsx";
import AdminQuestionUpload from "./pages/admin/AdminQuestionUpload.jsx";
import AdminQuizBuilder from "./pages/admin/AdminQuizBuilder.jsx";
import AdminRealmMissions from "./pages/admin/AdminRealmMissions.jsx";
import AdminTopics from "./pages/admin/AdminTopics.jsx";
import AdminPlayerManagement from "./pages/admin/AdminPlayerManagement.jsx";
import AdminRewardsEconomy from "./pages/admin/AdminRewardsEconomy.jsx";
import AdminDailyQuests from "./pages/admin/AdminDailyQuests.jsx";
import AdminBossBattles from "./pages/admin/AdminBossBattles.jsx";
import AdminAnalytics from "./pages/admin/AdminAnalytics.jsx";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements.jsx";
import AdminAiQuestionGenerator from "./pages/admin/AdminAiQuestionGenerator.jsx";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs.jsx";
import AdminUsersPermissions from "./pages/admin/AdminUsersPermissions.jsx";
import AdminSettings from "./pages/admin/AdminSettings.jsx";

function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const isAdventure =
    location.pathname.startsWith("/map") ||
    location.pathname.startsWith("/worlds") ||
    location.pathname.startsWith("/mission") ||
    location.pathname.startsWith("/boss") ||
    location.pathname.startsWith("/shop") ||
    location.pathname.startsWith("/challenges") ||
    location.pathname.startsWith("/revision") ||
    location.pathname.startsWith("/real-world") ||
    location.pathname.startsWith("/arena") ||
    location.pathname.startsWith("/placement") ||
    location.pathname.startsWith("/learning-center") ||
    location.pathname.startsWith("/leaderboard") ||
    location.pathname.startsWith("/parent-dashboard");

  return (
    <div
      className={`min-h-screen flex flex-col antialiased font-outfit w-full max-w-full overflow-x-hidden ${
        isAdmin
          ? "bg-slate-950 text-slate-100"
          : isAdventure
          ? "bg-slate-950 text-slate-100"
          : "bg-slate-50 text-slate-800"
      }`}
    >
      {!isAdmin && <Navbar isAdventure={isAdventure} />}
      <main
        className={`flex-1 w-full max-w-full overflow-x-hidden ${
          isAdmin || isAdventure ? "pb-0" : "pb-16"
        }`}
      >
        <Routes>
          {/* Public Student Routes */}
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Student Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/map" element={<AdventureMap />} />
            <Route path="/worlds/:worldSlug" element={<WorldMissions />} />
            <Route path="/mission/:missionId" element={<MissionGame />} />
            <Route path="/boss/:missionId" element={<BossBattle />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/challenges/daily" element={<DailyChallenge />} />
            <Route path="/revision" element={<Revision />} />
            <Route path="/real-world" element={<RealWorldMath />} />
            <Route path="/arena" element={<MultiplayerArena />} />
            <Route path="/placement" element={<PlacementQuiz />} />
            <Route path="/learning-center" element={<LearningCenter />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/parent-dashboard" element={<ParentTeacherDashboard />} />
            <Route path="/grades" element={<Grades />} />
            <Route path="/grades/:grade/topics" element={<Topics />} />
            <Route path="/lessons/:id" element={<Lesson />} />
            <Route path="/practice/:topicId" element={<Practice />} />
            <Route path="/results/:attemptId" element={<Results />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/tutor" element={<Tutor />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/overview" replace />} />
            <Route path="overview" element={<AdminOverview />} />
            <Route path="questions" element={<AdminQuestionBank />} />
            <Route path="questions/new" element={<AdminQuestionEditor />} />
            <Route path="questions/edit/:id" element={<AdminQuestionEditor />} />
            <Route path="questions/upload" element={<AdminQuestionUpload />} />
            <Route path="quizzes" element={<AdminQuizBuilder />} />
            <Route path="realms" element={<AdminRealmMissions />} />
            <Route path="topics" element={<AdminTopics />} />
            <Route path="players" element={<AdminPlayerManagement />} />
            <Route path="economy" element={<AdminRewardsEconomy />} />
            <Route path="daily-quests" element={<AdminDailyQuests />} />
            <Route path="boss-battles" element={<AdminBossBattles />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
            <Route path="ai-generator" element={<AdminAiQuestionGenerator />} />
            <Route path="audit-logs" element={<AdminAuditLogs />} />
            <Route path="users" element={<AdminUsersPermissions />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* 404 Catch All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
