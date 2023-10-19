import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './DashboardPage';
import StatsCharts from './StatsChartsPage';
import InsertValues from './InsertPage';
import CheckPrices from './CheckPricesPage';
import Leaderboard from './LeaderboardPage';
import Knowledge from './KnowledgePage';
import Info from './InfoPage';
// import SignIn from './SignInPage';
import LandingPage from './LandingPage';
// import SignUp from './SignUpPage';

// <!-- Matomo Tag Manager -->
// <script>
//   var _mtm = window._mtm = window._mtm || [];
//   _mtm.push({'mtm.startTime': (new Date().getTime()), 'event': 'mtm.Start'});
//   (function() {
//     var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
//     g.async=true; g.src='https://cdn.matomo.cloud/pacifinance.matomo.cloud/container_geUS8Fsk.js'; s.parentNode.insertBefore(g,s);
//   })();
// </script>
// <!-- End Matomo Tag Manager -->


function AppRouter() {

  // Matomo Tag Manager
  React.useEffect(() => {
    var _mtm = window._mtm = window._mtm || [];
    _mtm.push({'mtm.startTime': (new Date().getTime()), 'event': 'mtm.Start'});
    var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
    g.async=true; g.src='{container_geUS8Fsk.js}'; s.parentNode.insertBefore(g,s);
}, []);

  return (
        <Routes>
            <Route path="/" exact element={<LandingPage />} />
            <Route path="/dashboard" exact element={<Dashboard />} />
            <Route path="/your-charts" element={<StatsCharts />} />
            <Route path="/insert-values" element={<InsertValues />} />
            <Route path="/check-prices" element={<CheckPrices />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/knowledge" element={<Knowledge />} />
            <Route path="/info" element={<Info/>} />
            {/* <Route path="/sign-up" exact element={<SignUp />} />
            <Route path="/sign-in" exact element={<SignIn />} /> */}
            {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
  );
}

export default AppRouter;
