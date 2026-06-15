import express from "express";
import {
  addProduct,
  updateProduct,
  getProducts,
  deleteProduct,
} from "../controllers/productController.js";
import Product from "../models/Product.js";
const router = express.Router();
// GET PRODUCTS
// router.get("/", (req, res) => {
//   res.json({ message: "Products working" });
// });
// routes/products.js
router.get("/products", async (req, res) => {
  try {
    const ids = req.query.ids?.split(",").filter(Boolean) || [];
    if (ids.length === 0) return res.json([]);

    const products = await Product.find(
      { _id: { $in: ids } },
      "name price image stock", // only send what cart needs
    );

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// get all product
router.get("/", getProducts);

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch product" });
  }
});
// add product
router.post("/add", addProduct);

// now edit product
router.put("/:id", updateProduct);

// now delete a product
router.delete("/:id", deleteProduct);

// // GET cart for a user
// router.get("/cart/:userId", getCartproducts);
// // add product
// router.post("/cart/:userId/add", addProductToCart);
router.post("/checkout", async (req, res) => {
  const { userId, items, totalPrice, address } = req.body;

  const order = new Order({
    userId,
    items,
    totalPrice,
    address,
  });

  await order.save();

  // clear cart
  await Cart.findOneAndDelete({ userId });

  res.json({ message: "Order placed successfully" });
});

router.get("/api/stats", async (req, res) => {
  try {
    const totalRevenue = await Order.sum("amount");
    const totalOrders = await Order.count();
    const totalUsers = await User.count();
    const pendingPayments = await Order.sum("amount", {
      where: { status: "pending" },
    });

    res.json({ totalRevenue, totalOrders, totalUsers, pendingPayments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
