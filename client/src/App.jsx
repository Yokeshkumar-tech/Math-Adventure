// client/src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Pages
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

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased font-outfit">
          <Navbar />
          <main className="flex-1 pb-16">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Welcome />} />
              <Route path="/login" element={<Login />} />

              {/* Protected Student Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
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

              {/* 404 Catch All */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
