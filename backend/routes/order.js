import express from "express";
import Order from "../models/order.js";
import Product from "../models/Product.js";
import jwt from "jsonwebtoken";
import { verifyPhoneOtpToken } from "./phoneOtp.js";
import { calculateShippingCharge, getDeliveryPricing } from "./deliverySettings.js";

const router = express.Router();
// =====================

router.get("/my-orders", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ success: false, message: "Unauthorized." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const orders = await Order.find({ userId: decoded.userId }).sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (err) {
    console.error("my-orders error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
});
// ================
router.post("/checkout", async (req, res) => {
  try {
    const {
      orderId, userId, customer, delivery,
      deliverySlot, deliveryCode, orderNote,
      items, subTotal,
      paymentMethod, paymentStatus, phoneOtpToken,
    } = req.body;

    if (!verifyPhoneOtpToken(customer?.phone, phoneOtpToken)) {
      return res.status(400).json({
        success: false,
        message: "Please verify your phone number before placing the order.",
      });
    }

    //  STEP 1 — Check and reduce stock before saving order
    const pricing = await getDeliveryPricing();
    const finalShipCharges = calculateShippingCharge(subTotal, pricing);
    const finalTotalPrice = Number(subTotal || 0) + finalShipCharges;

    for (const item of items) {
      const product = await Product.findById(item._id); // cart sends _id not productId

      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.name}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Not enough stock for: ${product.name}` });
      }

      await Product.findByIdAndUpdate(item._id, {
        $inc: { stock: -item.quantity }, //  reduce stock
      });
    }

    //  STEP 2 — Save order after stock is confirmed
    const order = new Order({
      orderId,
      userId,
      customer,
      delivery,
      deliverySlot,
      deliveryCode,
      orderNote,
      items,
      subTotal,
      shipCharges: finalShipCharges,
      totalPrice: finalTotalPrice,
      paymentMethod,
      paymentStatus,
      status: "pending",
      createdAt: new Date(),
    });

    await order.save();
    res.status(200).json({ success: true, message: "Order placed successfully", orderId });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Order failed" });
  }
});

// GET all orders for admin
router.get("/all", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
});

//  PATCH — update status + restore stock if cancelled (single clean route)
router.patch("/:orderId/status", async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findOne({ orderId: req.params.orderId });

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    //  Restore stock if admin cancels
    if (status === "cancelled" && order.status !== "cancelled") {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item._id, {
          $inc: { stock: +item.quantity }, // add stock back
        });
      }
    }

    order.status = status;
    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update status" });
  }
});

export default router;
