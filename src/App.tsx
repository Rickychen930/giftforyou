import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Layout
import Footer from "./view/footer";

// Pages (Controllers)
import HomePage from "./view/home-page";
import AboutUsController from "./controllers/about-us-controller";
import BouquetDetailController from "./controllers/bouquet-detail-page-controller";
import LoginController from "./controllers/login-page-controller";
import DashboardController from "./controllers/dashboard-page-controller";
import Header from "./view/header";

// Simulated auth state (replace with real auth logic)
const isLoggedIn = false;

const navLinks = isLoggedIn
  ? [
      { label: "Home", path: "/" },
      { label: "Dashboard", path: "/dashboard" },
      { label: "Logout", path: "/logout" },
    ]
  : [
      { label: "Home", path: "/" },
      { label: "About Us", path: "/about" },
      { label: "Our Collection", path: "/collection" },
      { label: "Login", path: "/login" },
    ];

const App: React.FC = () => {
  return (
    <Router>
      <Header navLinks={navLinks} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutUsController />} />
        <Route path="/collection" element={<BouquetDetailController />} />
        <Route path="/login" element={<LoginController />} />
        <Route path="/dashboard" element={<DashboardController />} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
