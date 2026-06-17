// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: false,
      default: "",
    },
    role: { type: String, default: "user" },
    isVerified: {
      type: Boolean,
      default: false, // ← false until OTP verified
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    provider: {
      type: String,
      enum: ["local", "google", "facebook"],
      default: "local",
    },
    providerId: { type: String, default: "" },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);
export default User;
