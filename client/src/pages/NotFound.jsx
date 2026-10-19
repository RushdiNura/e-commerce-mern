import { Link } from "react-router-dom";
import useDocumentTitle from "../hooks/useDocumentTitle";

const NotFound = () => {
  useDocumentTitle("Page not found");
  return (
    <section className="page-container flex min-h-[50vh] flex-col items-center justify-center text-center">
      <p className="text-6xl font-extrabold text-brand-text">404</p>
      <h1 className="mt-3 text-2xl font-bold text-fg">Page not found</h1>
      <p className="mt-2 max-w-md text-muted">
        The page you’re looking for doesn’t exist or has been moved.
      </p>
      <div className="mt-6 flex gap-3">
        <Link to="/" className="btn btn-primary">
          Go home
        </Link>
        <Link to="/products" className="btn btn-secondary">
          Browse products
        </Link>
      </div>
    </section>
  );
};

export default NotFound;
