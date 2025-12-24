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
import ErrorBoundary from "./components/error-boundary";
import ScrollToTop from "./components/scroll-to-top";
import { trackPageview } from "./services/analytics.service";

const isLoggedIn = (): boolean => {
  return Boolean(localStorage.getItem("authToken"));
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

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/collection" element={<BouquetCatalogRoute />} />
        <Route path="/bouquet/:id" element={<BouquetDetailController />} />
        <Route path="/search" element={<SearchRedirect />} />
        <Route path="/cart" element={<Navigate to="/collection" replace />} />
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
