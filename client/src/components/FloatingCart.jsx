import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { motion } from "framer-motion";

const FloatingCart = () => {
  const { cartItems } = useCart();
  const navigate = useNavigate();

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (totalItems === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-6 right-6 z-50 cursor-pointer"
      onClick={() => navigate("/cart")}
    >
      <div className="relative bg-yellow-400 hover:bg-yellow-300 shadow-lg p-4 rounded-full transition">
      
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-7 h-7 text-slate-900"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.3 5.2A1 1 0 007 19h12m-5 0a2 2 0 11-4 0" />
        </svg>

        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
          {totalItems}
        </span>
      </div>
    </motion.div>
  );
};

export default FloatingCart;
