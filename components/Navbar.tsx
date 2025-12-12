import React from 'react';
import { NavLink } from 'react-router-dom';
import { TrendingUp, FlaskConical, CalendarDays } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center mr-8">
               <span className="font-bold text-xl text-gray-900 tracking-tight">StockAnalyzer</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                    isActive 
                      ? 'border-blue-500 text-gray-900' 
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`
                }
              >
                <TrendingUp size={18} className="mr-2" />
                Weekly Performance
              </NavLink>
              <NavLink 
                to="/daily" 
                className={({ isActive }) => 
                  `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                    isActive 
                      ? 'border-indigo-500 text-gray-900' 
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`
                }
              >
                <CalendarDays size={18} className="mr-2" />
                Daily Data
              </NavLink>
              <NavLink 
                to="/backtest" 
                className={({ isActive }) => 
                  `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                    isActive 
                      ? 'border-purple-500 text-gray-900' 
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`
                }
              >
                <FlaskConical size={18} className="mr-2" />
                Strategy Backtest
              </NavLink>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile Menu Placeholder - simplistic for now */}
      <div className="sm:hidden border-t border-gray-200 flex justify-around p-2 bg-gray-50">
          <NavLink to="/" className={({ isActive }) => `p-2 rounded ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}>Weekly</NavLink>
          <NavLink to="/daily" className={({ isActive }) => `p-2 rounded ${isActive ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600'}`}>Daily</NavLink>
          <NavLink to="/backtest" className={({ isActive }) => `p-2 rounded ${isActive ? 'bg-purple-100 text-purple-700' : 'text-gray-600'}`}>Backtest</NavLink>
      </div>
    </nav>
  );
};

export default Navbar;