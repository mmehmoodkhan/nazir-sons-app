import express from "express";
// const express = require("express");
import mongoose from "mongoose";
import cors from  "cors";
import dotenv from "dotenv";
dotenv.config(); 

import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import orderRoutes from "./models/order.js";
import paymentRoutes  from "./routes/payment.js";

const app = express();

app.use(cors());
app.use(express.json());

// Connect MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/groceryApp");

// ✅ test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working" });
});

// Use routes
// server.js or app.js
// const orderRoutes = require("./routes/order");
app.use("/api/order", orderRoutes);  // ✅ this + "/checkout" = /api/order/checkout
app.use("/api/products", productRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/auth", authRoutes);    
app.listen(5000, () => {
  console.log("Server running on port 5000");
});