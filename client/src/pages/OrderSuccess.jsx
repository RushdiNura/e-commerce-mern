import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const OrderSuccess = () => {
  const navigate = useNavigate();
  const { orders } = useCart();
  const latestOrder = orders[orders.length - 1];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <section className="max-w-3xl mx-auto px-6 py-20 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 10 }}
        className="mx-auto mb-8 w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-12 h-12 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M5 13l4 4L19 7" />
        </svg>
      </motion.div>

      <motion.h1
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.6 }}
        className="text-4xl font-bold text-slate-900 dark:text-white mb-3"
      >
        Order Placed Successfully!
      </motion.h1>

      <motion.p
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-slate-600 dark:text-slate-300 mb-10"
      >
        Thank you for shopping with us. A confirmation email has been sent to
        you.
      </motion.p>

      {latestOrder ? (
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 text-left"
        >
          <h2 className="text-2xl font-semibold mb-6 text-slate-800 dark:text-white">
            Order Summary
          </h2>

          <div className="space-y-4">
            {latestOrder.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 object-cover rounded-lg"
                  />
                  <div>
                    <p className="font-medium text-slate-800 dark:text-white">
                      {item.name}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                      Qty: {item.quantity}
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}

            <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-4">
              <div className="flex justify-between mb-2 text-slate-700 dark:text-slate-300">
                <span>Date:</span>
                <span>{new Date(latestOrder.date).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-slate-900 dark:text-white">
                <span>Total:</span>
                <span>${latestOrder.total.toFixed(2)}</span>
              </div>
              <div className="mt-2 text-green-600 dark:text-green-400 font-medium">
                Status: {latestOrder.status}
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <p className="text-slate-500 mt-8">
          No recent order found. Go back and place your order.
        </p>
      )}

      <motion.div
        className="flex justify-center gap-4 mt-10"
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.4 }}
      >
        <button
          onClick={() => navigate("/products")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition"
        >
          Continue Shopping
        </button>
        <button
          onClick={() => navigate("/myorder")}
          className="bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-semibold px-6 py-3 rounded-lg shadow-lg transition"
        >
          View My Orders
        </button>
      </motion.div>
    </section>
  );
};

export default OrderSuccess;
