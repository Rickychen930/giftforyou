// src/App.tsx - Optimized Main Application Component with Lazy Loading
import React, { Suspense, lazy, Component } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { NAV_LINKS } from "./constants/app-constants";
import HeaderControllerWrapper from "./controllers/header-controller";
import Footer from "./view/footer";
import ErrorBoundary from "./components/error-boundary";
import ScrollToTop, { RouteScrollHandler } from "./components/common/ScrollToTop";
import LuxuryToastContainer from "./components/common/LuxuryToastContainer";
import LoadingProgressIndicator from "./components/common/LoadingProgressIndicator";
import { toast } from "./utils/toast";
import { trackPageview } from "./services/analytics.service";
import { isAuthenticated, checkSessionTimeout, updateLastActivity, decodeToken } from "./utils/auth-utils";

// Lazy load all page controllers for better performance
const HomePageController = lazy(() => import("./controllers/home-page-controller"));
const BouquetCatalogRoute = lazy(() => import("./routes/bouquet-catalog-route"));
const DashboardController = lazy(() => import("./controllers/dashboard-page-controller"));
const BouquetDetailPageController = lazy(() => import("./controllers/bouquet-detail-page-controller"));
const FAQPageController = lazy(() => import("./controllers/faq-page-controller"));
const ContactPageController = lazy(() => import("./controllers/contact-page-controller"));
const OrderConfirmationPageController = lazy(() => import("./controllers/order-confirmation-page-controller"));
const OrderHistoryPageController = lazy(() => import("./controllers/order-history-page-controller"));
const FavoritesPageController = lazy(() => import("./controllers/favorites-page-controller"));
const CartPageController = lazy(() => import("./controllers/cart-page-controller"));
const CheckoutPageController = lazy(() => import("./controllers/checkout-page-controller"));
const CustomerRegisterPageController = lazy(() => import("./controllers/customer-register-page-controller"));
const CustomerLoginPageController = lazy(() => import("./controllers/customer-login-page-controller"));
const CustomerDashboardPageController = lazy(() => import("./controllers/customer-dashboard-page-controller"));
const CustomerProfilePageController = lazy(() => import("./controllers/customer-profile-page-controller"));
const CustomerAddressesPageController = lazy(() => import("./controllers/customer-addresses-page-controller"));
const CustomerChangePasswordPageController = lazy(() => import("./controllers/customer-change-password-page-controller"));
const CustomerNotificationsPageController = lazy(() => import("./controllers/customer-notifications-page-controller"));

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

// Loading fallback component
const PageLoadingFallback: React.FC = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "60vh",
      flexDirection: "column",
      gap: "1rem",
    }}
  >
    <div
      style={{
        width: "48px",
        height: "48px",
        border: "4px solid #f3f3f3",
        borderTop: "4px solid #3498db",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }}
    />
    <p style={{ color: "#666", fontSize: "0.9rem" }}>Memuat halaman...</p>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// Page Transition Wrapper for smooth transitions (memoized for performance)
const PageTransition: React.FC<{ children: React.ReactNode }> = React.memo(({ children }) => {
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
});
PageTransition.displayName = "PageTransition";

// Loading Progress Controller Component (OOP)
class LoadingProgressController extends Component<{}, { progress: number; isComplete: boolean }> {
  private progressInstance: LoadingProgressIndicator | null = null;
  private progressInterval: NodeJS.Timeout | null = null;
  private loadCheckInterval: NodeJS.Timeout | null = null;

  constructor(props: {}) {
    super(props);
    this.state = { progress: 0, isComplete: false };
  }

  componentDidMount(): void {
    // Simulate progress based on resource loading
    this.simulateProgress();
    this.checkPageLoad();
  }

  componentWillUnmount(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
    if (this.loadCheckInterval) {
      clearInterval(this.loadCheckInterval);
    }
  }

  private setProgressInstance = (instance: LoadingProgressIndicator | null): void => {
    this.progressInstance = instance;
  };

  private simulateProgress(): void {
    let progress = 0;
    this.progressInterval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress > 90) progress = 90; // Don't complete until page is ready
      
      if (this.progressInstance) {
        this.progressInstance.setProgress(progress);
      }
      
      if (progress >= 90) {
        if (this.progressInterval) {
          clearInterval(this.progressInterval);
        }
      }
    }, 200);
  }

  private checkPageLoad(): void {
    this.loadCheckInterval = setInterval(() => {
      if (document.readyState === "complete") {
        if (this.progressInstance) {
          this.progressInstance.complete();
        }
        this.setState({ isComplete: true });
        if (this.loadCheckInterval) {
          clearInterval(this.loadCheckInterval);
        }
      }
    }, 100);
  }

  render(): React.ReactNode {
    return <LoadingProgressIndicator ref={this.setProgressInstance} />;
  }
}

// Memoize AppLayout to prevent unnecessary re-renders
const AppLayout: React.FC = React.memo(() => {
  const loggedIn = isLoggedIn();
  const [toasts, setToasts] = React.useState<Array<{ id: string; message: string; type: "success" | "error" | "warning" | "info"; duration?: number }>>([]);
  
  // Memoize nav links calculation
  const navLinks = React.useMemo(() => {
    type NavItem = { label: string; path: string };
    let links: NavItem[] = [...NAV_LINKS.public];
    if (loggedIn) {
      const token = localStorage.getItem("authToken");
      if (token) {
        const decoded = decodeToken(token);
        if (decoded && decoded.role === "customer") {
          links = [...NAV_LINKS.customer];
        } else if (decoded && decoded.role === "admin") {
          links = [...NAV_LINKS.authenticated];
        }
      }
    }
    return links;
  }, [loggedIn]);

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
      <LoadingProgressController />
      <HeaderControllerWrapper navLinks={navLinks} />

      <PageTransition>
        <Suspense fallback={<PageLoadingFallback />}>
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
        </Suspense>
      </PageTransition>

      <Footer />
      
      <LuxuryToastContainer 
        toasts={toasts} 
        onRemove={(id) => toast.remove(id)} 
      />
    </>
  );
});
AppLayout.displayName = "AppLayout";

const App: React.FC = () => {
  return (
    <Router>
      <ErrorBoundary>
        <RouteScrollHandler />
        <ScrollToTop />
        <AppLayout />
      </ErrorBoundary>
    </Router>
  );
};

export default App;
