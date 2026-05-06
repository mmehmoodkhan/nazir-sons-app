import express from "express";
// const express = require("express");
import mongoose from "mongoose";
import cors from "cors";

import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
const app = express();

app.use(cors());
app.use(express.json());

// Connect MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/groceryApp");

// Use routes
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);    
app.listen(5000, () => {
  console.log("Server running on port 5000");
});