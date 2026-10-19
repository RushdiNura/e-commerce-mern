import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

const unitPrice = (product) => product?.new_price || product?.price || 0;

// Drops lines whose product was deleted (populate() returns null for them) and
// builds the response. Without this, deleting a product broke every cart holding it.
const buildResponse = async (cart) => {
  await cart.populate("items.product");
  const live = cart.items.filter((item) => item.product);
  if (live.length !== cart.items.length) {
    cart.items = live;
    await cart.save();
  }
  const total = live.reduce((sum, item) => sum + unitPrice(item.product) * item.quantity, 0);
  return { items: live, total: parseFloat(total.toFixed(2)) };
};

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) return res.status(400).json({ message: "Product ID is required" });

    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.stock <= 0) return res.status(400).json({ message: "This product is out of stock" });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });

    const existing = cart.items.find((i) => i.product.toString() === String(productId));
    const newQty = (existing ? existing.quantity : 0) + qty;
    if (newQty > product.stock) {
      return res.status(400).json({ message: `Only ${product.stock} in stock` });
    }
    if (existing) existing.quantity = newQty;
    else cart.items.push({ product: productId, quantity: qty });

    await cart.save();
    res.status(201).json({ message: "Added to cart", ...(await buildResponse(cart)) });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ message: "Failed to add to cart" });
  }
};

export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart || !cart.items.length) return res.status(200).json({ items: [], total: 0 });
    res.status(200).json(await buildResponse(cart));
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ message: "Failed to fetch cart" });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const quantity = parseInt(req.body.quantity, 10);
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find((i) => i._id.toString() === itemId);
    if (!item) return res.status(404).json({ message: "Item not found in cart" });
    if (item.product && quantity > item.product.stock) {
      return res.status(400).json({ message: `Only ${item.product.stock} in stock` });
    }

    item.quantity = quantity;
    await cart.save();
    res.json({ message: "Cart updated", ...(await buildResponse(cart)) });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ message: "Failed to update cart" });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter((i) => i._id.toString() !== itemId);
    await cart.save();
    res.json({ message: "Item removed", ...(await buildResponse(cart)) });
  } catch (error) {
    console.error("Error removing item:", error);
    res.status(500).json({ message: "Failed to remove item" });
  }
};

export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = [];
    await cart.save();
    res.json({ message: "Cart cleared", items: [], total: 0 });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ message: "Failed to clear cart" });
  }
};
