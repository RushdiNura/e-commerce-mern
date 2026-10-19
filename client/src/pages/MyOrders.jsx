import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Package } from "lucide-react";
import EmptyState from "../components/EmptyState";
import { PageLoader } from "../components/LoadingSpinner";
import { ordersAPI } from "../services/api";
import useDocumentTitle from "../hooks/useDocumentTitle";
import {
  formatDate,
  formatPrice,
  getErrorMessage,
  getId,
  getImage,
  onImgError,
  statusMeta,
  toneClasses,
} from "../utils/format";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useDocumentTitle("My orders");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await ordersAPI.getMyOrders();
      setOrders(res.data.orders || res.data || []);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load your orders."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <PageLoader message="Loading your orders…" />;

  return (
    <section className="page-container max-w-4xl py-8">
      <h1 className="mb-6 text-3xl font-bold text-fg">
        My orders{!error && <span className="ml-2 text-lg font-medium text-muted">({orders.length})</span>}
      </h1>

      {error ? (
        <EmptyState
          icon={Package}
          title="Couldn’t load your orders"
          message={error}
          action={
            <button type="button" className="btn btn-primary" onClick={load}>
              Try again
            </button>
          }
        />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders yet"
          message="When you place an order, you’ll be able to track it here."
          action={
            <Link to="/products" className="btn btn-primary btn-lg">
              Browse products
            </Link>
          }
        />
      ) : (
        <ul className="space-y-5">
          {orders.map((order, index) => {
            const status = statusMeta(order.status);
            const items = order.orderItems || order.items || [];
            const addr = order.shippingAddress;
            return (
              <motion.li
                key={getId(order) ?? index}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index, 6) * 0.05 }}
                className="card overflow-hidden"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface-2 px-5 py-4">
                  <div>
                    <h2 className="font-semibold text-fg">
                      Order #{String(getId(order) || "").slice(-8).toUpperCase()}
                    </h2>
                    <p className="text-sm text-muted">Placed on {formatDate(order.createdAt)}</p>
                  </div>
                  <span className={`badge ${toneClasses[status.tone]}`}>{status.label}</span>
                </div>

                <ul className="divide-y divide-line px-5">
                  {items.map((item, i) => {
                    const p = item.product && typeof item.product === "object" ? item.product : null;
                    return (
                      <li key={i} className="flex items-center gap-4 py-4">
                        <img
                          src={p ? getImage(p, 160) : getImage({})}
                          alt=""
                          onError={onImgError}
                          className="h-16 w-16 shrink-0 rounded-lg bg-surface-2 object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          {p ? (
                            <Link
                              to={`/product/${getId(p)}`}
                              className="line-clamp-1 font-medium text-fg hover:text-brand-text"
                            >
                              {p.name}
                            </Link>
                          ) : (
                            <p className="font-medium text-muted">Product no longer available</p>
                          )}
                          <p className="text-sm text-muted">
                            {item.quantity} × {formatPrice(item.price)}
                          </p>
                        </div>
                        <p className="font-semibold text-fg">{formatPrice(item.quantity * item.price)}</p>
                      </li>
                    );
                  })}
                </ul>

                <div className="flex flex-wrap items-end justify-between gap-3 border-t border-line px-5 py-4 text-sm">
                  <div className="text-muted">
                    <p>
                      <span className="font-medium text-fg">Payment:</span> {order.paymentMethod || "—"}
                    </p>
                    {addr?.address && (
                      <p>
                        <span className="font-medium text-fg">Ship to:</span> {addr.address}, {addr.city}
                        {addr.country ? `, ${addr.country}` : ""}
                      </p>
                    )}
                  </div>
                  <p className="text-lg font-bold text-fg">
                    Total: {formatPrice(order.totalPrice ?? order.total)}
                  </p>
                </div>
              </motion.li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default MyOrders;
