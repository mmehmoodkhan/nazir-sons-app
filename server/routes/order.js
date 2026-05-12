import express from "express";
import Order from "./models/Order.js";  // ✅ .js extension required in ESM

const router = express.Router();

router.post("/checkout", async (req, res) => {
  try {
    const {
      orderId, userId, customer, delivery,
      deliverySlot, deliveryCode, orderNote,
      items, subTotal, shipCharges, totalPrice,
      paymentMethod, paymentStatus,
    } = req.body;

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
      shipCharges,
      totalPrice,
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
    const orders = await Order.find().sort({ createdAt: -1 }); // newest first
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
});

// PATCH update order status
router.patch("/:orderId/status", async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId },
      { status },
      { new: true }
    );
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update status" });
  }
});

export default router;  // ✅ export not module.exports