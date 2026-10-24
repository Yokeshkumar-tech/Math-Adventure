// server/middleware/authMiddleware.js
import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Please log in to continue your adventure." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret_key");
    req.user = decoded; // { id, role, username }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Session expired, please log in again to continue your adventure." });
  }
}

export function optionalAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret_key");
    req.user = decoded;
  } catch {
    req.user = null;
  }
  next();
}

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "This area is for teachers or administrators." });
  }
  next();
};

