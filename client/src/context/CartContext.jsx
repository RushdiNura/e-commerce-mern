
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const fetchCart = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems(res.data.items);
      setTotal(res.data.total);
    } catch (err) {
      console.error("Failed to fetch cart:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addToCart = async ({ productId, quantity = 1 }) => {
    if (!token) {
      alert("You must be logged in to add to cart");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/cart",
        { productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartItems(res.data.items);
      setTotal(res.data.total);
      toast.success("Item added to cart!");
    } catch (err) {
      console.error("Add to cart failed:", err);
      toast.error(err.response?.data?.message || "Failed to add to cart");
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/cart/${itemId}`,
        { quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartItems(res.data.items);
      setTotal(res.data.total);
    } catch (err) {
      console.error("Update quantity failed:", err);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const res = await axios.delete(
        `http://localhost:5000/api/cart/${itemId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartItems(res.data.items);
      setTotal(res.data.total);
    } catch (err) {
      console.error("Remove from cart failed:", err);
    }
  };


  const clearCart = async () => {
    if (!token) return;

    try {
      const res = await axios.delete("http://localhost:5000/api/cart", { 
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems([]);
      setTotal(0);
      toast.success("Cart cleared!");
    } catch (err) {
      console.error("Clear cart failed:", err);
      toast.error(err.response?.data?.message || "Failed to clear cart");
    }
  };

  const value = {
    cartItems,
    total,
    loading,
    addToCart,
    fetchCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    setCartItems,
    setTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);