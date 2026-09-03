// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop"; // ✅ Add this line
import Toaster from 'react-hot-toast'
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import OrderSuccess from "./pages/OrderSuccess";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import FloatingCart from "./components/FloatingCart";
import ScrollToTopButton from "./components/ScrollToTopButton";
import MyOrders from "./pages/MyOrders";
import ProtectedRoute from "./components/ProtectedRoute";


const App = () => {
  return (
    <>
      <ScrollToTop /> 
      {/* <Toaster position="top-right" reverseOrder={false} /> */}
      <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 dark:bg-slate-950">
        <Navbar />

        <main className="grow container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route
              path="/my-orders"
              element={
                <ProtectedRoute role="user">
                  <MyOrders />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <FloatingCart />
        <ScrollToTopButton />
        <Footer />
      </div>
    </>
  );
};

export default App;
