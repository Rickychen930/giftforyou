// src/App.tsx - Optimized Main Application Component
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { NAV_LINKS } from "./constants/app-constants";
import Header from "./view/header";
import Footer from "./view/footer";

import HomePage from "./view/home-page";
import BouquetCatalogRoute from "./view/bouquet-catalog-route";
import LoginController from "./controllers/login-page-controller";
import DashboardController from "./controllers/dashboard-page-controller";
import BouquetDetailController from "./controllers/bouquet-detail-controller";
import FAQPage from "./view/faq-page";
import ContactPage from "./view/contact-page";
import OrderConfirmationPage from "./view/order-confirmation-page";
import OrderHistoryPage from "./view/order-history-page";
import FavoritesPage from "./view/favorites-page";
import ErrorBoundary from "./components/error-boundary";
import ScrollToTop from "./components/scroll-to-top";
import { trackPageview } from "./services/analytics.service";

import { isAuthenticated, checkSessionTimeout, updateLastActivity } from "./utils/auth-utils";

// Update activity on user interaction
if (typeof window !== "undefined") {
  const events = ["mousedown", "keydown", "scroll", "touchstart"];
  events.forEach((event) => {
    window.addEventListener(event, updateLastActivity, { passive: true });
  });
}

const isLoggedIn = (): boolean => {
  // Check session timeout (30 minutes of inactivity)
  if (checkSessionTimeout(30)) {
    return false;
  }
  return isAuthenticated();
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return isLoggedIn() ? <>{children}</> : <Navigate to="/login" replace />;
};

const SearchRedirect: React.FC = () => {
  const location = useLocation();
  return <Navigate to={`/collection${location.search ?? ""}`} replace />;
};

// Page Transition Wrapper for smooth transitions
const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = React.useState(location);
  const [transitionStage, setTransitionStage] = React.useState<"entering" | "entered">("entered");

  React.useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage("entering");
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage("entered");
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [location, displayLocation]);

  return (
    <div
      className={`page-transition page-transition--${transitionStage}`}
      style={{
        opacity: transitionStage === "entering" ? 0 : 1,
        transform: transitionStage === "entering" ? "translateY(10px)" : "translateY(0)",
        transition: "opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {children}
    </div>
  );
};

const AppLayout: React.FC = () => {
  const loggedIn = isLoggedIn();
  const navLinks = loggedIn
    ? [...NAV_LINKS.authenticated]
    : [...NAV_LINKS.public];

  const location = useLocation();

  React.useEffect(() => {
    // Track public site traffic only (avoid skew from admin dashboard hash-tabs).
    if (location.pathname.startsWith("/dashboard")) return;
    trackPageview(location.pathname, location.search);
  }, [location.pathname, location.search]);

  return (
    <>
      <Header navLinks={navLinks} />

      <PageTransition>
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/collection" element={<BouquetCatalogRoute />} />
          <Route path="/bouquet/:id" element={<BouquetDetailController />} />
          <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
          <Route path="/order-history" element={<OrderHistoryPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/search" element={<SearchRedirect />} />
          <Route path="/cart" element={<Navigate to="/collection" replace />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginController />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardController />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PageTransition>

      <Footer />
    </>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <ErrorBoundary>
        <ScrollToTop />
        <AppLayout />
      </ErrorBoundary>
    </Router>
  );
};

export default App;
