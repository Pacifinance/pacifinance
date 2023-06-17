import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { Route, Router } from 'react-router-dom';
import Dashboard from './DashboardPage';
import YourCharts from './ChartsPage';
import InsertValues from './InsertPage';
import CheckPrices from './CheckPricesPage';
import Leaderboard from './LeaderboardPage';
import Knowledge from './KnowledgePage';
import Info from './InfoPage';
import Login from './LoginPage';
//import NotFound from './NotFound';

function AppRouter() {
  return (
    <>
        <Routes>
            <Route path="/dashboard" exact element={<Dashboard />} />
            <Route path="/" exact element={<Login />} />
            <Route path="/your-charts" element={<YourCharts />} />
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

// function AppRouter() {
//     return (
//       <>
//           <Routes>
//               <Route path="/" exact component={Dashboard} />
//               <Route path="/your-charts" component={YourCharts} />
//               <Route path="/insert-values" component={InsertValues} />
//               <Route path="/check-prices" component={CheckPrices} />
//               <Route path="/leaderboard" component={Leaderboard} />
//               <Route path="/knowledge" component={Knowledge} />
//               <Route path="/info" component={Info} />
//               <Route path="*" element={<NotFound />} />
//           </Routes>
//       </>
//     );
//   }

export default AppRouter;
