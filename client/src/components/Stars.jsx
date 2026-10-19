import { Star } from "lucide-react";

// Read-only star rating. Pass `size` in px.
export default function Stars({ value = 0, size = 16, className = "" }) {
  const rounded = Math.round(Number(value) || 0);
  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className}`}
      role="img"
      aria-label={`Rated ${Number(value || 0).toFixed(1)} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          aria-hidden="true"
          className={n <= rounded ? "fill-yellow-400 text-yellow-400" : "text-field"}
        />
      ))}
    </span>
  );
}
