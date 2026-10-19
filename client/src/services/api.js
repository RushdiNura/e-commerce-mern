import axios from "axios";
import { clearSession, getToken } from "../utils/session";

// Set VITE_API_URL in your hosting dashboard (e.g. https://your-api.onrender.com/api).
// In development it falls back to localhost; in production it falls back to the
// API URL that was in your client .env so the app never silently calls localhost.
// const API_URL =
//   import.meta.env.VITE_API_URL ||
//   (import.meta.env.DEV
//     ? "http://localhost:5000/api"
//     : "https://e-commerce-mern-g6fo.onrender.com/api");

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  // Free hosting tiers (e.g. Render) can take ~30-60s to wake up on the first request.
  timeout: 60000,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only treat 401 as "session expired" if we actually sent a token.
    if (error.response?.status === 401 && error.config?.headers?.Authorization) {
      clearSession();
      window.dispatchEvent(new Event("auth:expired"));
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  logout: () => api.post("/auth/logout"),
  getProfile: () => api.get("/auth/me"),
};

export const productsAPI = {
  getAll: (params) => api.get("/products", { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (productData) => api.post("/products", productData),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`),
};

export const cartAPI = {
  get: () => api.get("/cart"),
  add: (data) => api.post("/cart", data),
  update: (itemId, data) => api.put(`/cart/${itemId}`, data),
  remove: (itemId) => api.delete(`/cart/${itemId}`),
  clear: () => api.delete("/cart"),
};

export const ordersAPI = {
  create: (data) => api.post("/orders", data),
  getMyOrders: () => api.get("/orders/my-orders"),
  updateOrderStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  deleteOrder: (id) => api.delete(`/orders/${id}`),
};

export const ratingAPI = {
  addReview: (productId, data) => api.post(`/products/${productId}/reviews`, data),
  getReviews: (productId) => api.get(`/products/${productId}/reviews`),
  updateReview: (productId, reviewId, data) =>
    api.put(`/products/${productId}/reviews/${reviewId}`, data),
  deleteReview: (productId, reviewId) =>
    api.delete(`/products/${productId}/reviews/${reviewId}`),
};

export default api;
