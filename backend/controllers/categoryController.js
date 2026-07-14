import Category from "../models/Category.js";

export const createCategory = async (req, res) => {
  try {

    const category = await Category.create({
      name: req.body.name,
      image: req.file ? req.file.path.replace("\\","/") : ""
    });

    res.status(201).json(category);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({
      message:error.message
    });
  }
};