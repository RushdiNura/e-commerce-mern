import Order from "../models/Order.js";
import Cart from "../models/Cart.js";

export const createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { shippingAddress } = req.body;

    console.log("Creating order for user:", userId);
    console.log("Shipping address:", shippingAddress);

    // Validate shipping address
    if (
      !shippingAddress ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.country
    ) {
      return res.status(400).json({
        success: false,
        message: "Shipping address with address, city, and country is required",
      });
    }

    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    console.log("Cart found:", cart);

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty or not found",
      });
    }

    // Debug: Check cart items structure
    console.log("Cart items:", cart.items);
    cart.items.forEach((item, index) => {
      console.log(`Item ${index}:`, {
        product: item.product,
        quantity: item.quantity,
        productPrice: item.product?.price,
        productNewPrice: item.product?.new_price,
      });
    });

    // Calculate total price and prepare order items
    const orderItems = cart.items.map((item) => {
      // Get the price from the product - handle both price and new_price fields
      const price = item.product?.new_price || item.product?.price;

      if (!price) {
        throw new Error(
          `Price not found for product: ${
            item.product?.name || "Unknown product"
          }`
        );
      }

      if (isNaN(price)) {
        throw new Error(
          `Invalid price for product: ${
            item.product?.name || "Unknown product"
          }`
        );
      }

      return {
        product: item.product._id,
        quantity: item.quantity,
        price: parseFloat(price), // Ensure it's a number
      };
    });

    const totalPrice = orderItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    console.log("Order items:", orderItems);
    console.log("Total price:", totalPrice);

    // Create the order
    const order = await Order.create({
      user: userId,
      orderItems,
      shippingAddress: {
        address: shippingAddress.address.trim(),
        city: shippingAddress.city.trim(),
        postalCode: shippingAddress.postalCode?.trim() || "",
        country: shippingAddress.country.trim(),
      },
      totalPrice: parseFloat(totalPrice.toFixed(2)),
      paymentMethod: shippingAddress.paymentMethod || "Card",
    });

    console.log("Order created successfully:", order._id);

    // Clear the cart after successful order
    await Cart.deleteOne({ user: userId });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ... rest of your controller functions remain the same
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ user: userId })
      .populate("orderItems.product")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    order.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    await order.deleteOne();
    res
      .status(200)
      .json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
