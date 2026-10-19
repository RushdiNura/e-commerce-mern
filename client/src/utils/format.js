import { FALLBACK_IMAGE } from "../config";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export const formatPrice = (n) => currency.format(Number(n) || 0);

export const formatDate = (value, options) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(
    "en-US",
    options || { year: "numeric", month: "short", day: "numeric" }
  );
};

export const getId = (o) => o?._id ?? o?.id ?? null;

export const getPrice = (p) => Number(p?.price ?? p?.new_price ?? 0);

export const getCategoryName = (p) => {
  const c = p?.category ?? p?.categories;
  if (!c) return "";
  if (typeof c === "string") return /^[0-9a-f]{24}$/i.test(c) ? "" : c;
  if (Array.isArray(c)) return getCategoryName({ category: c[0] });
  return c.name || c.title || "";
};

export const getRating = (p) => {
  if (typeof p?.rating === "number") return p.rating;
  return Number(p?.rating?.average) || 0;
};

export const getReviewCount = (p) =>
  p?.numReviews ?? p?.rating?.count ?? p?.reviews?.length ?? 0;

// Cloudinary can serve smaller, modern formats automatically.
export const optimizeImage = (url, width = 600) => {
  if (typeof url !== "string") return url;
  if (url.includes("res.cloudinary.com") && url.includes("/upload/") && !url.includes("/upload/f_auto")) {
    return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
  }
  return url;
};

export const getImages = (p, width = 600) => {
  const raw = p?.image ?? p?.images;
  const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const urls = list
    .map((i) => (typeof i === "string" ? i : i?.url))
    .filter(Boolean)
    .map((u) => optimizeImage(u, width));
  return urls;
};

export const getImage = (p, width = 600) => getImages(p, width)[0] || FALLBACK_IMAGE;

// <img onError={onImgError}> — swaps a broken image for the placeholder (once).
export const onImgError = (e) => {
  const img = e.currentTarget;
  if (img.dataset.fallback) return;
  img.dataset.fallback = "1";
  img.src = FALLBACK_IMAGE;
};

// Order statuses on the server are capitalised ("Pending", "Shipped"...).
const STATUS = {
  pending: { label: "Pending", tone: "warning" },
  processing: { label: "Processing", tone: "brand" },
  shipped: { label: "Shipped", tone: "brand" },
  delivered: { label: "Delivered", tone: "success" },
  cancelled: { label: "Cancelled", tone: "danger" },
};

export const statusMeta = (status) =>
  STATUS[String(status || "pending").toLowerCase()] || {
    label: String(status),
    tone: "muted",
  };

export const toneClasses = {
  warning: "bg-warning/15 text-warning-text",
  brand: "bg-brand/15 text-brand-text",
  success: "bg-success/15 text-success-text",
  danger: "bg-danger/15 text-danger-text",
  muted: "bg-surface-2 text-muted",
};

// Turns any API/network error into a message a customer can act on.
export const getErrorMessage = (err, fallback = "Something went wrong. Please try again.") => {
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.code === "ECONNABORTED") return "The server took too long to respond. Please try again.";
  if (err?.request && !err.response) return "Can't reach the server. Check your connection and try again.";
  return err?.message || fallback;
};
