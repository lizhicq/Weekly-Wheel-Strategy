import React, { useMemo, useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CSV_DATA } from './constants';
import { parseCSV, calculateWeeklyMetrics, processRawData } from './utils';
import Navbar from './components/Navbar';
import AnalysisPage from './pages/AnalysisPage';
import BacktestPage from './pages/BacktestPage';
import DailyDataPage from './pages/DailyDataPage';
import { DailyData } from './types';

const STORAGE_KEY = 'stock_analyzer_data_v1';

const App: React.FC = () => {
  // Initialize state from LocalStorage if available, otherwise use hardcoded CSV
  const [dailyData, setDailyData] = useState<DailyData[]>(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        return JSON.parse(savedData);
      }
    } catch (e) {
      console.error("Failed to load from local storage", e);
    }
    return parseCSV(CSV_DATA);
  });

  // Save to LocalStorage whenever data changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dailyData));
  }, [dailyData]);

  const fullWeeklyData = useMemo(() => {
    return calculateWeeklyMetrics(dailyData);
  }, [dailyData]);

  const recentWeeklyData = useMemo(() => {
    // Limit to recent 1 year (approx 52 weeks) for the weekly analysis view
    return fullWeeklyData.slice(0, 52);
  }, [fullWeeklyData]);

  const handleAddData = (date: string, price: number) => {
    setDailyData(prev => {
        // Create raw list from current processed data
        const raw = prev.map(d => ({ date: d.date, price: d.price }));
        
        // Check for existing date to update, otherwise add
        const index = raw.findIndex(d => d.date === date);
        if (index >= 0) {
            raw[index].price = price;
        } else {
            raw.push({ date, price });
        }
        
        // Re-process to ensure sort order and calculate changes
        return processRawData(raw);
    });
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure? This will delete all your manually added data and reset to the original CSV.')) {
      const initialData = parseCSV(CSV_DATA);
      setDailyData(initialData);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-50 font-sans text-gray-900">
        <Navbar />
        
        <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<AnalysisPage data={recentWeeklyData} />} />
            <Route path="/daily" element={<DailyDataPage data={dailyData} onAddData={handleAddData} onResetData={handleResetData} />} />
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