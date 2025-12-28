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
import CartPage from "./view/cart-page";
import CheckoutPage from "./view/checkout-page";
import CustomerRegisterPage from "./view/customer-register-page";
import CustomerLoginPage from "./view/customer-login-page";
import CustomerDashboardPage from "./view/customer-dashboard-page";
import CustomerProfilePage from "./view/customer-profile-page";
import CustomerAddressesPage from "./view/customer-addresses-page";
import CustomerChangePasswordPage from "./view/customer-change-password-page";
import CustomerNotificationsPage from "./view/customer-notifications-page";
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
          <Route path="/" element={<HomePage />} />
          <Route path="/collection" element={<BouquetCatalogRoute />} />
          <Route path="/bouquet/:id" element={<BouquetDetailController />} />
          <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
                <Route path="/order-history" element={<OrderHistoryPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/search" element={<SearchRedirect />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/contact" element={<ContactPage />} />
          
          {/* Customer Authentication */}
          <Route path="/customer/register" element={<CustomerRegisterPage />} />
          <Route path="/customer/login" element={<CustomerLoginPage />} />
          
          {/* Customer Dashboard & Profile */}
          <Route
            path="/customer/dashboard"
            element={
              <CustomerProtectedRoute>
                <CustomerDashboardPage />
              </CustomerProtectedRoute>
            }
          />
          <Route
            path="/customer/profile"
            element={
              <CustomerProtectedRoute>
                <CustomerProfilePage />
              </CustomerProtectedRoute>
            }
          />
          <Route
            path="/customer/addresses"
            element={
              <CustomerProtectedRoute>
                <CustomerAddressesPage />
              </CustomerProtectedRoute>
            }
          />
          <Route
            path="/customer/change-password"
            element={
              <CustomerProtectedRoute>
                <CustomerChangePasswordPage />
              </CustomerProtectedRoute>
            }
          />
          <Route
            path="/customer/notifications"
            element={
              <CustomerProtectedRoute>
                <CustomerNotificationsPage />
              </CustomerProtectedRoute>
            }
          />
          
          {/* Admin Dashboard */}
          <Route path="/login" element={<LoginController />} />
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
