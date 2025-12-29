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

import HomePageController from "./controllers/home-page-controller";
import BouquetCatalogRoute from "./view/bouquet-catalog-route";
import DashboardController from "./controllers/dashboard-page-controller";
import BouquetDetailPageController from "./controllers/bouquet-detail-page-controller";
import FAQPageController from "./controllers/faq-page-controller";
import ContactPageController from "./controllers/contact-page-controller";
import OrderConfirmationPageController from "./controllers/order-confirmation-page-controller";
import OrderHistoryPageController from "./controllers/order-history-page-controller";
import FavoritesPageController from "./controllers/favorites-page-controller";
import CartPageController from "./controllers/cart-page-controller";
import CheckoutPageController from "./controllers/checkout-page-controller";
import CustomerRegisterPageController from "./controllers/customer-register-page-controller";
import CustomerLoginPageController from "./controllers/customer-login-page-controller";
import CustomerDashboardPageController from "./controllers/customer-dashboard-page-controller";
import CustomerProfilePageController from "./controllers/customer-profile-page-controller";
import CustomerAddressesPageController from "./controllers/customer-addresses-page-controller";
import CustomerChangePasswordPageController from "./controllers/customer-change-password-page-controller";
import CustomerNotificationsPageController from "./controllers/customer-notifications-page-controller";
import ErrorBoundary from "./components/error-boundary";
import ScrollToTop from "./components/scroll-to-top";
import LuxuryToastContainer from "./components/LuxuryToastContainer";
import { toast } from "./utils/toast";
import { trackPageview } from "./services/analytics.service";

import { isAuthenticated, checkSessionTimeout, updateLastActivity, decodeToken } from "./utils/auth-utils";

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

const ProtectedRoute: React.FC<{ children: React.ReactNode; requireAdmin?: boolean }> = ({
  children,
  requireAdmin = false,
}) => {
  if (!isLoggedIn()) {
    return <Navigate to="/customer/login" replace />;
  }

  if (requireAdmin) {
    const token = localStorage.getItem("authToken");
    if (token) {
      const decoded = decodeToken(token);
      if (decoded && decoded.role !== "admin") {
        return <Navigate to="/customer/dashboard" replace />;
      }
    }
  }

  return <>{children}</>;
};

const CustomerProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return isLoggedIn() ? <>{children}</> : <Navigate to="/customer/login" replace />;
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
  const [toasts, setToasts] = React.useState<Array<{ id: string; message: string; type: "success" | "error" | "warning" | "info"; duration?: number }>>([]);
  
  // Determine user role and set appropriate nav links
  type NavItem = { label: string; path: string };
  let navLinks: NavItem[] = [...NAV_LINKS.public];
  if (loggedIn) {
    const token = localStorage.getItem("authToken");
    if (token) {
      const decoded = decodeToken(token);
      if (decoded && decoded.role === "customer") {
        navLinks = [...NAV_LINKS.customer];
      } else if (decoded && decoded.role === "admin") {
        navLinks = [...NAV_LINKS.authenticated];
      }
    }
  }

  const location = useLocation();

  React.useEffect(() => {
    // Track public site traffic only (avoid skew from admin dashboard hash-tabs).
    if (location.pathname.startsWith("/dashboard")) return;
    trackPageview(location.pathname, location.search);
  }, [location.pathname, location.search]);

  React.useEffect(() => {
    const unsubscribe = toast.subscribe((newToasts) => {
      setToasts(newToasts);
    });
    return unsubscribe;
  }, []);

  return (
    <>
      <Header navLinks={navLinks} />

      <PageTransition>
        <Routes location={location}>
          <Route path="/" element={<HomePageController />} />
          <Route path="/collection" element={<BouquetCatalogRoute />} />
              <Route path="/bouquet/:id" element={<BouquetDetailPageController />} />
          <Route path="/order-confirmation" element={<OrderConfirmationPageController />} />
                <Route path="/order-history" element={<OrderHistoryPageController />} />
                <Route path="/favorites" element={<FavoritesPageController />} />
                <Route path="/cart" element={<CartPageController />} />
                <Route path="/checkout" element={<CheckoutPageController />} />
                <Route path="/search" element={<SearchRedirect />} />
          <Route path="/faq" element={<FAQPageController />} />
          <Route path="/contact" element={<ContactPageController />} />
          
          {/* Customer Authentication */}
          <Route path="/customer/register" element={<CustomerRegisterPageController />} />
          <Route path="/customer/login" element={<CustomerLoginPageController />} />
          
          {/* Customer Dashboard & Profile */}
          <Route
            path="/customer/dashboard"
            element={
              <CustomerProtectedRoute>
                <CustomerDashboardPageController />
              </CustomerProtectedRoute>
            }
          />
          <Route
            path="/customer/profile"
            element={
              <CustomerProtectedRoute>
                <CustomerProfilePageController />
              </CustomerProtectedRoute>
            }
          />
          <Route
            path="/customer/addresses"
            element={
              <CustomerProtectedRoute>
                <CustomerAddressesPageController />
              </CustomerProtectedRoute>
            }
          />
          <Route
            path="/customer/change-password"
            element={
              <CustomerProtectedRoute>
                <CustomerChangePasswordPageController />
              </CustomerProtectedRoute>
            }
          />
          <Route
            path="/customer/notifications"
            element={
              <CustomerProtectedRoute>
                <CustomerNotificationsPageController />
              </CustomerProtectedRoute>
            }
          />
          
          {/* Admin Dashboard - Login via /customer/login with admin role */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requireAdmin>
                <DashboardController />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PageTransition>

      <Footer />
      
      <LuxuryToastContainer 
        toasts={toasts} 
        onRemove={(id) => toast.remove(id)} 
      />
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
