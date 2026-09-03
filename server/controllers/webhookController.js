import Stripe from "stripe";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const metadataOrderId = paymentIntent.metadata?.orderId;
      let orderId = metadataOrderId;

      if (metadataOrderId?.startsWith("fromCart:")) {
        console.log("Payment for cart (no orderId):", metadataOrderId);
      }

      if (orderId) {
        const session = await mongoose.startSession();
        try {
          session.startTransaction();

          const order = await Order.findById(orderId).session(session);
          if (!order) {
            console.warn("Order not found for orderId:", orderId);
            await session.commitTransaction();
          } else if (!order.isPaid) {
            order.isPaid = true;
            order.paidAt = new Date();
            order.paymentMethod = "Card";
            order.paymentResult = {
              id: paymentIntent.id,
              status: paymentIntent.status,
              update_time: new Date().toISOString(),
              email_address: paymentIntent.receipt_email || "",
            };

            for (const item of order.orderItems) {
              const updateResult = await Product.updateOne(
                { _id: item.product, stock: { $gte: item.quantity } },
                { $inc: { stock: -item.quantity } }
              ).session(session);

              if (updateResult.matchedCount === 0) {
                throw new Error(
                  `Insufficient stock for product ${item.product}`
                );
              }
            }

            await order.save({ session });
            await session.commitTransaction();
            console.log(`Order ${orderId} marked paid and stock updated.`);
          } else {
            await session.commitTransaction();
            console.log(`Order ${orderId} already marked as paid.`);
          }
        } catch (txErr) {
          await session.abortTransaction();
          console.error("Transaction error in webhook:", txErr);
        } finally {
          session.endSession();
        }
      }
    } else {
      console.log("Unhandled stripe event:", event.type);
    }

    return res.json({ received: true });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return res.status(500).send();
  }
};