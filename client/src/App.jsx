import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ScrollToTop from "./components/ScrollToTop";
import ScrollToTopButton from "./components/ScrollToTopButton";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Orders";
import MyOrders from "./pages/MyOrders";
import OrderSuccess from "./pages/OrderSuccess";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const App = () => (
  <>
    <ScrollToTop />
    {/* Toasts were never shown before because <Toaster /> was not rendered. */}
    <Toaster
      position="top-center"
      containerStyle={{ top: 76 }}
      toastOptions={{
        duration: 3500,
        style: {
          background: "var(--surface)",
          color: "var(--fg)",
          border: "1px solid var(--line)",
          boxShadow: "0 10px 30px -10px rgb(0 0 0 / 0.35)",
        },
        success: { iconTheme: { primary: "#15803d", secondary: "#ffffff" } },
        error: { iconTheme: { primary: "#dc2626", secondary: "#ffffff" } },
      }}
    />

    <div className="flex min-h-screen flex-col bg-page text-fg">
      <Navbar />

      <main id="main" className="grow">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />

            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-orders"
              element={
                <ProtectedRoute>
                  <MyOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/order-success"
              element={
                <ProtectedRoute>
                  <OrderSuccess />
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

            {/* Old links keep working */}
            <Route path="/orders" element={<Navigate to="/my-orders" replace />} />
            <Route path="/myorder" element={<Navigate to="/my-orders" replace />} />
            <Route path="/products/:id" element={<LegacyProductRedirect />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </main>

      <ScrollToTopButton />
      <Footer />
    </div>
  </>
);

// The old product card linked to /products/:id (which didn't exist). Redirect it.
function LegacyProductRedirect() {
  const { id } = useParams();
  return <Navigate to={`/product/${id}`} replace />;
}

export default App;
