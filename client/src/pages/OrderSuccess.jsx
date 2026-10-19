import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { formatDate, formatPrice, getId, getImage, getPrice, onImgError, statusMeta } from "../utils/format";

const OrderSuccess = () => {
  const { state } = useLocation();
  const order = state?.order;
  const items = state?.items || [];

  useDocumentTitle("Order confirmed");

  const status = statusMeta(order?.status);
  const total = order?.totalPrice ?? order?.total;

  return (
    <section className="page-container max-w-2xl py-12 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 140, damping: 12 }}
        className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success text-white shadow-lg"
      >
        <Check size={40} strokeWidth={3} aria-hidden="true" />
      </motion.div>

      <h1 className="text-3xl font-bold text-fg sm:text-4xl">Thank you for your order!</h1>
      <p className="mt-3 text-muted">
        {order
          ? "We’ve received your order and will start processing it right away."
          : "If you just placed an order, you can find it in your order history."}
      </p>

      {order && (
        <div className="card mt-8 p-6 text-left">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-fg">
              Order #{String(getId(order) || "").slice(-8).toUpperCase()}
            </h2>
            <span className="text-sm text-muted">
              {formatDate(order.createdAt, { dateStyle: "medium" })} · {status.label}
            </span>
          </div>

          {items.length > 0 && (
            <ul className="divide-y divide-line">
              {items.map((item) => (
                <li key={getId(item)} className="flex items-center gap-3 py-3">
                  <img
                    src={getImage(item.product, 120)}
                    alt=""
                    onError={onImgError}
                    className="h-14 w-14 shrink-0 rounded-lg bg-surface-2 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 font-medium text-fg">{item.product.name}</p>
                    <p className="text-sm text-muted">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-fg">{formatPrice(getPrice(item.product) * item.quantity)}</p>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 flex justify-between border-t border-line pt-4 text-lg">
            <span className="font-semibold text-fg">Total</span>
            <span className="font-bold text-fg">{formatPrice(total)}</span>
          </div>
          {order.paymentMethod && (
            <p className="mt-1 text-sm text-muted">Payment method: {order.paymentMethod}</p>
          )}
        </div>
      )}

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link to="/products" className="btn btn-secondary btn-lg">
          Continue shopping
        </Link>
        <Link to="/my-orders" className="btn btn-primary btn-lg">
          View my orders
        </Link>
      </div>
    </section>
  );
};

export default OrderSuccess;
