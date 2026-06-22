import express from "express";
import jwt from "jsonwebtoken";
import DeliverySetting from "../models/DeliverySetting.js";

/* global process */

const router = express.Router();

const DEFAULT_SETTINGS = {
  shippingCharge: 30,
  freeShippingThreshold: 1000,
};

function toNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
}

async function getSettings() {
  let settings = await DeliverySetting.findOne({ key: "default" });
  if (!settings) {
    settings = await DeliverySetting.create({
      key: "default",
      ...DEFAULT_SETTINGS,
    });
  }
  return settings;
}

function settingsToClient(settings) {
  return {
    shippingCharge: settings.shippingCharge,
    freeShippingThreshold: settings.freeShippingThreshold,
  };
}

function requireAdmin(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Admins only." });
    }

    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

export async function getDeliveryPricing() {
  const settings = await getSettings();
  return settingsToClient(settings);
}

export function calculateShippingCharge(subTotal, settings) {
  const amount = toNumber(subTotal, 0);
  const charge = toNumber(settings?.shippingCharge, DEFAULT_SETTINGS.shippingCharge);
  const threshold = toNumber(
    settings?.freeShippingThreshold,
    DEFAULT_SETTINGS.freeShippingThreshold,
  );

  if (threshold > 0 && amount >= threshold) return 0;
  return charge;
}

router.get("/", async (req, res) => {
  try {
    const settings = await getSettings();
    return res.json({ success: true, settings: settingsToClient(settings) });
  } catch (err) {
    console.error("Fetch delivery settings error:", err.message);
    return res.status(500).json({ message: "Server error." });
  }
});

router.get("/admin", requireAdmin, async (req, res) => {
  try {
    const settings = await getSettings();
    return res.json({ success: true, settings: settingsToClient(settings) });
  } catch (err) {
    console.error("Fetch admin delivery settings error:", err.message);
    return res.status(500).json({ message: "Server error." });
  }
});

router.put("/admin", requireAdmin, async (req, res) => {
  try {
    const shippingCharge = toNumber(req.body.shippingCharge, null);
    const freeShippingThreshold = toNumber(req.body.freeShippingThreshold, null);

    if (shippingCharge === null || freeShippingThreshold === null) {
      return res.status(400).json({
        message: "Shipping charge and free shipping threshold must be valid numbers.",
      });
    }

    const settings = await DeliverySetting.findOneAndUpdate(
      { key: "default" },
      { key: "default", shippingCharge, freeShippingThreshold },
      { new: true, upsert: true, runValidators: true },
    );

    return res.json({
      success: true,
      message: "Delivery settings updated.",
      settings: settingsToClient(settings),
    });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

export default router;
