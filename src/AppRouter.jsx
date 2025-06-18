import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
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
import FAQPage from './pages/FAQPage';
import PricingPage from './pages/PricingPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import SitemapPage from './pages/SitemapPage';
import CookiePolicyPage from './pages/CookiePolicyPage';
import DisclaimerPage from './pages/DisclaimerPage';


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
            <Route path="/" exact element={<LandingPage />} />
            <Route path="/dashboard" exact element={<Dashboard />} />
            {/* <UnauthenticatedRoute path="/" element={<LandingPage />} />
            <AuthenticatedRoute path="/dashboard" element={<Dashboard />} /> */}
            <Route path="/your-charts" element={<StatsCharts />} />
            <Route path="/insert-values" element={<InsertValues />} />
            <Route path="/check-prices" element={<CheckPrices />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/knowledge" element={<Knowledge />} />
            <Route path="/info" element={<Info/>} />
            {/* <Route path="/sign-up" exact element={<SignUp />} />
            <Route path="/sign-in" exact element={<SignIn />} /> */}
            {/* <Route path="*" element={<NotFound />} /> */}
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms-of-service" element={<TermsOfServicePage />} />
            <Route path="/cookie-policy" element={<CookiePolicyPage />} />
            <Route path="/disclaimer" element={<DisclaimerPage />} />
            <Route path="/contact" element={<FAQPage />} />
            <Route path="/sitemap" element={<SitemapPage />} />
        </Routes>
  );
}

export default AppRouter;