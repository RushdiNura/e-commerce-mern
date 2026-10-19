const SIZES = { sm: "h-5 w-5 border-2", md: "h-8 w-8 border-[3px]", lg: "h-12 w-12 border-4" };

export default function LoadingSpinner({ size = "md", label = "Loading" }) {
  return (
    <span
      role="status"
      aria-label={label}
      className={`inline-block animate-spin rounded-full border-line border-t-brand ${SIZES[size]}`}
    />
  );
}

export function PageLoader({ message = "Loading…" }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-muted">
      <LoadingSpinner size="lg" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
