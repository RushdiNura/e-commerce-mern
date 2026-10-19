export default function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="card flex flex-col items-center px-6 py-16 text-center">
      {Icon && (
        <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-2 text-muted">
          <Icon size={30} aria-hidden="true" />
        </span>
      )}
      <h2 className="text-xl font-semibold text-fg">{title}</h2>
      {message && <p className="mt-2 max-w-md text-muted">{message}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
