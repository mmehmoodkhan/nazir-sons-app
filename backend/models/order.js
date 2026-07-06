import mongoose from "mongoose";  // ✅ import not require

const orderSchema = new mongoose.Schema({
  orderId:       { type: String, required: true, unique: true },
  userId:        { type: String },
  customer: {
    firstName:   String,
    lastName:    String,
    email:       String,
    phone:       String,
  },
  delivery: {
    address:     String,
    houseNo:     String,
    area:        String,
    city:        String,
    deliverHere: String,
  },
  deliverySlot:  { type: Object },
  deliveryCode:  { type: String },
  orderNote:     { type: String },
  items:         { type: Array, required: true },
  subTotal:      { type: Number },
  shipCharges:   { type: Number },
  totalPrice:    { type: Number },
  paymentMethod: { type: String, enum: ["cod", "jazzcash", "easypaisa"] },
  paymentStatus: { type: String, enum: ["pending", "paid"], default: "pending" },
  status:        { type: String, enum: ["pending", "confirmed", "delivered", "cancelled"], default: "pending" },
  createdAt:     { type: Date, default: Date.now },
  deliverySlot: {
    dateLabel: { type: String },
    time:      { type: String },
    type:      { type: String }, // "free" or "express"
},
});

export default mongoose.model("Order", orderSchema); 