import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Jump to the top when the page (path) changes — instantly, not animated.
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
};

export default ScrollToTop;
