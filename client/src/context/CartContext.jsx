import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { cartAPI } from "../services/api";
import { useAuth } from "./AuthContext";
import { getErrorMessage, getPrice } from "../utils/format";
import { getToken } from "../utils/session";

const CartContext = createContext(null);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user?._id ?? null;

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  // id of the cart line currently being updated (disables just that row)
  const [pendingId, setPendingId] = useState(null);

  const apply = (data) =>
    // ignore lines whose product was deleted by an admin
    setCartItems((data?.items || []).filter((i) => i && i.product));

  const fetchCart = useCallback(async () => {
    if (!getToken()) {
      setCartItems([]);
      setInitialized(true);
      return;
    }
    setLoading(true);
    try {
      const res = await cartAPI.get();
      apply(res.data);
    } catch (err) {
      console.error("Failed to fetch cart:", err);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, []);

  // Load the cart when someone logs in, empty it when they log out.
  useEffect(() => {
    if (userId) {
      fetchCart();
    } else {
      setCartItems([]);
      setInitialized(true);
    }
  }, [userId, fetchCart]);

  const addToCart = useCallback(
    async ({ productId, quantity = 1, name }) => {
      if (!userId) return false;
      try {
        const res = await cartAPI.add({ productId, quantity });
        apply(res.data);
        toast.success(name ? `${name} added to cart` : "Added to cart");
        return true;
      } catch (err) {
        toast.error(getErrorMessage(err, "Could not add to cart"));
        return false;
      }
    },
    [userId]
  );

  const updateQuantity = useCallback(async (itemId, quantity) => {
    if (quantity < 1) return;
    setPendingId(itemId);
    try {
      const res = await cartAPI.update(itemId, { quantity });
      apply(res.data);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not update quantity"));
    } finally {
      setPendingId(null);
    }
  }, []);

  const removeFromCart = useCallback(async (itemId) => {
    setPendingId(itemId);
    try {
      const res = await cartAPI.remove(itemId);
      apply(res.data);
      toast.success("Item removed");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not remove item"));
    } finally {
      setPendingId(null);
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      await cartAPI.clear();
      setCartItems([]);
      toast.success("Cart cleared");
    } catch (err) {
      // 404 just means there was no cart on the server
      if (err.response?.status === 404) setCartItems([]);
      else toast.error(getErrorMessage(err, "Could not clear cart"));
    }
  }, []);

  // Used after an order is placed (the server already emptied the cart).
  const resetCart = useCallback(() => setCartItems([]), []);

  const total = useMemo(
    () =>
      Math.round(
        cartItems.reduce((sum, i) => sum + getPrice(i.product) * i.quantity, 0) * 100
      ) / 100,
    [cartItems]
  );
  const itemCount = useMemo(
    () => cartItems.reduce((sum, i) => sum + i.quantity, 0),
    [cartItems]
  );

  const value = useMemo(
    () => ({
      cartItems,
      total,
      itemCount,
      loading,
      initialized,
      pendingId,
      addToCart,
      fetchCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      resetCart,
    }),
    [
      cartItems,
      total,
      itemCount,
      loading,
      initialized,
      pendingId,
      addToCart,
      fetchCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      resetCart,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
