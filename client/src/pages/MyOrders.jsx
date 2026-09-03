import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ordersAPI } from "../services/api";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        console.log("🔄 Starting to fetch orders...");

        // Check if user is authenticated
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("user");
        console.log("🔐 Auth check - Token exists:", !!token);
        console.log("👤 User data:", user);

        const res = await ordersAPI.getMyOrders();
        console.log("✅ Orders API Response:", res);
        console.log("📦 Orders data:", res.data);

        // Handle different response structures
        const ordersData = res.data.orders || res.data || [];
        console.log(`📊 Found ${ordersData.length} orders`);
        setOrders(ordersData);
      } catch (err) {
        console.error("❌ Error loading orders:", err);
        console.error("❌ Error details:", {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
          url: err.config?.url,
        });

        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load orders. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Debug render
  console.log("🎯 MyOrders Component State:", {
    loading,
    error,
    ordersCount: orders.length,
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-slate-600 dark:text-slate-300">
          Loading your orders...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <div className="text-4xl mb-4">😞</div>
          <h3 className="text-red-800 font-semibold text-lg mb-2">
            Unable to Load Orders
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="space-y-2 text-sm text-red-500">
            <p>• Check your internet connection</p>
            <p>• Make sure you're logged in</p>
            <p>• Try refreshing the page</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <motion.h1
        className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        My Orders ({orders.length})
      </motion.h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-slate-600 dark:text-slate-300 text-lg mb-2">
            No orders yet
          </p>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Start shopping to see your orders here!
          </p>
          <button
            onClick={() => (window.location.href = "/products")}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order, index) => (
            <motion.div
              key={order._id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              {/* Order header */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
                <div>
                  <h2 className="font-semibold text-lg text-slate-900 dark:text-white">
                    Order #
                    {order.orderNumber || order._id?.slice(-8).toUpperCase()}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Placed on{" "}
                    {new Date(
                      order.createdAt || order.orderDate
                    ).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    order.status === "delivered"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : order.status === "shipped"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      : order.status === "processing"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                  }`}
                >
                  {order.status
                    ? order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)
                    : "Pending"}
                </span>
              </div>

              {/* Order items */}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mb-4">
                {(order.items || order.orderItems || []).map(
                  (item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className="flex justify-between items-center py-3"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <img
                          src={
                            item.image ||
                            item.product?.image?.[0]?.url ||
                            "https://via.placeholder.com/60"
                          }
                          alt={item.name || item.product?.name}
                          className="w-16 h-16 rounded-lg object-cover border border-slate-200 dark:border-slate-600"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/60?text=No+Image";
                          }}
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-slate-900 dark:text-white">
                            {item.name || item.product?.name}
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Qty: {item.quantity} × $
                            {(item.price || 0).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        ${((item.quantity || 1) * (item.price || 0)).toFixed(2)}
                      </p>
                    </div>
                  )
                )}
              </div>

              {/* Order footer */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  <span className="font-medium">Payment: </span>
                  {order.paymentMethod || "Credit Card"}
                </div>
                <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                  Total: ${(order.total || order.totalPrice || 0).toFixed(2)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
};

export default MyOrders;
