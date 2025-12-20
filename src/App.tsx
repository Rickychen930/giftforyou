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
import BouquetDetailController from "./controllers/bouquet-catalog-page-controller";
import LoginController from "./controllers/login-page-controller";
import DashboardController from "./controllers/dashboard-page-controller";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";

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

  // ✅ Hide header on login page
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
        <Route path="/collection" element={<BouquetDetailController />} />
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

        {/* fallback */}
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
