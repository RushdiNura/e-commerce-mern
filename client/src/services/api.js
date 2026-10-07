import axios from "axios";

// const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    console.log("🔐 Token in localStorage:", token);
    console.log("👤 User in localStorage:", user);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Token added to request headers");
    } else {
      console.log("❌ No token found in localStorage");
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("currentUser");
      window.location.href = "/login";
    }
    console.error("API Error:", error.response || error.message);
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  logout: () => api.get("/auth/logout"),
  getProfile: () => api.get("/auth/me"),
};

export const productsAPI = {
  getAll: (params) => api.get("/products", { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (productData) =>
    api.post("/products", productData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
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
  getUserOrders: () => api.get("/orders/my-orders"),
  getById: (id) => api.get(`/orders/${id}`),
  getAllOrders: () => api.get("/orders"),
  updateOrderStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  deleteOrder: (id) => api.delete(`/orders/${id}`),
};

export const ratingAPI = {
  addReview: (productId, data) =>
    api.post(`/products/${productId}/reviews`, data),
  getReviews: (productId) => api.get(`/products/${productId}/reviews`),
  updateReview: (productId, reviewId, data) =>
    api.put(`/products/${productId}/reviews/${reviewId}`, data),
  deleteReview: (productId, reviewId) =>
    api.delete(`/products/${productId}/reviews/${reviewId}`),
};

export default api;
