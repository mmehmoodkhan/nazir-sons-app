const orderSchema = new mongoose.Schema({
  userId: String,
  items: Array,
  totalPrice: Number,
  address: String,
  status: { type: String, default: "pending" },
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);