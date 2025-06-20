import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { UserContext } from './contexts/UserContext';
import Dashboard from './pages/DashboardPage';
import StatsCharts from './pages/StatsChartsPage';
import InsertValues from './pages/InsertPage';
import CheckPrices from './pages/CheckPricesPage';
import Leaderboard from './pages/LeaderboardPage';
import Knowledge from './pages/KnowledgePage';
import Info from './pages/InfoPage';
import SignInPage from './pages/SignInPage';
import LandingPage from './pages/LandingPage';
import SignUpPage from './pages/SignUpPage';
import AuthPage from './pages/AuthPage';
import FAQPage from './pages/FAQPage';
import PricingPage from './pages/PricingPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import SitemapPage from './pages/SitemapPage';
import CookiePolicyPage from './pages/CookiePolicyPage';
import DisclaimerPage from './pages/DisclaimerPage';
import ContactPage from './pages/ContactPage';
import AccountPage from './pages/AccountPage';
import SettingsPage from './pages/SettingsPage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useContext(UserContext);
  return isAuthenticated ? children : <Navigate to="/auth" replace />;
};

// Public Route Component (redirects to dashboard if already authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useContext(UserContext);
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};


function AppRouter() {
  const { handleSetIsUpdated, isAuthenticated, setIsAuthenticated, userData, setUserData } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    var _mtm = window._mtm = window._mtm || [];
    _mtm.push({'mtm.startTime': (new Date().getTime()), 'event': 'mtm.Start'});
    var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
    g.async=true; g.src='https://pacifinance.com:8000/js/container_fkJBXVc1.js'; s.parentNode.insertBefore(g,s);
  }, [])

  // Chiamata per caricare i dati dell'utente
  const loadUserData = () => {
    handleSetIsUpdated(false); // Forza il re-render di UserProvider
  };

  useEffect(() => {
    loadUserData(); // Initial load of user data
  }, []);

  // Verify if the user is already authenticated
  // useEffect(() => {
  //   const savedIsAuthenticated = localStorage.getItem('isAuthenticated');
  //   if (savedIsAuthenticated) {
  //     // const savedUserData = JSON.parse(localStorage.getItem('userData'));
  //     const savedExpirationDate = localStorage.getItem('expirationDate');
  //     if (savedExpirationDate && new Date(savedExpirationDate) > new Date()) { //savedUserData &&
  //       setIsAuthenticated(true);
  //       // setUserData(savedUserData);
  //     } else {
  //       // if the token is expired, remove the data
  //       setIsAuthenticated(false);
  //       // setUserData(null);
  //       localStorage.removeItem('isAuthenticated');
  //       // localStorage.removeItem('userData');
  //       localStorage.removeItem('expirationDate');
  //     }
  //   }
  // }, []);

  // // Reindirect the user to the landing page if not authenticated
  // const AuthenticatedRoute = ({ element, ...rest }) => {
  //   return isAuthenticated ? element : navigate("/", { replace: true }); 
  // };

  // // Reindirect the user to the dashboard if authenticated
  // const UnauthenticatedRoute = ({ element, ...rest }) => {
  //   return !isAuthenticated ? element : navigate("/dashboard", { replace: true }); 
  // };

  return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
            <Route path="/signin" element={<PublicRoute><SignInPage /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><SignUpPage /></PublicRoute>} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms-of-service" element={<TermsOfServicePage />} />
            <Route path="/cookie-policy" element={<CookiePolicyPage />} />
            <Route path="/disclaimer" element={<DisclaimerPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/sitemap" element={<SitemapPage />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/charts-statistics" element={<ProtectedRoute><StatsCharts /></ProtectedRoute>} />
            <Route path="/insert-values" element={<ProtectedRoute><InsertValues /></ProtectedRoute>} />
            <Route path="/check-prices" element={<ProtectedRoute><CheckPrices /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="/knowledge" element={<ProtectedRoute><Knowledge /></ProtectedRoute>} />
            <Route path="/info" element={<ProtectedRoute><Info /></ProtectedRoute>} />
            <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
  );
}

export default AppRouter;