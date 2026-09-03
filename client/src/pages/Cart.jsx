import React, { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { X, AlertCircle, ShoppingCart, Trash2 } from "lucide-react";

const Cart = () => {
  const {
    cartItems,
    total,
    loading,
    fetchCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const [showClearCartDialog, setShowClearCartDialog] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);

  useEffect(() => {
    fetchCart();
  }, []);

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(itemId, newQuantity);
  };

  const handleRemoveClick = (itemId, itemName) => {
    setItemToRemove({ id: itemId, name: itemName });
  };

  const confirmRemove = () => {
    if (itemToRemove) {
      removeFromCart(itemToRemove.id);
      toast.success("Item removed from cart");
      setItemToRemove(null);
    }
  };

  const cancelRemove = () => {
    setItemToRemove(null);
  };

  const handleClearCartClick = () => {
    setShowClearCartDialog(true);
  };

  const confirmClearCart = () => {
    clearCart();
    toast.success("Cart cleared successfully");
    setShowClearCartDialog(false);
  };

  const cancelClearCart = () => {
    setShowClearCartDialog(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-slate-500">
        Loading your cart...
      </div>
    );
  }

  if (!cartItems.length) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20 text-slate-600">
        <motion.img
          src="https://cdn-icons-png.flaticon.com/512/2038/2038854.png"
          alt="Empty cart"
          className="w-40 mb-6 opacity-80"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        />
        <h2 className="text-2xl font-semibold mb-2">Your Cart is Empty</h2>
        <p className="mb-6 text-slate-500">
          Looks like you haven't added anything yet.
        </p>
        <Link
          to="/products"
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <>
      <section className="max-w-7xl mx-auto px-6 py-16">
        <motion.h1
          className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Your Shopping Cart
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <motion.div
                key={item._id || item.id}
                className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm hover:shadow-lg transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-4">
                  <img
                    src={
                      item.product?.image?.[0]?.url ||
                      item.product?.image?.url ||
                      item.product?.image ||
                      item.image?.[0]?.url ||
                      item.image?.url ||
                      item.image ||
                      "https://via.placeholder.com/100?text=No+Image"
                    }
                    alt={item.product?.name || item.name || "Product"}
                    className="w-20 h-20 rounded-lg object-cover"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/100?text=No+Image";
                    }}
                  />
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                      {item.product?.name || item.name}
                    </h3>
                    <p className="text-indigo-500 font-medium">
                      $
                      {(
                        item.product?.new_price ||
                        item.product?.price ||
                        item.price ||
                        0
                      ).toFixed(2)}
                    </p>
                    <p className="text-sm text-slate-500">
                      Subtotal: $
                      {(
                        (item.product?.new_price ||
                          item.product?.price ||
                          item.price ||
                          0) * item.quantity || 0
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      handleQuantityChange(
                        item._id || item.id,
                        item.quantity - 1
                      )
                    }
                    className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    -
                  </button>
                  <span className="text-slate-700 dark:text-slate-200 min-w-8 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      handleQuantityChange(
                        item._id || item.id,
                        item.quantity + 1
                      )
                    }
                    className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    +
                  </button>

                  <button
                    onClick={() =>
                      handleRemoveClick(
                        item._id || item.id,
                        item.product?.name || item.name || "this item"
                      )
                    }
                    className="ml-4 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors flex items-center gap-1"
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="bg-slate-900 text-slate-200 rounded-xl p-8 shadow-lg sticky top-24 h-fit"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-xl font-semibold mb-6 text-indigo-400">
              Order Summary
            </h2>

            <div className="flex justify-between mb-3">
              <span>Subtotal</span>
              <span>${(total || 0).toFixed(2)}</span>
            </div>

            <div className="flex justify-between mb-3 text-slate-400">
              <span>Shipping</span>
              <span>Free</span>
            </div>

            <div className="border-t border-slate-700 mt-4 pt-4 flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>${(total || 0).toFixed(2)}</span>
            </div>

            <div className="mt-8 space-y-3">
              <Link
                to="/orders"
                className="block text-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                <ShoppingCart size={18} />
                Proceed to Checkout
              </Link>

              <button
                onClick={handleClearCartClick}
                className="w-full py-3 border border-red-600 text-red-400 hover:bg-red-600 hover:text-white rounded-lg transition flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                Clear Cart
              </button>
            </div>
          </motion.div>
        </div>
      </section>


      <AnimatePresence>
        {itemToRemove && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-700"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Remove Item
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Confirm item removal
                    </p>
                  </div>
                </div>

                <p className="text-slate-600 dark:text-slate-300 mb-6 pl-13">
                  Are you sure you want to remove{" "}
                  <strong className="text-slate-900 dark:text-white">
                    "{itemToRemove.name}"
                  </strong>{" "}
                  from your shopping cart?
                </p>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={cancelRemove}
                    className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmRemove}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    Remove Item
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showClearCartDialog && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-700"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Clear Shopping Cart
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      This action cannot be undone
                    </p>
                  </div>
                </div>

                <p className="text-slate-600 dark:text-slate-300 mb-6 pl-13">
                  You're about to remove all{" "}
                  <strong className="text-slate-900 dark:text-white">
                    {cartItems.length}
                  </strong>{" "}
                  item{cartItems.length !== 1 ? "s" : ""} from your cart. This
                  will permanently delete your cart contents.
                </p>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={cancelClearCart}
                    className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors font-medium"
                  >
                    Keep Items
                  </button>
                  <button
                    onClick={confirmClearCart}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    Clear All Items
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Cart;
