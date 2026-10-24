// server/controllers/adminAuthController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { createAuditRecord, ROLE_PERMISSIONS } from "../middleware/adminAuthMiddleware.js";

const ADMIN_ROLES = ["superadmin", "admin", "content_admin", "reviewer", "teacher"];

export async function adminLogin(req, res) {
  try {
    const { identifier, password } = req.body; // username or email
    if (!identifier || !password) {
      return res.status(400).json({ message: "Identifier (username/email) and password are required." });
    }

    const cleanId = String(identifier).trim().toLowerCase();
    const user = await User.findOne({
      $or: [{ username: cleanId }, { email: cleanId }],
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid administrative credentials." });
    }

    if (!ADMIN_ROLES.includes(user.role)) {
      return res.status(403).json({
        message: "This account does not have administrative access. Please log in through the student portal.",
      });
    }

    if (user.status === "suspended") {
      return res.status(403).json({
        message: `Administrative access suspended. Reason: ${user.suspendedReason || "Contact Super Admin"}`,
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      await createAuditRecord({
        actor: user,
        action: "FAILED_LOGIN",
        resourceType: "auth",
        changeSummary: `Failed login attempt for user ${user.username}`,
        req,
      });
      return res.status(401).json({ message: "Invalid administrative credentials." });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role, username: user.username, isAdmin: true },
      process.env.JWT_SECRET || "fallback_secret_key",
      { expiresIn: "12h" }
    );

    const defaultPerms = ROLE_PERMISSIONS[user.role] || [];
    const userPerms = user.permissions || [];
    const allPermissions = [...new Set([...defaultPerms, ...userPerms])];

    await createAuditRecord({
      actor: user,
      action: "ADMIN_LOGIN",
      resourceType: "auth",
      changeSummary: `Admin logged in successfully (${user.role})`,
      req,
    });

    res.json({
      token,
      admin: {
        id: user._id,
        name: user.name,
        nickname: user.nickname,
        username: user.username,
        email: user.email,
        role: user.role,
        permissions: allPermissions,
        avatar: user.avatar,
        lastLogin: user.lastLogin,
      },
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: "Internal server error during authentication." });
  }
}

export async function adminLogout(req, res) {
  try {
    if (req.admin) {
      await createAuditRecord({
        actor: req.admin,
        action: "ADMIN_LOGOUT",
        resourceType: "auth",
        changeSummary: `Admin ${req.admin.username} logged out`,
        req,
      });
    }
    res.json({ message: "Logged out successfully." });
  } catch (err) {
    res.status(500).json({ message: "Logout error." });
  }
}

export async function getAdminMe(req, res) {
  try {
    const user = req.admin;
    const defaultPerms = ROLE_PERMISSIONS[user.role] || [];
    const userPerms = user.permissions || [];
    const allPermissions = [...new Set([...defaultPerms, ...userPerms])];

    res.json({
      admin: {
        id: user._id,
        name: user.name,
        nickname: user.nickname,
        username: user.username,
        email: user.email,
        role: user.role,
        permissions: allPermissions,
        avatar: user.avatar,
        lastLogin: user.lastLogin,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve profile." });
  }
}
