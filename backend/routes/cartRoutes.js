import express from "express";
import Cart from "../models/Cart.js";

const router = express.Router();

// GET CART
router.get("/:userId", async (req, res) => {
  const cart = await Cart.findOne({ userId }).populate("items.productId");
  res.json(cart);
});

// ADD TO CART
router.post("/add", async (req, res) => {
  const { userId, productId, quantity } = req.body;

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = new Cart({ userId, items: [] });
  }

  const itemIndex = cart.items.findIndex(
    item => item.productId.toString() === productId
  );

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.push({ productId, quantity });
  }

  await cart.save();
  res.json(cart);
});

// MERGE CART (IMPORTANT)
router.post("/merge", async (req, res) => {
  const { userId, items } = req.body;

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = new Cart({ userId, items: [] });
  }

  items.forEach(item => {
    const index = cart.items.findIndex(
      i => i.productId.toString() === item._id
    );

    if (index > -1) {
      cart.items[index].quantity += item.quantity;
    } else {
      cart.items.push({
        productId: item._id,
        quantity: item.quantity,
      });
    }
  });

  await cart.save();
  res.json(cart);
});

export default router;