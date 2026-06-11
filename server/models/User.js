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
      required: true,
    },
    role: { type: String, default: "user" },
    isVerified: {
      type: Boolean,
      default: false,  // ← false until OTP verified
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;