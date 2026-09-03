import Stripe from "stripe";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import dotenv from "dotenv";
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { orderId } = req.body;

    if (!userId && !orderId) {
      return res
        .status(400)
        .json({ success: false, message: "userId or orderId required" });
    }

    let amountCents;
    let order;

    if (orderId) {
      order = await Order.findById(orderId).populate("orderItems.product");
      if (!order)
        return res
          .status(404)
          .json({ success: false, message: "Order not found" });
      amountCents = Math.round(order.totalPrice * 100);
    } else {
      const cart = await Cart.findOne({ user: userId }).populate(
        "items.product"
      );
      if (!cart || !cart.items.length)
        return res
          .status(400)
          .json({ success: false, message: "Cart not found or empty" });
      amountCents = Math.round(cart.totalPrice * 100);
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: process.env.CURRENCY || "usd",
      metadata: { orderId: orderId || `fromCart:${userId}` },
      automatic_payment_methods: { enabled: true },
    });

    res
      .status(200)
      .json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("createPaymentIntent:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const markOrderAsPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentMethod = req.body.paymentMethod || "Card";

    order.paymentResult = {
      id: req.body.paymentId || "SIMULATED_TXN_" + Date.now(),
      status: "Completed",
      update_time: new Date().toISOString(),
      email_address: req.body.email || "user@example.com",
    };

    await order.save();
    res
      .status(200)
      .json({
        success: true,
        message: "Payment confirmed successfully",
        order,
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
