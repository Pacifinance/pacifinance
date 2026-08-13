import React, { useEffect, useContext, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  Navigate,
  useLocation,
  useParams,
} from "react-router-dom";
import { UserContext } from "./contexts/UserContext";
import { LanguageContext } from "./contexts/LanguageContext";
import { useAuth } from "./hooks/useAuth";
import { useAuthenticatedPreloading, usePublicPreloading } from "./hooks/useSimplePreloading";
import { addLanguageToPath, availableLanguages, getInitialLanguage } from "./utils/i18nRouting";
import { useGamification } from "./hooks/useGamification";
import { useAchievementNotifications } from "./hooks/useAchievementNotifications";
import { getIsAdmin } from "./utils/userDataSelectors";

// Simple, reliable loading component
const SimpleLoader = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    fontSize: '1rem',
    color: '#666'
  }}>
    Caricamento...
  </div>
);

// Direct imports for critical pages (always available)
import Dashboard from "./pages/DashboardPage";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";

// Lazy loading for the app's main pages (loaded when needed)
const StatsCharts = React.lazy(() => import("./pages/StatsChartsPage"));
const InsertValues = React.lazy(() => import("./pages/InsertPage"));
const ComparisonPage = React.lazy(() => import("./pages/ComparisonPage"));

// Lazy loading for utility pages (rarely used)
const MarketPricesPage = React.lazy(() => import("./pages/MarketPricesPage"));
const Knowledge = React.lazy(() => import("./pages/KnowledgePage"));
const Info = React.lazy(() => import("./pages/InfoPage"));
const AccountPage = React.lazy(() => import("./pages/ProfilePage"));
const SettingsPage = React.lazy(() => import("./pages/SettingsPage"));
const GoalsSettingsPage = React.lazy(() => import("./pages/GoalsAndLimitsPage"));
const AdminPriceReviewPage = React.lazy(() => import("./pages/AdminPriceReviewPage"));
const InvestmentAssetPage = React.lazy(() => import("./pages/InvestmentAssetPage"));

// Lazy loading for legal/info pages (rarely visited)
const FAQPage = React.lazy(() => import("./pages/FAQPage"));
const PricingPage = React.lazy(() => import("./pages/PricingPage"));
const PrivacyPolicyPage = React.lazy(() => import("./pages/PrivacyPolicyPage"));
const TermsOfServicePage = React.lazy(() => import("./pages/TermsOfServicePage"));
const SitemapPage = React.lazy(() => import("./pages/SitemapPage"));
const CookiePolicyPage = React.lazy(() => import("./pages/CookiePolicyPage"));
const DisclaimerPage = React.lazy(() => import("./pages/DisclaimerPage"));
const RoadmapPage = React.lazy(() => import("./pages/RoadmapPage"));
const ContributePage = React.lazy(() => import("./pages/ContributePage"));
const NotFoundPage = React.lazy(() => import("./pages/NotFoundPage"));

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const auth = useAuth();
  const { language, translations } = useContext(LanguageContext);
  
  // Global achievement notifications — fires on any authenticated page
  const gamification = useGamification(auth.userData);
  useAchievementNotifications(gamification, translations);
  
  if (!auth.isAuthenticated) {
    // Redirect to landing page (where the user can login again)
    return <Navigate to={addLanguageToPath("/", language)} replace />;
  }
  
  return children;
};

// Admin Route Component - protected, and additionally requires isAdmin (community price moderation).
// The frontend guard is convenience only - every admin-gated API route re-checks
// db.users.isAdmin server-side, so this never has to be the actual security boundary.
const AdminRoute = ({ children }) => {
  const auth = useAuth();
  const { language } = useContext(LanguageContext);

  if (!auth.isAuthenticated) {
    return <Navigate to={addLanguageToPath("/", language)} replace />;
  }

  if (!getIsAdmin(auth.userData)) {
    return <Navigate to={addLanguageToPath("/dashboard", language)} replace />;
  }

  return children;
};

// Public Route Component (redirects to dashboard if already authenticated)
const PublicRoute = ({ children }) => {
  const auth = useAuth();
  const { language } = useContext(LanguageContext);
  
  if (auth.isAuthenticated) {
    return <Navigate to={addLanguageToPath("/dashboard", language)} replace />;
  }
  
  return children;
};

// Language Redirect Component - redirects root to language-prefixed URL
const LanguageRedirect = () => {
  const location = useLocation();
  useContext(LanguageContext);
  
  // Get initial language from URL, localStorage, or browser
  const initialLang = getInitialLanguage(location.pathname);
  
  // If we're at the root, redirect to language-prefixed root
  if (location.pathname === '/') {
    return <Navigate to={addLanguageToPath("/", initialLang)} replace />;
  }
  
  return <Navigate to={addLanguageToPath(location.pathname, initialLang)} replace />;
};

function AppRouter() {
  const auth = useAuth();
  
  // Extract the properties from our unified hook
  const { isAuthenticated, handleSetIsUpdated } = auth;

  // Enable simple, safe preloading
  useAuthenticatedPreloading(isAuthenticated);
  usePublicPreloading();

  useEffect(() => {
    handleSetIsUpdated(false); // Initial load of user data
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <Suspense fallback={<SimpleLoader />}>
      <Routes>
        {/* Root redirect to language-prefixed URL */}
        <Route path="/" element={<LanguageRedirect />} />
        
        {/* Language-prefixed routes */}
        <Route path="/:lang/*" element={<LanguageRoutes />} />
        
        {/* Catch all route - redirect to language root */}
        <Route path="*" element={<LanguageRedirect />} />
      </Routes>
    </Suspense>
  );
}

// Component that handles all language-prefixed routes
const LanguageRoutes = () => {
  const { lang } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage } = useContext(LanguageContext);
  
  // Scroll to top on every real page change — without this, navigating from
  // deep in a long page (e.g. the footer) lands on the new page still
  // scrolled down, which reads as if nothing happened. Skipped when the
  // destination carries a hash (e.g. landing-page section anchors), which
  // handle their own scroll target.
  useEffect(() => {
    if (!location.hash) {
      window.scrollTo(0, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Validate language parameter
  useEffect(() => {
    if (!availableLanguages.includes(lang)) {
      // Invalid language, redirect to valid one
      const validLang = getInitialLanguage(location.pathname);
      navigate(addLanguageToPath(location.pathname.replace(`/${lang}`, ''), validLang), { replace: true });
      return;
    }
    
    // Sync URL language with context
    if (lang !== language) {
      setLanguage(lang);
    }
  }, [lang, language, setLanguage, navigate, location]);
  
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/auth"
        element={
          <PublicRoute>
            <AuthPage />
          </PublicRoute>
        }
      />

      <Route path="/faq" element={<FAQPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="/terms-of-service" element={<TermsOfServicePage />} />
      <Route path="/cookie-policy" element={<CookiePolicyPage />} />
      <Route path="/disclaimer" element={<DisclaimerPage />} />
      <Route path="/roadmap" element={<RoadmapPage />} />
      <Route path="/contribute" element={<ContributePage />} />
      <Route path="/sitemap" element={<SitemapPage />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/charts-statistics"
        element={
          <ProtectedRoute>
            <StatsCharts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/insert-values"
        element={
          <ProtectedRoute>
            <InsertValues />
          </ProtectedRoute>
        }
      />
      <Route
        path="/market-prices"
        element={
          <ProtectedRoute>
            <MarketPricesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/comparison"
        element={
          <ProtectedRoute>
            <ComparisonPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/knowledge"
        element={
          <ProtectedRoute>
            <Knowledge />
          </ProtectedRoute>
        }
      />
      <Route
        path="/info"
        element={
          <ProtectedRoute>
            <Info />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <AccountPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/goals-limits"
        element={
          <ProtectedRoute>
            <GoalsSettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/price-review"
        element={
          <AdminRoute>
            <AdminPriceReviewPage />
          </AdminRoute>
        }
      />
      <Route
        path="/investments/:assetKey"
        element={
          <ProtectedRoute>
            <InvestmentAssetPage />
          </ProtectedRoute>
        }
      />

      {/* Catch all route within language — a real 404 page, not a silent
          redirect to home (see NotFoundPage.tsx for why this changed). */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRouter;
