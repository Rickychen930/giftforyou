import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Header from "./view/header";
import Footer from "./view/footer";

import HomePage from "./view/home-page";
import BouquetCatalogController from "./controllers/bouquet-catalog-page-controller";
import LoginController from "./controllers/login-page-controller";
import DashboardController from "./controllers/dashboard-page-controller";
import BouquetDetailController from "./controllers/bouquet-detail-controller";

const isLoggedIn = (): boolean => {
  return Boolean(localStorage.getItem("authToken"));
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return isLoggedIn() ? <>{children}</> : <Navigate to="/login" replace />;
};

const AppLayout: React.FC = () => {
  const location = useLocation();
  const loggedIn = isLoggedIn();

  const hideHeader = location.pathname === "/login";

  const navLinks = loggedIn
    ? [
        { label: "Home", path: "/" },
        { label: "Our Collection", path: "/collection" },
        { label: "Dashboard", path: "/dashboard" },
      ]
    : [
        { label: "Home", path: "/" },
        { label: "Our Collection", path: "/collection" },
        { label: "Login", path: "/login" },
      ];

  return (
    <>
      {!hideHeader && <Header navLinks={navLinks} />}

      <Routes>
        <Route path="/" element={<HomePage />} />

        {/* ✅ Catalog */}
        <Route path="/collection" element={<BouquetCatalogController />} />

        {/* ✅ Detail */}
        <Route path="/bouquet/:id" element={<BouquetDetailController />} />

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
      <AppLayout />
    </Router>
  );
};

export default App;
