// client/src/components/admin/AdminLayout.jsx
import React, { useState } from "react";
import { Link, NavLink, useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  HelpCircle,
  Upload,
  BookOpenCheck,
  Compass,
  GraduationCap,
  Users,
  Coins,
  CalendarDays,
  Swords,
  BarChart3,
  Megaphone,
  Sparkles,
  History,
  ShieldCheck,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import "./AdminLayout.css";

const NAVIGATION_ITEMS = [
  { label: "Overview", path: "/admin/overview", icon: LayoutDashboard, permission: "view_analytics" },
  { label: "Question Bank", path: "/admin/questions", icon: HelpCircle, permission: "manage_questions" },
  { label: "Question Upload", path: "/admin/questions/upload", icon: Upload, permission: "manage_questions" },
  { label: "Quiz Builder", path: "/admin/quizzes", icon: BookOpenCheck, permission: "manage_quizzes" },
  { label: "Realms and Missions", path: "/admin/realms", icon: Compass, permission: "manage_realms" },
  { label: "Topics & Curriculum", path: "/admin/topics", icon: GraduationCap, permission: "manage_questions" },
  { label: "Players Directory", path: "/admin/players", icon: Users, permission: "manage_players" },
  { label: "Rewards and Economy", path: "/admin/economy", icon: Coins, permission: "manage_economy" },
  { label: "Daily Quests", path: "/admin/daily-quests", icon: CalendarDays, permission: "manage_missions" },
  { label: "Boss Battles", path: "/admin/boss-battles", icon: Swords, permission: "manage_realms" },
  { label: "Learning Analytics", path: "/admin/analytics", icon: BarChart3, permission: "view_analytics" },
  { label: "Announcements", path: "/admin/announcements", icon: Megaphone, permission: "manage_announcements" },
  { label: "AI Generator", path: "/admin/ai-generator", icon: Sparkles, permission: "manage_questions" },
  { label: "Audit Logs", path: "/admin/audit-logs", icon: History, permission: "view_analytics" },
  { label: "Admin Users", path: "/admin/users", icon: ShieldCheck, superAdminOnly: true },
  { label: "Settings", path: "/admin/settings", icon: Settings, superAdminOnly: true },
];

export default function AdminLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const adminUser = (() => {
    try {
      const saved = localStorage.getItem("math_admin_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();

  const isSuperAdmin = adminUser?.role === "superadmin";
  const userPerms = adminUser?.permissions || [];

  const handleLogout = () => {
    localStorage.removeItem("math_admin_token");
    localStorage.removeItem("math_admin_user");
    navigate("/admin/login");
  };

  // Filter navigation items by role and permissions
  const visibleNav = NAVIGATION_ITEMS.filter((item) => {
    if (item.superAdminOnly && !isSuperAdmin) return false;
    if (isSuperAdmin) return true;
    if (!item.permission) return true;
    return userPerms.includes(item.permission);
  });

  return (
    <div className="admin-layout-root">
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${mobileOpen ? "mobile-open" : ""}`}>
        {/* Brand Header */}
        <div className="admin-sidebar-header">
          <div className="admin-brand-title">
            <span className="text-2xl">🧙‍♂️</span>
            <div>
              <span className="text-white font-fredoka">Math Adventure</span>
              <span className="block text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                Admin Console
              </span>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="admin-nav-list">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive: match }) =>
                  `admin-nav-item ${match ? "active" : ""}`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
                {item.superAdminOnly && (
                  <span className="admin-nav-badge">Super</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer with Admin Info */}
        <div className="admin-sidebar-footer">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-md">
              {adminUser?.avatar === "mage" ? "🧙" : adminUser?.avatar === "explorer" ? "🧭" : "🛡️"}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">
                {adminUser?.name || "Admin Master"}
              </div>
              <div className="text-[11px] text-indigo-400 font-semibold uppercase tracking-wider">
                {adminUser?.role?.replace("_", " ") || "Administrator"}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main-container">
        {/* Header */}
        <header className="admin-header">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-slate-500">Admin Control Center</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-indigo-400 font-bold capitalize">
                {location.pathname.replace("/admin/", "").replace(/-/g, " ") || "Overview"}
              </span>
            </div>
            
            {/* Live Telemetry Status Pill */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-Time Engine Online</span>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-all shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Student Realm</span>
            </Link>

            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Render child pages */}
        <main className="admin-page-content">{children || <Outlet />}</main>
      </div>
    </div>
  );
}
