import React, { useMemo } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CSV_DATA } from './constants';
import { parseCSV, calculateWeeklyMetrics } from './utils';
import Navbar from './components/Navbar';
import AnalysisPage from './pages/AnalysisPage';
import BacktestPage from './pages/BacktestPage';
import DailyDataPage from './pages/DailyDataPage';

const App: React.FC = () => {
  // Process data once on mount/load
  const dailyData = useMemo(() => {
    return parseCSV(CSV_DATA);
  }, []);

  const fullWeeklyData = useMemo(() => {
    return calculateWeeklyMetrics(dailyData);
  }, [dailyData]);

  const recentWeeklyData = useMemo(() => {
    // Limit to recent 1 year (approx 52 weeks) for the weekly analysis view
    return fullWeeklyData.slice(0, 52);
  }, [fullWeeklyData]);

  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-50 font-sans text-gray-900">
        <Navbar />
        
        <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<AnalysisPage data={recentWeeklyData} />} />
            <Route path="/daily" element={<DailyDataPage data={dailyData} />} />
            <Route path="/backtest" element={<BacktestPage data={fullWeeklyData} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        <footer className="text-center text-gray-400 text-sm py-8 border-t border-gray-200 mt-8">
          <p>© Generated Report based on provided CSV data.</p>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;