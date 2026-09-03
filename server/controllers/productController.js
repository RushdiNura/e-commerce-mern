import { v2 as cloudinary } from "cloudinary";
import Product from "../models/Product.js";
import Category from "../models/Category.js"; 

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;

    if (!name || !description || !price || !category || !stock) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // 🔍 Check if category is a valid ObjectId or a name
    let categoryId = category;

    // If it's a string like "laptops", find it by name
    if (typeof category === "string" && !category.match(/^[0-9a-fA-F]{24}$/)) {
      const foundCategory = await Category.findOne({
        name: { $regex: category, $options: "i" },
      });

      if (!foundCategory) {
        return res.status(400).json({
          success: false,
          message: `Invalid category name: ${category}`,
        });
      }

      categoryId = foundCategory._id; // ✅ use ObjectId
    }

    const images =
      req.files?.length > 0
        ? req.files.map((file) => ({
            url: file.path,
            filename: file.filename,
          }))
        : [];

    const productData = {
      name,
      description,
      price,
      category: categoryId, // ✅ use resolved ObjectId
      stock,
    };

    if (images.length > 0) productData.image = images;

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: "✅ Product created successfully",
      product,
    });
  } catch (error) {
    console.error("❌ Error creating product:", error.message);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


export const getAllProducts = async (req, res) => {
  try {
    const { category, keyword } = req.query;
    let filter = {};

    if (category) {
      const cat = await Category.findOne({
        name: { $regex: category, $options: "i" },
      });
      if (cat) filter.category = cat._id;
    }

    
    if (keyword) {
      filter.name = { $regex: keyword, $options: "i" };
    }

    const products = await Product.find(filter).populate("category", "name");
    res.json({ count: products.length, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category",
      "name"
    );
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    if (req.user.role !== "admin")
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });

    // ✅ Haif(ndle category conversion (same as create function)
    let categoryId = category;
    if (
      category &&
      typeof category === "string" &&
      !category.match(/^[0-9a-fA-F]{24}$/)
    ) {
      const foundCategory = await Category.findOne({
        name: { $regex: category, $options: "i" },
      });

      if (!foundCategory) {
        return res.status(400).json({
          success: false,
          message: `Invalid category name: ${category}`,
        });
      }

      categoryId = foundCategory._id;
    }

    // Update fields
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (category) product.category = categoryId; // ✅ Use converted ObjectId
    if (stock !== undefined) product.stock = stock;

    // Handle image updates
    if (req.files && req.files.length > 0) {
      // Delete old images from cloudinary
      if (product.image && product.image.length > 0) {
        for (let img of product.image) {
          await cloudinary.uploader.destroy(img.filename);
        }
      }

      // Add new images
      product.image = req.files.map((file) => ({
        url: file.path,
        filename: file.filename,
      }));
    }

    await product.save();

    // Populate category before sending response
    await product.populate("category", "name");

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("❌ Error updating product:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};


export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    if (req.user.role !== "admin")
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to delete products" });

    await Product.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
