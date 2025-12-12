import React from 'react';
import { TrendingUp, Calendar, Info } from 'lucide-react';
import { WeeklySummary } from '../types';
import StockTable from '../components/StockTable';

interface AnalysisPageProps {
  data: WeeklySummary[];
}

const AnalysisPage: React.FC<AnalysisPageProps> = ({ data }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <TrendingUp className="text-blue-600" size={32} />
                Weekly Stock Performance
              </h1>
              <p className="mt-2 text-gray-600 max-w-2xl leading-relaxed">
                Analysis of closing prices for the last trading day of each week. 
                Metrics compare performance against the previous trading day, two trading days prior, and the previous week's close.
              </p>
            </div>
            <div className="text-right hidden sm:block">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                <Calendar size={18} />
                {data.length > 0 ? `${data.length} Weeks Analyzed` : 'Loading...'}
              </div>
            </div>
          </div>
        </div>

        {/* Info Cards (Data Range) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
             <div className="flex items-center gap-2 text-gray-500 mb-1 text-sm font-medium">
                <Info size={16} /> Data Range
             </div>
             <div className="text-lg font-semibold text-gray-900">
               {data.length > 0 ? `${data[data.length - 1].weekEndDate} to ${data[0].weekEndDate}` : '-'}
             </div>
           </div>
        </div>

        {/* Main Stock Table */}
        <StockTable data={data} />
    </div>
  );
};

export default AnalysisPage;