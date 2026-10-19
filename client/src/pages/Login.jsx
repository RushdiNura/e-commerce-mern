import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { getErrorMessage } from "../utils/format";
import { BRAND } from "../config";

const Login = () => {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  useDocumentTitle(isSignup ? "Create account" : "Log in");

  // Where to go after logging in (the page they tried to open, or home).
  const redirectTo = location.state?.from?.pathname || "/";

  if (user) return <Navigate to={user.role === "admin" ? "/admin" : redirectTo} replace />;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const me = isSignup
        ? await register({
            name: form.name.trim(),
            email: form.email.trim(),
            password: form.password,
            role: "user", // customers only; admins are created by the store owner
          })
        : await login({ email: form.email.trim(), password: form.password });

      toast.success(isSignup ? "Account created — welcome!" : `Welcome back, ${me.name.split(" ")[0]}!`);
      navigate(me.role === "admin" ? "/admin" : redirectTo, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, isSignup ? "Sign up failed" : "Login failed"));
      setSubmitting(false);
    }
  };

  const switchMode = () => {
    setIsSignup((s) => !s);
    setError("");
    setShowPassword(false);
  };

  return (
    <section className="flex min-h-[calc(100vh-14rem)] items-center justify-center py-8">
      <motion.div
        className="card w-full max-w-md p-6 shadow-xl sm:p-8"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-6 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-brand-text">{BRAND}</p>
          <h1 className="mt-2 text-3xl font-bold text-fg">
            {isSignup ? "Create an account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {isSignup
              ? "Sign up to save your cart and track your orders."
              : "Log in to continue shopping."}
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-2 rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger-text"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div>
              <label htmlFor="name" className="label">
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={handleChange}
                required
                minLength={2}
                placeholder="Jane Doe"
                className="field"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="label">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              className="field"
            />
          </div>

          <div>
            <label htmlFor="password" className="label">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={isSignup ? "new-password" : "current-password"}
                value={form.password}
                onChange={handleChange}
                required
                minLength={isSignup ? 6 : undefined}
                placeholder={isSignup ? "At least 6 characters" : "Your password"}
                className="field pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted transition-colors hover:text-fg"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn btn-primary btn-lg w-full">
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                {isSignup ? "Creating account…" : "Logging in…"}
              </>
            ) : isSignup ? (
              "Create account"
            ) : (
              "Log in"
            )}
          </button>
          {submitting && (
            <p className="text-center text-xs text-muted">
              The first request can take a few seconds while the server wakes up.
            </p>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          {isSignup ? "Already have an account?" : "New to " + BRAND + "?"}{" "}
          <button
            type="button"
            onClick={switchMode}
            className="font-semibold text-brand-text underline-offset-4 hover:underline"
          >
            {isSignup ? "Log in" : "Create an account"}
          </button>
        </p>
        <p className="mt-4 text-center text-sm">
          <Link to="/products" className="text-muted underline-offset-4 hover:text-fg hover:underline">
            Continue browsing without an account
          </Link>
        </p>
      </motion.div>
    </section>
  );
};

export default Login;
