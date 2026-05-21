import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number, default: null },
  description: { type: String },
  image: { type: String },
  category: { type: String },
  stock: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
});
// Cart Model
const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: { type: Number, default: 1, min: 1 },
});

const cartSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true }, // simple string ID (can replace with Auth)
    items: [cartItemSchema],
  },
  { timestamps: true },
);
const Cart = mongoose.model("Cart", cartSchema);

// cart end 

const Product = mongoose.model("Product", productSchema);

export default Product;
