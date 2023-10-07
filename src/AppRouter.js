import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './DashboardPage';
import StatsCharts from './StatsChartsPage';
import InsertValues from './InsertPage';
import CheckPrices from './CheckPricesPage';
import Leaderboard from './LeaderboardPage';
import Knowledge from './KnowledgePage';
import Info from './InfoPage';
import SignIn from './SignInPage';
import LandingPage from './LandingPage';
import SignUp from './SignUpPage';

function AppRouter() {
  return (
    <>
        <Routes>
            <Route path="/" exact element={<LandingPage />} />
            <Route path="/sign-up" exact element={<SignUp />} />
            <Route path="/sign-in" exact element={<SignIn />} />
            <Route path="/dashboard" exact element={<Dashboard />} />
            <Route path="/your-charts" element={<StatsCharts />} />
            <Route path="/insert-values" element={<InsertValues />} />
            <Route path="/check-prices" element={<CheckPrices />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/knowledge" element={<Knowledge />} />
            <Route path="/info" element={<Info/>} />
            {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
    </>
  );
}

export default AppRouter;
