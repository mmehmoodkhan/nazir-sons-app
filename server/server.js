import express from "express";
// const express = require("express");
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import orderRoutes from "./routes/order.js";
import paymentRoutes from "./routes/payment.js";
import statsRoute from "./routes/statsRoute.js";
import deliverySlotRoutes from "./routes/deliverySlots.js";
import phoneOtpRoutes from "./routes/phoneOtp.js";
import contactRoutes from "./routes/contact.js";
import deliverySettingRoutes from "./routes/deliverySettings.js";

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowed =
        /^http:\/\/localhost:5173$/.test(origin) ||
        /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:5173$/.test(origin);
      callback(null, allowed);
    },
    credentials: true,
  }),
);
app.use(express.json());

// Connect MongoDB
mongoose;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

// test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working" });
});

// Use routes
// server.js or app.js
// const orderRoutes = require("./routes/order");
app.use("/api/order", orderRoutes); //  this + "/checkout" = /api/order/checkout
app.use("/api/products", productRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/delivery-slots", deliverySlotRoutes);
app.use("/api/phone-otp", phoneOtpRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/delivery-settings", deliverySettingRoutes);
app.use("/api", statsRoute);
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
