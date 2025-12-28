import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Premium smooth scroll with respect for reduced motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scrollBehavior: ScrollBehavior = prefersReducedMotion ? "auto" : "smooth";
    
    // Small delay to ensure page content is ready
    const timeoutId = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: scrollBehavior });
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [location.pathname]);

  return null;
};

export default ScrollToTop;
