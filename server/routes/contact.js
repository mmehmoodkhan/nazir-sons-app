import express from "express";
import { sendContactEmail } from "../utils/mailer.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, phone, email, message } = req.body || {};

    if (!name || !phone || !message) {
      return res.status(400).json({ success: false, message: "Please provide name, phone and message." });
    }

    await sendContactEmail({ name, phone, email, message });

    return res.json({ success: true, message: "Message sent. We will contact you shortly." });
  } catch (err) {
    console.error("Contact route error:", err && err.message ? err.message : err);
    return res.status(500).json({ success: false, message: "Could not send message right now." });
  }
});

export default router;
