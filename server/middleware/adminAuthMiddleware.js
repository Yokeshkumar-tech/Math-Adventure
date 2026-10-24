// server/middleware/adminAuthMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import AuditLog from "../models/AuditLog.js";

const ADMIN_ROLES = ["superadmin", "admin", "content_admin", "reviewer", "teacher"];

// Default permissions map by role
export const ROLE_PERMISSIONS = {
  superadmin: [
    "manage_questions",
    "publish_content",
    "manage_quizzes",
    "manage_realms",
    "manage_missions",
    "manage_players",
    "manage_economy",
    "manage_announcements",
    "view_analytics",
    "manage_admins",
    "manage_settings",
    "export_data",
  ],
  admin: [
    "manage_questions",
    "publish_content",
    "manage_quizzes",
    "manage_realms",
    "manage_missions",
    "manage_players",
    "manage_economy",
    "manage_announcements",
    "view_analytics",
    "export_data",
  ],
  content_admin: [
    "manage_questions",
    "publish_content",
    "manage_quizzes",
    "manage_realms",
    "manage_missions",
    "view_analytics",
  ],
  reviewer: [
    "manage_questions",
    "publish_content",
    "view_analytics",
  ],
  teacher: [
    "manage_questions",
    "view_analytics",
  ],
};

export async function requireAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Admin authentication token required." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret_key");
    const user = await User.findById(decoded.id).select("-passwordHash");

    if (!user) {
      return res.status(401).json({ message: "Admin account not found." });
    }

    if (user.status === "suspended") {
      return res.status(403).json({ message: "This administrative account is suspended." });
    }

    if (!ADMIN_ROLES.includes(user.role)) {
      return res.status(403).json({ message: "Access forbidden. Administrative privileges required." });
    }

    req.admin = user;
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Admin session expired or invalid." });
  }
}

export function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ message: "Not authenticated as administrator." });
    }

    const userRole = req.admin.role;
    if (userRole === "superadmin") {
      return next(); // Super admin bypasses all permission checks
    }

    const defaultPerms = ROLE_PERMISSIONS[userRole] || [];
    const userPerms = req.admin.permissions || [];
    const allPerms = [...new Set([...defaultPerms, ...userPerms])];

    if (!allPerms.includes(permission)) {
      return res.status(403).json({
        message: `Permission denied. Required privilege: '${permission}'`,
      });
    }

    next();
  };
}

export function requireSuperAdmin(req, res, next) {
  if (!req.admin || !["superadmin", "admin"].includes(req.admin.role)) {
    return res.status(403).json({ message: "Super Administrator privilege required." });
  }
  next();
}

/**
 * Record an entry into the AuditLog collection
 */
export async function createAuditRecord({
  actor,
  action,
  resourceType,
  resourceId = "",
  changeSummary,
  reason = "",
  metadata = {},
  req,
}) {
  try {
    const ipAddress = req?.headers["x-forwarded-for"] || req?.socket?.remoteAddress || "";
    await AuditLog.create({
      actorId: actor._id || actor.id,
      actorName: actor.name || actor.nickname || actor.username || "Admin",
      actorRole: actor.role || "admin",
      action,
      resourceType,
      resourceId: String(resourceId),
      changeSummary,
      reason,
      metadata,
      ipAddress,
    });
  } catch (err) {
    console.error("Failed to write audit record:", err.message);
  }
}
