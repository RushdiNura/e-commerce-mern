import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, ShoppingCart, Trash2 } from "lucide-react";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { PageLoader } from "../components/LoadingSpinner";
import { formatPrice, getId, getImage, getPrice, onImgError } from "../utils/format";

const Cart = () => {
  const { user } = useAuth();
  const { cartItems, total, itemCount, initialized, pendingId, updateQuantity, removeFromCart, clearCart } =
    useCart();

  const [toRemove, setToRemove] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);

  useDocumentTitle("Your cart");

  if (!user) {
    return (
      <section className="page-container py-12">
        <EmptyState
          icon={ShoppingBag}
          title="Log in to see your cart"
          message="Your cart is saved to your account, so you can pick up where you left off on any device."
          action={
            <Link to="/login" state={{ from: { pathname: "/cart" } }} className="btn btn-primary btn-lg">
              Log in
            </Link>
          }
        />
      </section>
    );
  }

  if (!initialized) return <PageLoader message="Loading your cart…" />;

  if (cartItems.length === 0) {
    return (
      <section className="page-container py-12">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          message="Looks like you haven’t added anything yet."
          action={
            <Link to="/products" className="btn btn-primary btn-lg">
              Start shopping
            </Link>
          }
        />
      </section>
    );
  }

  return (
    <section className="page-container py-8">
      <h1 className="mb-6 text-3xl font-bold text-fg">
        Shopping cart{" "}
        <span className="text-lg font-medium text-muted">
          ({itemCount} item{itemCount === 1 ? "" : "s"})
        </span>
      </h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <ul className="space-y-4 lg:col-span-2">
          {cartItems.map((item) => {
            const lineId = getId(item);
            const p = item.product;
            const price = getPrice(p);
            const busy = pendingId === lineId;
            const maxed = p.stock !== undefined && item.quantity >= Number(p.stock);
            return (
              <motion.li
                key={lineId}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={`card flex flex-col gap-4 p-4 sm:flex-row sm:items-center ${busy ? "opacity-60" : ""}`}
              >
                <Link to={`/product/${getId(p)}`} className="shrink-0">
                  <img
                    src={getImage(p, 200)}
                    alt={p.name}
                    onError={onImgError}
                    className="h-24 w-24 rounded-lg bg-surface-2 object-cover"
                  />
                </Link>

                <div className="min-w-0 flex-1">
                  <Link
                    to={`/product/${getId(p)}`}
                    className="line-clamp-2 font-semibold text-fg hover:text-brand-text"
                  >
                    {p.name}
                  </Link>
                  <p className="mt-1 text-sm text-muted">{formatPrice(price)} each</p>
                  {maxed && <p className="mt-1 text-xs text-warning-text">Maximum available quantity</p>}
                </div>

                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <div className="inline-flex items-center rounded-lg border border-field" role="group" aria-label={`Quantity for ${p.name}`}>
                    <button
                      type="button"
                      className="px-3 py-2 text-fg hover:bg-surface-2 disabled:opacity-40"
                      disabled={busy || item.quantity <= 1}
                      onClick={() => updateQuantity(lineId, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="min-w-9 text-center text-sm font-semibold text-fg" aria-live="polite">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      className="px-3 py-2 text-fg hover:bg-surface-2 disabled:opacity-40"
                      disabled={busy || maxed}
                      onClick={() => updateQuantity(lineId, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <p className="w-24 text-right font-bold text-fg">{formatPrice(price * item.quantity)}</p>

                  <button
                    type="button"
                    onClick={() => setToRemove({ id: lineId, name: p.name })}
                    disabled={busy}
                    className="btn btn-ghost !p-2 hover:!text-danger-text"
                    aria-label={`Remove ${p.name}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.li>
            );
          })}

          <li className="pt-2">
            <button type="button" onClick={() => setConfirmClear(true)} className="btn btn-ghost text-sm">
              <Trash2 size={16} aria-hidden="true" /> Clear cart
            </button>
          </li>
        </ul>

        {/* Summary */}
        <aside className="card h-fit p-6 lg:sticky lg:top-24" aria-label="Order summary">
          <h2 className="mb-5 text-xl font-semibold text-fg">Order summary</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="font-medium text-fg">{formatPrice(total)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Shipping</dt>
              <dd className="font-medium text-success-text">Free</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-4 text-lg">
              <dt className="font-semibold text-fg">Total</dt>
              <dd className="font-bold text-fg">{formatPrice(total)}</dd>
            </div>
          </dl>
          <Link to="/checkout" className="btn btn-primary btn-lg mt-6 w-full">
            <ShoppingCart size={18} aria-hidden="true" /> Proceed to checkout
          </Link>
          <Link to="/products" className="mt-3 block text-center text-sm text-muted hover:text-fg hover:underline">
            Continue shopping
          </Link>
        </aside>
      </div>

      <ConfirmDialog
        open={Boolean(toRemove)}
        title="Remove this item?"
        message={toRemove ? `“${toRemove.name}” will be removed from your cart.` : ""}
        confirmLabel="Remove"
        onConfirm={() => {
          removeFromCart(toRemove.id);
          setToRemove(null);
        }}
        onCancel={() => setToRemove(null)}
      />
      <ConfirmDialog
        open={confirmClear}
        title="Clear your cart?"
        message={`All ${itemCount} item${itemCount === 1 ? "" : "s"} will be removed from your cart.`}
        confirmLabel="Clear cart"
        onConfirm={() => {
          clearCart();
          setConfirmClear(false);
        }}
        onCancel={() => setConfirmClear(false)}
      />
    </section>
  );
};

export default Cart;
