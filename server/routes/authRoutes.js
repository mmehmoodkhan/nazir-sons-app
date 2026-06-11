import express from "express";
import { sendOTPEmail } from "../utils/mailer.js";
// import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import axios from "axios";
const router = express.Router();
const otpStore = new Map();
// google start 

router.post("/google", async (req, res) => {
  const { token } = req.body;

  if (!token)
    return res.status(400).json({ message: "Token is required." });

  try {
    // Step 1: Verify Google token
    // const ticket = await googleClient.verifyIdToken({
    //   idToken: token,
    //   audience: process.env.GOOGLE_CLIENT_ID,
    // });
    // const googleRes = await axios.get(
    //   `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`
    // );

    // const { email, name, sub: googleId } = ticket.getPayload();

    // // Step 2: Find or create user
    // let user = await User.findOne({ email });
    const googleRes = await axios.get(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`
    );

    const { email, name, sub: googleId } = googleRes.data;

    console.log("Google profile:", { email, name, googleId });

    if (!email)
      return res.status(401).json({ message: "Could not get email from Google." });

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        password:   "",
        isVerified: true,
        provider:   "google",
        providerId: googleId,
      });
    }

    // Step 3: Issue JWT
    const jwtToken = jwt.sign(
      { userId: user._id, role: user.role || "user" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token: jwtToken,
      user: { userId: user._id, name: user.name, email: user.email },
    });

  } catch (err) {
    console.error("Google verify error:", err.message);
    return res.status(401).json({ message: "Invalid Google token." });
  }
});
// google end 

router.put("/update-profile", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { name, email } = req.body;

    const user = await User.findByIdAndUpdate(
      decoded.userId,
      { name, email },
      { new: true }
    );

    return res.json({ message: "Profile updated.", user });
  } catch (err) {
    return res.status(500).json({ message: "Server error." });
  }
});

// ── POST /api/auth/admin-login ────────────────────────

router.post("/admin-login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password." });

    // check role
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Invalid email or password." });

    // generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});
// ── POST /api/auth/register ───────────────────────────
router.post("/register", async (req, res) => {
  console.log("REGISTER BODY:", req.body);
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required." });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already in use." });

    const hashed = await bcrypt.hash(password, 10);

    // ✅ Single save — no duplicate
    const user = await User.create({
      name,
      email,
      password: hashed,
      isVerified: false,
    });

    console.log("User saved:", user);
    return res.status(201).json({ message: "Registered! Please verify your email." });

  } catch (err) {
    console.error("Register error:", err.message);
    return res.status(500).json({ message: "Server error." });
  }
});

// ── POST /api/auth/login ──────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password." });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Invalid email or password." });

    res.json({
      user: { userId: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// Mailer setup start here

// In-memory store — replace with Redis or DB in production

// Structure: email → { otp, expiresAt, attempts }

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// POST /api/auth/resend-verification  ← called by your modal on mount / resend
// routes/authRoutes.js

router.post("/resend-verification", async (req, res) => {
  const { email } = req.body;

  if (!email)
    return res.status(400).json({ message: "Email is required." }); // ✅ return

  const existing = otpStore.get(email);

  if (existing) {
    const secondsSinceSent = (Date.now() - existing.sentAt) / 1000;
    if (secondsSinceSent < 60) {
      const waitSeconds = Math.ceil(60 - secondsSinceSent);
      return res.status(429).json({                                  // ✅ return
        message: `Please wait ${waitSeconds} seconds.`,
      });
    }
  }

  const otp = generateOTP();
  otpStore.set(email, {
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000,
    sentAt: Date.now(),
    attempts: 0,
  });

  try {
    await sendOTPEmail(email, otp);
    return res.json({ message: "Verification code sent." });         // ✅ return
  } catch (err) {
    console.error("Mail error:", err.message);
    return res.status(500).json({ message: "Failed to send email." }); // ✅ return
  }
});

router.post("/verify-email", async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code)
    return res.status(400).json({ message: "Email and code are required." }); // ✅

  const record = otpStore.get(email);

  if (!record)
    return res.status(400).json({ message: "No code found. Request a new one." }); // ✅

  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    return res.status(400).json({ message: "Code expired. Request a new one." }); // ✅
  }

  if (record.attempts >= 5) {
    otpStore.delete(email);
    return res.status(429).json({ message: "Too many attempts. Request a new code." }); // ✅
  }

  if (record.otp !== code) {
    record.attempts += 1;
    return res.status(400).json({ message: "Invalid code. Try again." }); // ✅
  }

  try {
    const user = await User.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true }
    );
    otpStore.delete(email);
    return res.json({ message: "Email verified!", user });           // ✅ return
  } catch (err) {
    console.error("Verify error:", err.message);
    return res.status(500).json({ message: "Server error." });       // ✅ return
  }
});

// end mailer

export default router;
