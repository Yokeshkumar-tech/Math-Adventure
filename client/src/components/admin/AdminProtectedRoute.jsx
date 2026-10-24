// client/src/components/admin/AdminProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import AdminLayout from "./AdminLayout.jsx";

export default function AdminProtectedRoute({ requiredPermission, superAdminOnly = false }) {
  const token = localStorage.getItem("math_admin_token");
  const user = (() => {
    try {
      const saved = localStorage.getItem("math_admin_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();

  if (!token || !user) {
    return <Navigate to="/admin/login" replace />;
  }

  const isSuperAdmin = user.role === "superadmin";

  if (superAdminOnly && !isSuperAdmin) {
    return (
      <AdminLayout>
        <div className="p-8 text-center space-y-4">
          <div className="text-4xl">🛡️</div>
          <h2 className="text-xl font-bold text-rose-400">Super Administrator Privileges Required</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            You do not have permission to view or manage this administrative section. Please contact your Super Administrator.
          </p>
        </div>
      </AdminLayout>
    );
  }

  if (requiredPermission && !isSuperAdmin) {
    const permissions = user.permissions || [];
    if (!permissions.includes(requiredPermission)) {
      return (
        <AdminLayout>
          <div className="p-8 text-center space-y-4">
            <div className="text-4xl">🔒</div>
            <h2 className="text-xl font-bold text-amber-400">Permission Denied</h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Your role does not grant the required privilege: <code>{requiredPermission}</code>.
            </p>
          </div>
        </AdminLayout>
      );
    }
  }

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}
