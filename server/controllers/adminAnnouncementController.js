// server/controllers/adminAnnouncementController.js
import Announcement from "../models/Announcement.js";
import { createAuditRecord } from "../middleware/adminAuthMiddleware.js";

export async function listAnnouncements(req, res) {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 }).lean();
    res.json({ announcements });
  } catch (err) {
    res.status(500).json({ message: "Failed to list announcements." });
  }
}

export async function createAnnouncement(req, res) {
  try {
    const { title, message, category = "update", targetAudience = "all", priority = "normal", status = "published" } = req.body;
    if (!title || !message) {
      return res.status(400).json({ message: "Title and message are required." });
    }

    const announcement = await Announcement.create({
      title,
      message,
      category,
      targetAudience,
      priority,
      status,
      createdBy: req.admin._id,
    });

    await createAuditRecord({
      actor: req.admin,
      action: "CREATE_ANNOUNCEMENT",
      resourceType: "announcement",
      resourceId: announcement._id,
      changeSummary: `Created announcement "${announcement.title}" (${status})`,
      req,
    });

    res.status(201).json({ announcement, message: "Announcement created successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to create announcement." });
  }
}

export async function updateAnnouncement(req, res) {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: "Announcement not found." });

    Object.assign(announcement, req.body);
    await announcement.save();

    await createAuditRecord({
      actor: req.admin,
      action: "UPDATE_ANNOUNCEMENT",
      resourceType: "announcement",
      resourceId: announcement._id,
      changeSummary: `Updated announcement "${announcement.title}"`,
      req,
    });

    res.json({ announcement, message: "Announcement updated." });
  } catch (err) {
    res.status(500).json({ message: "Failed to update announcement." });
  }
}

export async function deleteAnnouncement(req, res) {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) return res.status(404).json({ message: "Announcement not found." });

    await createAuditRecord({
      actor: req.admin,
      action: "DELETE_ANNOUNCEMENT",
      resourceType: "announcement",
      resourceId: req.params.id,
      changeSummary: `Deleted announcement "${announcement.title}"`,
      req,
    });

    res.json({ message: "Announcement deleted." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete announcement." });
  }
}

// Public API for student portal to show live notifications
export async function getActiveAnnouncements(req, res) {
  try {
    const now = new Date();
    const announcements = await Announcement.find({
      status: "published",
      $or: [{ expiresAt: null }, { expiresAt: { $gte: now } }],
    })
      .sort({ priority: -1, createdAt: -1 })
      .limit(5)
      .lean();

    res.json({ announcements });
  } catch (err) {
    res.status(500).json({ message: "Failed to load active announcements." });
  }
}
