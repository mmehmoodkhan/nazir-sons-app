import express from "express";
import Order from "../models/order.js";
import User from "../models/User.js";

const router = express.Router();

router.get("/stats", async (req, res) => {
  try {
    // Total revenue from delivered orders
    const totalRevenueData = await Order.aggregate([
      { $match: { status: "delivered" } },          // 👈 only delivered
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }  // 👈 totalPrice not amount
    ]);

    // Pending payments (cod + pending paymentStatus)
    const pendingData = await Order.aggregate([
      { $match: { paymentStatus: "pending" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }  // 👈 totalPrice not amount
    ]);

    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();

    res.json({
      totalRevenue:    totalRevenueData[0]?.total || 0,   // 👈 0 if no data
      totalOrders,
      totalUsers,
      pendingPayments: pendingData[0]?.total || 0,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;