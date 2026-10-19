import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PageLoader } from "./LoadingSpinner";

const ProtectedRoute = ({ children, role }) => {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing && !user) return <PageLoader message="Checking your session…" />;

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  if (role && user.role !== role) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
