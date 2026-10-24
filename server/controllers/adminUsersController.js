// server/controllers/adminUsersController.js
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { createAuditRecord, ROLE_PERMISSIONS } from "../middleware/adminAuthMiddleware.js";

const ADMIN_ROLES = ["superadmin", "admin", "content_admin", "reviewer", "teacher"];

export async function listAdminUsers(req, res) {
  try {
    const adminUsers = await User.find({ role: { $in: ADMIN_ROLES } })
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ users: adminUsers });
  } catch (err) {
    res.status(500).json({ message: "Failed to list administrative users." });
  }
}

export async function createAdminUser(req, res) {
  try {
    const { name, username, email, password, role = "content_admin", permissions = [] } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: "Name, username, email, and password are required." });
    }

    if (!ADMIN_ROLES.includes(role)) {
      return res.status(400).json({ message: `Invalid administrative role: ${role}` });
    }

    const cleanUsername = String(username).trim().toLowerCase();
    const cleanEmail = String(email).trim().toLowerCase();

    const existing = await User.findOne({
      $or: [{ username: cleanUsername }, { email: cleanEmail }],
    });
    if (existing) {
      return res.status(409).json({ message: "An account with this username or email already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const defaultPerms = ROLE_PERMISSIONS[role] || [];
    const mergedPerms = [...new Set([...defaultPerms, ...permissions])];

    const newUser = await User.create({
      name,
      username: cleanUsername,
      email: cleanEmail,
      passwordHash,
      role,
      permissions: mergedPerms,
      status: "active",
      grade: 5,
      avatar: "mage",
    });

    await createAuditRecord({
      actor: req.admin,
      action: "CREATE_ADMIN_USER",
      resourceType: "user_permission",
      resourceId: newUser._id,
      changeSummary: `Created new ${role} account: '${newUser.username}' (${newUser.email})`,
      req,
    });

    res.status(201).json({
      message: `Administrator '${newUser.username}' created successfully.`,
      user: {
        id: newUser._id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        permissions: newUser.permissions,
        status: newUser.status,
      },
    });
  } catch (err) {
    console.error("Create admin error:", err);
    res.status(500).json({ message: err.message || "Failed to create administrator." });
  }
}

export async function updateAdminUser(req, res) {
  try {
    const { id } = req.params;
    const { role, permissions, status, name } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "Admin user not found." });

    if (role && !ADMIN_ROLES.includes(role)) {
      return res.status(400).json({ message: "Invalid role specified." });
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (Array.isArray(permissions)) user.permissions = permissions;
    if (status && ["active", "suspended"].includes(status)) user.status = status;

    await user.save();

    await createAuditRecord({
      actor: req.admin,
      action: "UPDATE_ADMIN_USER",
      resourceType: "user_permission",
      resourceId: user._id,
      changeSummary: `Updated permissions/role for '${user.username}' -> Role: ${user.role}, Status: ${user.status}`,
      req,
    });

    res.json({
      message: "Admin user updated successfully.",
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        status: user.status,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update admin user." });
  }
}
