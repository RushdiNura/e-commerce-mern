// // import Cart from "../models/Cart.js";

// // export const addToCart = async (req, res) => {
// //   try {
// //     const userId = req.user._id;
// //     const { productId, quantity = 1, price } = req.body;

// //     if (!productId || !price) {
// //       return res
// //         .status(400)
// //         .json({ success: false, message: "productId and price are required" });
// //     }

// //     let cart = await Cart.findOne({ user: userId });
// //     if (!cart) {
// //       cart = new Cart({
// //         user: userId,
// //         items: [{ product: productId, quantity, price }],
// //         totalPrice: quantity * price,
// //       });
// //     } else {
// //       const itemIndex = cart.items.findIndex(
// //         (item) => item.product.toString() === productId
// //       );
// //       if (itemIndex > -1) {
// //         cart.items[itemIndex].quantity += quantity;
// //       } else {
// //         cart.items.push({ product: productId, quantity, price });
// //       }
// //       cart.totalPrice = cart.items.reduce(
// //         (total, item) => total + item.quantity * item.price,
// //         0
// //       );
// //     }

// //     await cart.save();
// //     res.status(200).json({ success: true, cart });
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: error.message });
// //   }
// // };

// // export const getUserCart = async (req, res) => {
// //   try {
// //     const userId = req.user._id;
// //     const cart = await Cart.findOne({ user: userId }).populate("items.product");
// //     if (!cart)
// //       return res
// //         .status(404)
// //         .json({ success: false, message: "Cart not found" });
// //     res.status(200).json({ success: true, cart });
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: error.message });
// //   }
// // };

// // export const updateItemQuantity = async (req, res) => {
// //   try {
// //     const userId = req.user._id;
// //     const { productId, quantity } = req.body;
// //     const cart = await Cart.findOne({ user: userId });
// //     if (!cart)
// //       return res
// //         .status(404)
// //         .json({ success: false, message: "Cart not found" });

// //     const item = cart.items.find((i) => i.product.toString() === productId);
// //     if (!item)
// //       return res
// //         .status(404)
// //         .json({ success: false, message: "Item not found in cart" });

// //     item.quantity = quantity;
// //     cart.totalPrice = cart.items.reduce(
// //       (total, it) => total + it.quantity * it.price,
// //       0
// //     );
// //     await cart.save();
// //     res.status(200).json({ success: true, cart });
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: error.message });
// //   }
// // };

// // export const removeCartItem = async (req, res) => {
// //   try {
// //     const userId = req.user._id;
// //     const { productId } = req.params;

// //     const cart = await Cart.findOne({ user: userId });
// //     if (!cart)
// //       return res
// //         .status(404)
// //         .json({ success: false, message: "Cart not found" });

// //     cart.items = cart.items.filter(
// //       (item) => item.product.toString() !== productId
// //     );
// //     cart.totalPrice = cart.items.reduce(
// //       (total, item) => total + item.quantity * item.price,
// //       0
// //     );

// //     await cart.save();
// //     res.status(200).json({ success: true, message: "Item removed", cart });
// //   } catch (error) {
// //     res.status(500).json({ success: false, message: error.message });
// //   }
// // };

// import Cart from "../models/Cart.js";
// import Product from "../models/Product.js";

// // Add to cart
// export const addToCart = async (req, res) => {
//   try {
//     const { productId, quantity = 1 } = req.body;

//     if (!productId) {
//       return res.status(400).json({ message: "Product ID is required" });
//     }

//     const product = await Product.findById(productId);
//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     // Find user's cart or create one
//     let cart = await Cart.findOne({ user: req.user._id });
//     if (!cart) {
//       cart = new Cart({ user: req.user._id, items: [] });
//     }

//     // Check if product is already in cart
//     const existingItem = cart.items.find(
//       (item) => item.product.toString() === productId
//     );

//     if (existingItem) {
//       existingItem.quantity += quantity;
//     } else {
//       cart.items.push({ product: productId, quantity });
//     }

//     await cart.save();
//     await cart.populate("items.product"); // populate product details

//     const total = cart.items.reduce(
//       (sum, item) => sum + item.product.new_price * item.quantity,
//       0
//     );

//     res
//       .status(201)
//       .json({ message: "Added to cart", items: cart.items, total });
//   } catch (error) {
//     console.error("Add to cart error:", error);
//     res.status(500).json({ message: "Failed to add to cart" });
//   }
// };

// // Get cart
// export const getCart = async (req, res) => {
//   try {
//     const cart = await Cart.findOne({ user: req.user._id }).populate(
//       "items.product"
//     );
//     if (!cart) {
//       return res.status(200).json({ items: [], total: 0 });
//     }
//     const total = cart.items.reduce(
//       (sum, item) => sum + item.product.new_price * item.quantity,
//       0
//     );
//     res.status(200).json({ items: cart.items, total });
//   } catch (error) {
//     console.error("Get cart error:", error);
//     res.status(500).json({ message: "Failed to fetch cart" });
//   }
// };

// // 🧾 Update quantity
// export const updateCartItem = async (req, res) => {
//   try {
//     const { itemId } = req.params;
//     const { quantity } = req.body;

//     const cart = await Cart.findOne({ user: req.user.id });
//     if (!cart) return res.status(404).json({ message: "Cart not found" });

//     const item = cart.items.id(itemId);
//     if (!item) return res.status(404).json({ message: "Item not found" });

//     item.quantity = quantity;
//     await cart.save();
//     await cart.populate("items.product");

//     const total = cart.items.reduce(
//       (sum, item) => sum + item.product.new_price * item.quantity,
//       0
//     );

//     res.json({ message: "Cart updated", items: cart.items, total });
//   } catch (error) {
//     console.error("Error updating cart:", error);
//     res.status(500).json({ message: "Failed to update cart" });
//   }
// };

// // ❌ Remove item
// export const removeFromCart = async (req, res) => {
//   try {
//     const { itemId } = req.params;

//     const cart = await Cart.findOne({ user: req.user.id });
//     if (!cart) return res.status(404).json({ message: "Cart not found" });

//     cart.items = cart.items.filter((item) => item.id !== itemId);
//     await cart.save();
//     await cart.populate("items.product");

//     const total = cart.items.reduce(
//       (sum, item) => sum + item.product.new_price * item.quantity,
//       0
//     );

//     res.json({ message: "Item removed", items: cart.items, total });
//   } catch (error) {
//     console.error("Error removing item:", error);
//     res.status(500).json({ message: "Failed to remove item" });
//   }
// };

// // 🧹 Clear entire cart
// export const clearCart = async (req, res) => {
//   try {
//     await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] });
//     res.json({ message: "Cart cleared", items: [], total: 0 });
//   } catch (error) {
//     console.error("Error clearing cart:", error);
//     res.status(500).json({ message: "Failed to clear cart" });
//   }
// };

import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// Add to cart
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find user's cart or create one
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if product is already in cart
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    await cart.populate("items.product"); // populate product details

    const total = cart.items.reduce(
      (sum, item) =>
        sum + (item.product.new_price || item.product.price) * item.quantity,
      0
    );

    res.status(201).json({
      message: "Added to cart",
      items: cart.items,
      total: parseFloat(total.toFixed(2)),
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ message: "Failed to add to cart" });
  }
};

// Get cart
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product"
    );

    if (!cart || !cart.items.length) {
      return res.status(200).json({ items: [], total: 0 });
    }

    const total = cart.items.reduce(
      (sum, item) =>
        sum +
        (item.product.new_price || item.product.price || 0) * item.quantity,
      0
    );

    res.status(200).json({
      items: cart.items,
      total: parseFloat(total.toFixed(2)),
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ message: "Failed to fetch cart" });
  }
};

// Update quantity
export const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    // Find the item by _id (MongoDB's default ID field)
    const item = cart.items.find((item) => item._id.toString() === itemId);
    if (!item)
      return res.status(404).json({ message: "Item not found in cart" });

    item.quantity = quantity;
    await cart.save();
    await cart.populate("items.product");

    const total = cart.items.reduce(
      (sum, item) =>
        sum +
        (item.product.new_price || item.product.price || 0) * item.quantity,
      0
    );

    res.json({
      message: "Cart updated",
      items: cart.items,
      total: parseFloat(total.toFixed(2)),
    });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ message: "Failed to update cart" });
  }
};

// Remove item
export const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    // Filter by _id instead of id
    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
    await cart.save();
    await cart.populate("items.product");

    const total = cart.items.reduce(
      (sum, item) =>
        sum +
        (item.product.new_price || item.product.price || 0) * item.quantity,
      0
    );

    res.json({
      message: "Item removed",
      items: cart.items,
      total: parseFloat(total.toFixed(2)),
    });
  } catch (error) {
    console.error("Error removing item:", error);
    res.status(500).json({ message: "Failed to remove item" });
  }
};

// Clear entire cart
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = [];
    await cart.save();

    res.json({
      message: "Cart cleared",
      items: [],
      total: 0,
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ message: "Failed to clear cart" });
  }
};
