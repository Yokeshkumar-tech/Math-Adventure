// server/controllers/adminAuditController.js
import AuditLog from "../models/AuditLog.js";

export async function listAuditLogs(req, res) {
  try {
    const { page = 1, limit = 25, action, resourceType, search } = req.query;

    const filter = {};
    if (action && action !== "all") filter.action = action;
    if (resourceType && resourceType !== "all") filter.resourceType = resourceType;
    if (search && search.trim()) {
      filter.$or = [
        { actorName: { $regex: search.trim(), $options: "i" } },
        { changeSummary: { $regex: search.trim(), $options: "i" } },
        { reason: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      AuditLog.countDocuments(filter),
    ]);

    res.json({
      logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve audit logs." });
  }
}
