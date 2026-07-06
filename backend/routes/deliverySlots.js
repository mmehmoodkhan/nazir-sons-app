import express from "express";
import jwt from "jsonwebtoken";
import DeliverySlot from "../models/DeliverySlot.js";

/* global process */

const router = express.Router();

const DEFAULT_SLOTS = [
  { startTime: "09:00", endTime: "11:00", type: "express", label: "Express", isActive: true },
  { startTime: "11:00", endTime: "13:00", type: "free", label: "Free", isActive: true },
  { startTime: "13:00", endTime: "15:00", type: "free", label: "Free", isActive: true },
  { startTime: "15:00", endTime: "17:00", type: "free", label: "Free", isActive: true },
  { startTime: "17:00", endTime: "19:00", type: "express", label: "Express", isActive: true },
  { startTime: "19:00", endTime: "21:00", type: "free", label: "Free", isActive: true },
];

function toMinutes(value) {
  const [hours, minutes] = String(value).split(":").map(Number);
  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }
  return hours * 60 + minutes;
}

function formatTime(value) {
  const [hours, minutes] = value.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

function slotToClient(slot) {
  const data = slot.toObject ? slot.toObject() : slot;
  return {
    _id: data._id,
    startTime: data.startTime,
    endTime: data.endTime,
    startHour: toMinutes(data.startTime) / 60,
    time: `${formatTime(data.startTime)} - ${formatTime(data.endTime)}`,
    type: data.type,
    label: data.label || (data.type === "express" ? "Express" : "Free"),
    isActive: data.isActive !== false,
  };
}

function normalizeSlots(slots) {
  if (!Array.isArray(slots) || slots.length === 0) {
    throw new Error("Add at least one delivery slot.");
  }

  return slots
    .map((slot) => {
      const startTime = String(slot.startTime || "").trim();
      const endTime = String(slot.endTime || "").trim();
      const startMinutes = toMinutes(startTime);
      const endMinutes = toMinutes(endTime);

      if (startMinutes === null || endMinutes === null) {
        throw new Error("Slot time must be valid.");
      }

      if (endMinutes <= startMinutes) {
        throw new Error("Slot end time must be after start time.");
      }

      const type = slot.type === "express" ? "express" : "free";

      return {
        startTime,
        endTime,
        type,
        label: type === "express" ? "Express" : "Free",
        isActive: slot.isActive !== false,
      };
    })
    .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));
}

async function getSettings() {
  let settings = await DeliverySlot.findOne({ key: "default" });
  if (!settings) {
    settings = await DeliverySlot.create({ key: "default", slots: DEFAULT_SLOTS });
  }
  return settings;
}

function requireAdmin(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Admins only." });
    }

    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

router.get("/", async (req, res) => {
  try {
    const settings = await getSettings();
    const slots = settings.slots
      .filter((slot) => slot.isActive !== false)
      .map(slotToClient);

    return res.json({ success: true, slots });
  } catch (err) {
    console.error("Fetch delivery slots error:", err.message);
    return res.status(500).json({ message: "Server error." });
  }
});

router.get("/admin", requireAdmin, async (req, res) => {
  try {
    const settings = await getSettings();
    return res.json({
      success: true,
      slots: settings.slots.map(slotToClient),
    });
  } catch (err) {
    console.error("Fetch admin delivery slots error:", err.message);
    return res.status(500).json({ message: "Server error." });
  }
});

router.put("/admin", requireAdmin, async (req, res) => {
  try {
    const slots = normalizeSlots(req.body.slots);
    const settings = await DeliverySlot.findOneAndUpdate(
      { key: "default" },
      { key: "default", slots },
      { new: true, upsert: true, runValidators: true },
    );

    return res.json({
      success: true,
      message: "Delivery slots updated.",
      slots: settings.slots.map(slotToClient),
    });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

export default router;
