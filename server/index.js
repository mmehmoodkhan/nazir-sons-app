require('dotenv').config();
const express = require("express");
const cors = require("cors");
const connectDB = require('./config/db');
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js"; // ← .js extension required

dotenv.config();

const app = express();
const router = express.Router();
const { getProducts, addProduct } = require("./controllers/productController");

// Connect to MongoDB
connectDB();
app.use(express.json());
app.use(cors({ origin: "http://localhost:5000" }));


// Routes
router.get("/products", getProducts);
router.post("/products", addProduct);

// Mount router
app.use(router);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
