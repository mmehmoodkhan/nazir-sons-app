import express from "express";
import { sendOTPEmail, sendPasswordResetEmail } from "../utils/mailer.js";
// import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import axios from "axios";
const router = express.Router();
const otpStore = new Map();
const passwordResetStore = new Map();
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

    if (user.isBlocked) {
      return res.status(403).json({ message: "Your account has been blocked." });
    }

    // Step 3: Issue JWT
    const jwtToken = jwt.sign(
      { userId: user._id, role: user.role || "user" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token: jwtToken,
      user: {
        userId: user._id,
        name: user.name,
        email: user.email,
        isVerified: Boolean(user.isVerified),
        provider: user.provider || "email",
      },
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

    if (user.isBlocked) {
      return res.status(403).json({ message: "Your account has been blocked." });
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

    //  Single save — no duplicate
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

    if (user.isBlocked) {
      return res.status(403).json({ message: "Your account has been blocked." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Invalid email or password." });

    const token = jwt.sign(
      { userId: user._id, role: user.role || "user" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        userId: user._id,
        name: user.name,
        email: user.email,
        isVerified: Boolean(user.isVerified),
        provider: user.provider || "email",
      },
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

const generateResetToken = () => crypto.randomBytes(24).toString("hex");

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email)
    return res.status(400).json({ message: "Email is required." });

  const user = await User.findOne({ email });

  // Always respond with a generic message to avoid email enumeration.
  if (!user) {
    return res.json({
      message: "If that email exists, a reset link has been sent.",
    });
  }

  const token = generateResetToken();
  passwordResetStore.set(email, {
    token,
    expiresAt: Date.now() + 30 * 60 * 1000,
  });

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetLink = `${frontendUrl}/reset-password?email=${encodeURIComponent(
    email,
  )}&token=${token}`;

  try {
    await sendPasswordResetEmail(email, resetLink);
    return res.json({ message: "Reset link sent to your email!" });
  } catch (err) {
    console.error("Password reset email error:", err.message);
    return res.status(500).json({ message: "Unable to send reset email." });
  }
});

router.post("/reset-password", async (req, res) => {
  const { email, token, password } = req.body;

  if (!email || !token || !password)
    return res.status(400).json({ message: "Email, token and password are required." });

  const record = passwordResetStore.get(email);
  if (!record || record.token !== token)
    return res.status(400).json({ message: "Invalid or expired reset token." });

  if (Date.now() > record.expiresAt) {
    passwordResetStore.delete(email);
    return res.status(400).json({ message: "Reset token expired. Request a new link." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email address." });

    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
    await user.save();
    passwordResetStore.delete(email);

    return res.json({ message: "Password has been updated successfully." });
  } catch (err) {
    console.error("Reset password error:", err.message);
    return res.status(500).json({ message: "Server error." });
  }
});

// end mailer

// GET /api/auth/admin-profile - logged-in admin profile
router.get("/admin-profile", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Admins only." });
    }

    const admin = await User.findById(decoded.userId).select(
      "-password -providerId",
    );

    if (!admin) {
      return res.status(404).json({ message: "Admin profile not found." });
    }

    return res.json({ success: true, admin });
  } catch (err) {
    console.error("Fetch admin profile error:", err.message);
    return res.status(500).json({ message: "Server error." });
  }
});

// GET /api/auth/profile - logged-in user profile
router.get("/profile", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select(
      "-password -providerId",
    );

    if (!user) return res.status(404).json({ message: "User not found." });

    return res.json({ success: true, user });
  } catch (err) {
    console.error("Fetch profile error:", err.message);
    return res.status(500).json({ message: "Server error." });
  }
});

// GET /api/auth/users - admin users list
router.get("/users", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Admins only." });
    }

    const users = await User.find({})
      .select("-password -providerId")
      .sort({ createdAt: -1 });

    return res.json({ success: true, users });
  } catch (err) {
    console.error("Fetch users error:", err.message);
    return res.status(500).json({ message: "Server error." });
  }
});

// PATCH /api/auth/users/:id/block - admin block/unblock user
router.patch("/users/:id/block", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Admins only." });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.role === "admin") {
      return res.status(400).json({ message: "Admin users cannot be blocked." });
    }

    user.isBlocked = Boolean(req.body.isBlocked);
    await user.save();

    const updatedUser = await User.findById(user._id).select(
      "-password -providerId",
    );

    return res.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error("Block user error:", err.message);
    return res.status(500).json({ message: "Server error." });
  }
});

export default router;
