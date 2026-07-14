import express from "express";
import {
  createCategory,
  getCategories
} from "../controllers/categoryController.js";

import upload from "../middleware/upload.js";

const router = express.Router();

router.post(
  "/",
  upload.single("image"),
  createCategory
);

router.get("/", getCategories);

export default router;