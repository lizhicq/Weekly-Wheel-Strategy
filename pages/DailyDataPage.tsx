import React from 'react';
import { CalendarDays, BarChart3, Clock } from 'lucide-react';
import { DailyData } from '../types';
import DailyTable from '../components/DailyTable';

interface DailyDataPageProps {
  data: DailyData[];
}

const DailyDataPage: React.FC<DailyDataPageProps> = ({ data }) => {
  // Sort data for display stats range (ensure Newest -> Oldest)
  const sortedData = [...data].sort((a, b) => b.date.localeCompare(a.date));
  
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-700">
                    <CalendarDays size={24} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Daily Market Data</h1>
          </div>
          <p className="text-gray-600 max-w-2xl leading-relaxed">
            Comprehensive history of daily closing prices and day-over-day percentage changes.
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
             <div className="flex items-center gap-2 text-gray-500 mb-1 text-sm font-medium">
                <BarChart3 size={16} /> Total Trading Days
             </div>
             <div className="text-2xl font-bold text-gray-900">
               {data.length}
             </div>
           </div>
           
           <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 col-span-1 lg:col-span-2">
             <div className="flex items-center gap-2 text-gray-500 mb-1 text-sm font-medium">
                <Clock size={16} /> Historical Range
             </div>
             <div className="text-xl font-semibold text-gray-900">
               {sortedData.length > 0 ? `${sortedData[sortedData.length - 1].date} — ${sortedData[0].date}` : '-'}
             </div>
           </div>
        </div>

        {/* Table */}
        <DailyTable data={data} />
    </div>
  );
};

export default DailyDataPage;