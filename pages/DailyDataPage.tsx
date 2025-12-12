import React, { useState } from 'react';
import { CalendarDays, BarChart3, Clock, PlusCircle, Save, RotateCcw } from 'lucide-react';
import { DailyData } from '../types';
import DailyTable from '../components/DailyTable';

interface DailyDataPageProps {
  data: DailyData[];
  onAddData?: (date: string, price: number) => void;
  onResetData?: () => void;
}

const DailyDataPage: React.FC<DailyDataPageProps> = ({ data, onAddData, onResetData }) => {
  // Sort data for display stats range (ensure Newest -> Oldest for finding range)
  const sortedData = [...data].sort((a, b) => b.date.localeCompare(a.date));
  
  const [inputDate, setInputDate] = useState('');
  const [inputPrice, setInputPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddData) return;
    
    setMessage(null);

    if (!inputDate || !inputPrice) {
        setMessage({ text: 'Please fill in both Date and Price', type: 'error' });
        return;
    }

    const price = parseFloat(inputPrice);
    if (isNaN(price) || price <= 0) {
        setMessage({ text: 'Please enter a valid price', type: 'error' });
        return;
    }

    setIsSubmitting(true);
    
    // Simulate slight delay for effect or just process
    try {
        onAddData(inputDate, price);
        setMessage({ text: `Successfully saved data for ${inputDate}`, type: 'success' });
        setInputDate('');
        setInputPrice('');
    } catch (err) {
        setMessage({ text: 'Failed to save data', type: 'error' });
    } finally {
        setIsSubmitting(false);
        // Clear success message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
    }
  };
  
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg text-indigo-700">
                      <CalendarDays size={24} />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">Daily Market Data</h1>
              </div>
              {onResetData && (
                  <button 
                    onClick={onResetData}
                    className="text-xs text-gray-400 hover:text-red-600 flex items-center gap-1 transition-colors"
                    title="Clear manually added data and reset to default"
                  >
                      <RotateCcw size={14} /> Reset Data to Default
                  </button>
              )}
          </div>
          <p className="text-gray-600 max-w-2xl leading-relaxed mb-6">
            Comprehensive history of daily closing prices and day-over-day percentage changes. 
            Data added here is saved to your browser's local storage.
          </p>

          {/* Add Data Form */}
          {onAddData && (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <PlusCircle size={16} /> Add / Update Record
                  </h3>
                  <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
                      <div className="w-full sm:w-auto">
                          <label htmlFor="date" className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                          <input 
                              type="date" 
                              id="date" 
                              value={inputDate}
                              onChange={(e) => setInputDate(e.target.value)}
                              className="w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                              required 
                          />
                      </div>
                      <div className="w-full sm:w-auto">
                          <label htmlFor="price" className="block text-xs font-medium text-gray-500 mb-1">Close Price</label>
                          <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                              <input 
                                  type="number" 
                                  id="price" 
                                  step="0.01" 
                                  min="0"
                                  value={inputPrice}
                                  onChange={(e) => setInputPrice(e.target.value)}
                                  className="w-full sm:w-40 pl-7 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                  placeholder="0.00"
                                  required
                              />
                          </div>
                      </div>
                      <button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                          <Save size={16} />
                          {isSubmitting ? 'Saving...' : 'Save Entry'}
                      </button>
                  </form>
                  {message && (
                      <div className={`mt-3 text-sm px-3 py-2 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                          {message.text}
                      </div>
                  )}
              </div>
          )}
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