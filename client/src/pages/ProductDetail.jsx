import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  ChevronRight,
  Edit3,
  Minus,
  Plus,
  RefreshCw,
  Send,
  Shield,
  ShoppingCart,
  Star,
  Trash2,
  Truck,
} from "lucide-react";
import Stars from "../components/Stars";
import ConfirmDialog from "../components/ConfirmDialog";
import { PageLoader } from "../components/LoadingSpinner";
import { productsAPI, ratingAPI } from "../services/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import useDocumentTitle from "../hooks/useDocumentTitle";
import {
  formatDate,
  formatPrice,
  getCategoryName,
  getErrorMessage,
  getImages,
  getPrice,
  getRating,
  getReviewCount,
  onImgError,
} from "../utils/format";
import { FALLBACK_IMAGE } from "../config";

const reviewOwnerId = (r) => String(r.user?._id ?? r.user ?? "");

// Interactive star picker used by the review form.
const StarPicker = ({ value, onChange }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex" role="radiogroup" aria-label="Your rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="rounded p-1 transition-transform hover:scale-110"
        >
          <Star
            size={28}
            className={n <= (hover || value) ? "fill-yellow-400 text-yellow-400" : "text-field"}
          />
        </button>
      ))}
    </div>
  );
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();
  const { user, isAdmin } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  // review form
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [editing, setEditing] = useState(null);
  const [savingReview, setSavingReview] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useDocumentTitle(product?.name);

  const load = useCallback(async () => {
    try {
      const res = await productsAPI.getById(id);
      setProduct(res.data.product || res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.status === 404 || err.response?.status === 400
          ? "We couldn’t find that product."
          : getErrorMessage(err, "Could not load this product.")
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    setLoading(true);
    setActiveImage(0);
    setQty(1);
    load();
  }, [load]);

  if (loading) return <PageLoader message="Loading product…" />;

  if (error || !product) {
    return (
      <div className="page-container flex min-h-[50vh] flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold text-fg">{error || "Product not found"}</h1>
        <Link to="/products" className="btn btn-primary mt-6">
          Browse products
        </Link>
      </div>
    );
  }

  const images = getImages(product, 900);
  const gallery = images.length ? images : [FALLBACK_IMAGE];
  const price = getPrice(product);
  const oldPrice = Number(product.old_price) || 0;
  const discount = oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
  const stock = product.stock === undefined ? null : Number(product.stock);
  const outOfStock = stock !== null && stock <= 0;
  const maxQty = stock !== null ? Math.max(1, Math.min(stock, 10)) : 10;
  const category = getCategoryName(product);
  const reviews = [...(product.reviews || [])].reverse();
  const reviewCount = getReviewCount(product);
  const avg = getRating(product);
  const myReview = user ? reviews.find((r) => reviewOwnerId(r) === String(user._id)) : null;

  const distribution = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => Math.round(r.rating) === star).length;
    return { star, count, pct: reviews.length ? (count / reviews.length) * 100 : 0 };
  });

  const handleAdd = async () => {
    if (!user) {
      toast("Please log in to add items to your cart");
      navigate("/login", { state: { from: location } });
      return;
    }
    setAdding(true);
    await addToCart({ productId: product._id, quantity: qty, name: product.name });
    setAdding(false);
  };

  const resetForm = () => {
    setEditing(null);
    setRating(0);
    setComment("");
  };

  const startEdit = (review) => {
    setEditing(review);
    setRating(review.rating);
    setComment(review.comment);
    document.getElementById("review-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (rating === 0) return toast.error("Please choose a star rating");
    if (!comment.trim()) return toast.error("Please write a short review");

    setSavingReview(true);
    try {
      if (editing) {
        await ratingAPI.updateReview(product._id, editing._id, { rating, comment: comment.trim() });
        toast.success("Review updated");
      } else {
        await ratingAPI.addReview(product._id, { rating, comment: comment.trim() });
        toast.success("Thanks for your review!");
      }
      resetForm();
      await load(); // refresh reviews + average from the server
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not save your review"));
    } finally {
      setSavingReview(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await ratingAPI.deleteReview(product._id, toDelete._id);
      toast.success("Review deleted");
      setToDelete(null);
      if (editing?._id === toDelete._id) resetForm();
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete the review"));
    } finally {
      setDeleting(false);
    }
  };

  const ReviewForm = (
    <form
      id="review-form"
      onSubmit={submitReview}
      className="mb-8 space-y-4 rounded-xl border border-line bg-surface-2 p-5"
    >
      <h3 className="text-lg font-semibold text-fg">
        {editing ? "Edit your review" : "Write a review"}
      </h3>
      <div>
        <span className="label">Your rating</span>
        <StarPicker value={rating} onChange={setRating} />
      </div>
      <div>
        <label htmlFor="comment" className="label">
          Your review
        </label>
        <textarea
          id="comment"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What did you like or dislike? How are you using it?"
          className="field"
          maxLength={1000}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={savingReview} className="btn btn-primary">
          <Send size={16} aria-hidden="true" />
          {savingReview ? "Saving…" : editing ? "Update review" : "Submit review"}
        </button>
        {editing && (
          <button type="button" onClick={resetForm} className="btn btn-secondary">
            Cancel
          </button>
        )}
      </div>
    </form>
  );

  return (
    <section className="page-container py-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-1 text-sm text-muted">
        <Link to="/products" className="hover:text-fg hover:underline">
          Products
        </Link>
        {category && (
          <>
            <ChevronRight size={14} aria-hidden="true" />
            <Link
              to={`/products?category=${encodeURIComponent(category.toLowerCase())}`}
              className="capitalize hover:text-fg hover:underline"
            >
              {category}
            </Link>
          </>
        )}
        <ChevronRight size={14} aria-hidden="true" />
        <span className="line-clamp-1 text-fg" aria-current="page">
          {product.name}
        </span>
      </nav>

      <motion.div
        className="card grid gap-8 p-5 sm:p-8 md:grid-cols-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Gallery */}
        <div>
          <div className="relative overflow-hidden rounded-xl bg-surface-2">
            <img
              src={gallery[activeImage] || gallery[0]}
              alt={product.name}
              onError={onImgError}
              className="aspect-square w-full object-cover"
            />
            {discount > 0 && (
              <span className="badge absolute right-3 top-3 bg-danger text-white">-{discount}%</span>
            )}
          </div>
          {gallery.length > 1 && (
            <ul className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {gallery.map((src, i) => (
                <li key={src + i}>
                  <button
                    type="button"
                    onClick={() => setActiveImage(i)}
                    aria-label={`Show image ${i + 1}`}
                    aria-current={i === activeImage}
                    className={`h-16 w-16 overflow-hidden rounded-lg border-2 transition ${
                      i === activeImage ? "border-brand" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={src} alt="" onError={onImgError} className="h-full w-full object-cover" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          {category && (
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-text">{category}</p>
          )}
          <h1 className="mt-1 text-3xl font-extrabold leading-tight text-fg">{product.name}</h1>

          <a href="#reviews" className="mt-3 flex items-center gap-2 text-sm">
            <Stars value={avg} size={18} />
            <span className="font-semibold text-fg">{avg.toFixed(1)}</span>
            <span className="text-muted">
              ({reviewCount} review{reviewCount === 1 ? "" : "s"})
            </span>
          </a>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-4xl font-bold text-fg">{formatPrice(price)}</span>
            {oldPrice > price && (
              <span className="text-xl text-muted line-through">{formatPrice(oldPrice)}</span>
            )}
          </div>

          <p className="mt-5 whitespace-pre-line leading-relaxed text-muted">
            {product.description || "No description provided."}
          </p>

          <div className="mt-5">
            {stock !== null && (
              <span
                className={`badge ${
                  outOfStock
                    ? "bg-danger/15 text-danger-text"
                    : stock <= 10
                    ? "bg-warning/15 text-warning-text"
                    : "bg-success/15 text-success-text"
                }`}
              >
                {outOfStock ? "Out of stock" : stock <= 10 ? `Only ${stock} left` : "In stock"}
              </span>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {!outOfStock && (
              <div className="inline-flex items-center rounded-lg border border-field" role="group" aria-label="Quantity">
                <button
                  type="button"
                  className="px-3.5 py-3 text-fg hover:bg-surface-2 disabled:opacity-40"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>
                <span className="min-w-10 text-center font-semibold text-fg" aria-live="polite">
                  {qty}
                </span>
                <button
                  type="button"
                  className="px-3.5 py-3 text-fg hover:bg-surface-2 disabled:opacity-40"
                  onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                  disabled={qty >= maxQty}
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={handleAdd}
              disabled={adding || outOfStock}
              className="btn btn-primary btn-lg flex-1"
            >
              <ShoppingCart size={20} aria-hidden="true" />
              {outOfStock ? "Out of stock" : adding ? "Adding…" : user ? "Add to cart" : "Log in to add to cart"}
            </button>
          </div>

          <ul className="mt-8 grid grid-cols-1 gap-3 border-t border-line pt-6 text-sm text-muted sm:grid-cols-3">
            <li className="flex items-center gap-2">
              <Shield size={18} className="text-success-text" aria-hidden="true" /> 1 year warranty
            </li>
            <li className="flex items-center gap-2">
              <Truck size={18} className="text-brand-text" aria-hidden="true" /> Free shipping
            </li>
            <li className="flex items-center gap-2">
              <RefreshCw size={18} className="text-brand-text" aria-hidden="true" /> 30-day returns
            </li>
          </ul>
        </div>
      </motion.div>

      {/* Reviews */}
      <div id="reviews" className="card mt-8 scroll-mt-24 p-5 sm:p-8">
        <h2 className="mb-6 text-2xl font-bold text-fg">Customer reviews</h2>

        <div className="mb-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl bg-surface-2 p-6 text-center">
            <p className="text-5xl font-bold text-fg">{avg.toFixed(1)}</p>
            <Stars value={avg} size={20} className="mt-2" />
            <p className="mt-2 text-sm text-muted">
              Based on {reviewCount} review{reviewCount === 1 ? "" : "s"}
            </p>
          </div>
          <div className="rounded-xl bg-surface-2 p-6 md:col-span-2">
            <ul className="space-y-2">
              {distribution.map(({ star, count, pct }) => (
                <li key={star} className="flex items-center gap-3 text-sm">
                  <span className="w-12 text-muted">{star} star</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                    <div className="h-full rounded-full bg-yellow-400" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-8 text-right text-muted">{count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {user ? (
          editing || !myReview ? (
            ReviewForm
          ) : (
            <p className="mb-8 rounded-lg bg-surface-2 p-4 text-sm text-muted">
              You’ve already reviewed this product — you can edit or delete your review below.
            </p>
          )
        ) : (
          <p className="mb-8 rounded-lg bg-surface-2 p-4 text-sm text-muted">
            <Link to="/login" state={{ from: location }} className="font-semibold text-brand-text hover:underline">
              Log in
            </Link>{" "}
            to write a review.
          </p>
        )}

        {reviews.length === 0 ? (
          <div className="py-10 text-center text-muted">
            <Star size={40} className="mx-auto mb-3 opacity-40" aria-hidden="true" />
            <p className="font-semibold text-fg">No reviews yet</p>
            <p className="text-sm">Be the first to share your experience.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {reviews.map((r) => {
              const mine = user && reviewOwnerId(r) === String(user._id);
              return (
                <li key={r._id} className="rounded-xl border border-line p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-fg">{r.userName || "Customer"}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Stars value={r.rating} size={14} />
                        <span className="text-xs text-muted">{formatDate(r.createdAt)}</span>
                      </div>
                    </div>
                    {(mine || isAdmin) && (
                      <div className="flex gap-1">
                        {mine && (
                          <button
                            type="button"
                            onClick={() => startEdit(r)}
                            className="btn btn-ghost !p-2"
                            aria-label="Edit your review"
                          >
                            <Edit3 size={16} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setToDelete(r)}
                          className="btn btn-ghost !p-2 hover:!text-danger-text"
                          aria-label="Delete review"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="mt-3 whitespace-pre-line text-fg">{r.comment}</p>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete this review?"
        message="This can’t be undone."
        confirmLabel="Delete review"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </section>
  );
};

export default ProductDetail;
