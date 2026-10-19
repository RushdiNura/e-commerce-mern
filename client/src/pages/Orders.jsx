// Checkout page (route: /checkout)
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, Loader2, Lock, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import EmptyState from "../components/EmptyState";
import { PageLoader } from "../components/LoadingSpinner";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { ordersAPI } from "../services/api";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { PAYMENT_METHODS } from "../config";
import { formatPrice, getErrorMessage, getId, getImage, getPrice, onImgError } from "../utils/format";

const FIELDS = [
  { name: "name", label: "Full name", type: "text", autoComplete: "name", placeholder: "Jane Doe", required: true },
  { name: "email", label: "Email address", type: "email", autoComplete: "email", placeholder: "you@example.com", required: true },
  { name: "address", label: "Street address", type: "text", autoComplete: "street-address", placeholder: "123 Main Street", required: true, full: true },
  { name: "city", label: "City", type: "text", autoComplete: "address-level2", placeholder: "New York", required: true },
  { name: "postalCode", label: "Postal code (optional)", type: "text", autoComplete: "postal-code", placeholder: "10001" },
  { name: "country", label: "Country", type: "text", autoComplete: "country-name", placeholder: "United States", required: true, full: true },
];

const validate = (v) => {
  const e = {};
  if (!v.name.trim()) e.name = "Please enter your full name";
  else if (v.name.trim().length < 2) e.name = "Name must be at least 2 characters";
  if (!v.email.trim()) e.email = "Please enter your email";
  else if (!/^\S+@\S+\.\S+$/.test(v.email.trim())) e.email = "Enter a valid email address";
  if (!v.address.trim()) e.address = "Please enter your street address";
  else if (v.address.trim().length < 5) e.address = "Address looks too short";
  if (!v.city.trim()) e.city = "Please enter your city";
  if (v.postalCode && !/^[A-Za-z0-9\- ]{2,12}$/.test(v.postalCode.trim()))
    e.postalCode = "Enter a valid postal code";
  if (!v.country.trim()) e.country = "Please enter your country";
  return e;
};

const Checkout = () => {
  const { user } = useAuth();
  const { cartItems, total, initialized, resetCart } = useCart();
  const navigate = useNavigate();

  const draftKey = `checkout:draft:${user?._id}`;
  const [values, setValues] = useState(() => {
    const base = {
      name: user?.name || "",
      email: user?.email || "",
      address: "",
      city: "",
      postalCode: "",
      country: "",
      paymentMethod: PAYMENT_METHODS[0].value,
    };
    try {
      // sessionStorage: remembers the form if you reload, forgets it when the tab closes.
      return { ...base, ...JSON.parse(sessionStorage.getItem(draftKey) || "{}") };
    } catch {
      return base;
    }
  });
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useDocumentTitle("Checkout");

  useEffect(() => {
    try {
      sessionStorage.setItem(draftKey, JSON.stringify(values));
    } catch {
      /* ignore */
    }
  }, [values, draftKey]);

  const errors = useMemo(() => validate(values), [values]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (submitError) setSubmitError("");
  };
  const handleBlur = (e) => setTouched((t) => ({ ...t, [e.target.name]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(Object.fromEntries(FIELDS.map((f) => [f.name, true])));
    if (Object.keys(errors).length) {
      const first = FIELDS.find((f) => errors[f.name]);
      document.getElementById(first.name)?.focus();
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    const snapshot = cartItems; // keep for the confirmation page (the server empties the cart)
    try {
      const res = await ordersAPI.create({
        shippingAddress: {
          name: values.name.trim(),
          email: values.email.trim(),
          address: values.address.trim(),
          city: values.city.trim(),
          postalCode: values.postalCode.trim(),
          country: values.country.trim(),
          // the server reads the payment method from here
          paymentMethod: values.paymentMethod,
        },
        paymentMethod: values.paymentMethod,
      });

      try {
        sessionStorage.removeItem(draftKey);
      } catch {
        /* ignore */
      }
      resetCart();
      toast.success("Order placed!");
      navigate("/order-success", {
        replace: true,
        state: { order: res.data.order || res.data, items: snapshot },
      });
    } catch (err) {
      setSubmitError(getErrorMessage(err, "We couldn’t place your order. Please try again."));
      setSubmitting(false);
    }
  };

  if (!initialized) return <PageLoader message="Loading your cart…" />;

  if (cartItems.length === 0 && !submitting) {
    return (
      <section className="page-container py-12">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          message="Add something to your cart before checking out."
          action={
            <Link to="/products" className="btn btn-primary btn-lg">
              Browse products
            </Link>
          }
        />
      </section>
    );
  }

  return (
    <section className="page-container py-8">
      <h1 className="mb-6 text-3xl font-bold text-fg">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-5">
        <motion.form
          onSubmit={handleSubmit}
          noValidate
          className="card p-6 sm:p-8 lg:col-span-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="mb-5 text-xl font-semibold text-fg">Shipping details</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {FIELDS.map((f) => {
              const showError = touched[f.name] && errors[f.name];
              return (
                <div key={f.name} className={f.full ? "sm:col-span-2" : ""}>
                  <label htmlFor={f.name} className="label">
                    {f.label}
                  </label>
                  <input
                    id={f.name}
                    name={f.name}
                    type={f.type}
                    autoComplete={f.autoComplete}
                    placeholder={f.placeholder}
                    value={values[f.name]}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required={f.required}
                    aria-invalid={Boolean(showError)}
                    aria-describedby={showError ? `${f.name}-error` : undefined}
                    className={`field ${showError ? "field-invalid" : ""}`}
                  />
                  {showError && (
                    <p id={`${f.name}-error`} className="error-text">
                      {errors[f.name]}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <fieldset className="mt-8">
            <legend className="mb-3 text-xl font-semibold text-fg">Payment method</legend>
            <div className="space-y-2">
              {PAYMENT_METHODS.map((m) => (
                <label
                  key={m.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3.5 transition-colors ${
                    values.paymentMethod === m.value
                      ? "border-brand bg-brand/10"
                      : "border-line hover:bg-surface-2"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={m.value}
                    checked={values.paymentMethod === m.value}
                    onChange={handleChange}
                    className="h-4 w-4 accent-brand"
                  />
                  <span className="font-medium text-fg">{m.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {submitError && (
            <div
              role="alert"
              className="mt-6 flex items-start gap-2 rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger-text"
            >
              <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
              <span>{submitError}</span>
            </div>
          )}

          <button type="submit" disabled={submitting} className="btn btn-primary btn-lg mt-6 w-full">
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" aria-hidden="true" /> Placing order…
              </>
            ) : (
              <>Place order · {formatPrice(total)}</>
            )}
          </button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted">
            <Lock size={12} aria-hidden="true" /> Your information is sent over a secure connection.
          </p>
        </motion.form>

        <aside className="card h-fit p-6 lg:sticky lg:top-24 lg:col-span-2" aria-label="Order summary">
          <h2 className="mb-4 text-xl font-semibold text-fg">Order summary</h2>
          <ul className="max-h-80 space-y-4 overflow-y-auto pr-1">
            {cartItems.map((item) => {
              const p = item.product;
              return (
                <li key={getId(item)} className="flex items-center gap-3">
                  <img
                    src={getImage(p, 120)}
                    alt=""
                    onError={onImgError}
                    className="h-14 w-14 shrink-0 rounded-lg bg-surface-2 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-medium text-fg">{p.name}</p>
                    <p className="text-xs text-muted">
                      {formatPrice(getPrice(p))} × {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-fg">{formatPrice(getPrice(p) * item.quantity)}</p>
                </li>
              );
            })}
          </ul>
          <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="text-fg">{formatPrice(total)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Shipping</dt>
              <dd className="font-medium text-success-text">Free</dd>
            </div>
            <div className="flex justify-between pt-2 text-lg">
              <dt className="font-semibold text-fg">Total</dt>
              <dd className="font-bold text-fg">{formatPrice(total)}</dd>
            </div>
          </dl>
          <Link to="/cart" className="mt-4 block text-center text-sm text-muted hover:text-fg hover:underline">
            ← Edit cart
          </Link>
        </aside>
      </div>
    </section>
  );
};

export default Checkout;
