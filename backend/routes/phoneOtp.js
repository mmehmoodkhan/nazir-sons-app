import crypto from "crypto";
import express from "express";
import { sendSmsOtp } from "../services/smsService.js";
/* global process */

const router = express.Router();
const otpStore = new Map();
const OTP_TTL_MS = 5 * 60 * 1000;
const VERIFIED_TTL_MS = 15 * 60 * 1000;

function normalizePakistaniPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");

  if (/^03\d{9}$/.test(digits)) return digits;
  if (/^923\d{9}$/.test(digits)) return `0${digits.slice(2)}`;
  if (/^3\d{9}$/.test(digits)) return `0${digits}`;

  return null;
}

function createOtp() {
  return crypto.randomInt(1000, 10000).toString();
}

function createToken() {
  return crypto.randomBytes(24).toString("hex");
}

router.post("/send", async (req, res) => {
  try {
    const phone = normalizePakistaniPhone(req.body.phone);
    if (!phone) {
      return res.status(400).json({
        message: "Enter a valid Pakistani number like 03001234567.",
      });
    }

    const existing = otpStore.get(phone);
    if (existing?.sentAt && Date.now() - existing.sentAt < 60 * 1000) {
      const waitSeconds = Math.ceil((60 * 1000 - (Date.now() - existing.sentAt)) / 1000);
      return res.status(429).json({
        message: `Please wait ${waitSeconds} seconds before requesting another OTP.`,
      });
    }

    const otp = createOtp();
    otpStore.set(phone, {
      otp,
      sentAt: Date.now(),
      expiresAt: Date.now() + OTP_TTL_MS,
      attempts: 0,
    });

    await sendSmsOtp(phone, otp);

    return res.json({
      success: true,
      message: "OTP sent to your phone number.",
      devOtp: process.env.NODE_ENV === "production" ? undefined : otp,
    });
  } catch (err) {
    console.error("Send phone OTP error:", err.message);
    return res.status(500).json({ message: "Could not send OTP." });
  }
});

router.post("/verify", (req, res) => {
  const phone = normalizePakistaniPhone(req.body.phone);
  const otp = String(req.body.otp || "").trim();

  if (!phone) {
    return res.status(400).json({
      message: "Enter a valid Pakistani number like 03001234567.",
    });
  }

  if (!/^\d{4}$/.test(otp)) {
    return res.status(400).json({ message: "Enter the 4-digit OTP." });
  }

  const record = otpStore.get(phone);
  if (!record) {
    return res.status(400).json({ message: "Please request a new OTP." });
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(phone);
    return res.status(400).json({ message: "OTP expired. Request a new code." });
  }

  if (record.attempts >= 5) {
    otpStore.delete(phone);
    return res.status(429).json({ message: "Too many attempts. Request a new OTP." });
  }

  if (record.otp !== otp) {
    record.attempts += 1;
    return res.status(400).json({ message: "Invalid OTP. Try again." });
  }

  const verificationToken = createToken();
  otpStore.set(phone, {
    verified: true,
    token: verificationToken,
    expiresAt: Date.now() + VERIFIED_TTL_MS,
  });

  return res.json({
    success: true,
    message: "Phone number verified.",
    verificationToken,
  });
});

export function verifyPhoneOtpToken(phone, token) {
  const normalizedPhone = normalizePakistaniPhone(phone);
  if (!normalizedPhone || !token) return false;

  const record = otpStore.get(normalizedPhone);
  if (!record?.verified || record.token !== token) return false;

  if (Date.now() > record.expiresAt) {
    otpStore.delete(normalizedPhone);
    return false;
  }

  otpStore.delete(normalizedPhone);
  return true;
}

export default router;
