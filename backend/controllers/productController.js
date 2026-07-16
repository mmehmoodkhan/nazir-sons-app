import Product from "../models/Product.js";

// Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a new product
export const addProduct = async (req, res) => {
  try {
    
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update/Edit a product
export const updateProduct = async (req, res) => {
  try {
    const updatedproduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    res.json(updatedproduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// now Delete a product 

export const deleteProduct = async(req, res)=> {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
