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
// app.use(cors({ origin: "http://localhost:5000" }));
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // same-origin / curl / no-origin requests
      const allowed =
        /^http:\/\/localhost:5173$/.test(origin) ||
        /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:5173$/.test(origin);
      callback(null, allowed);
    },
    credentials: true,
  })
);


// Routes
router.get("/products", getProducts);
router.post("/products", addProduct);

// Mount router
app.use(router);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
