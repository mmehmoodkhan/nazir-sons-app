import express from "express";
import { addProduct, updateProduct, getProducts, deleteProduct } from "../controllers/productController.js";
import Product from "../models/Product.js";
const router = express.Router();
// GET PRODUCTS
// router.get("/", (req, res) => {
//   res.json({ message: "Products working" });
// });

// get all product 
router.get("/", getProducts);

router.get("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  res.json(product);
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

export default router;
