import React, { useMemo, useState } from 'react';
import { FlaskConical, CalendarClock } from 'lucide-react';
import { WeeklySummary } from '../types';
import { runWheelStrategy } from '../utils';
import BacktestTable from '../components/BacktestTable';

interface BacktestPageProps {
  data: WeeklySummary[];
}

type TimeRange = '3M' | '6M' | '1Y' | '2Y' | '3Y' | 'ALL';

const BacktestPage: React.FC<BacktestPageProps> = ({ data }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('1Y');

  const filteredData = useMemo(() => {
    // data is typically sorted Newest -> Oldest in the app
    let weeks = data.length;
    switch(timeRange) {
        case '3M': weeks = 13; break;
        case '6M': weeks = 26; break;
        case '1Y': weeks = 52; break;
        case '2Y': weeks = 104; break;
        case '3Y': weeks = 156; break;
        case 'ALL': default: weeks = data.length; break;
    }
    return data.slice(0, weeks);
  }, [data, timeRange]);

  const backtestResults = useMemo(() => {
    return runWheelStrategy(filteredData);
  }, [filteredData]);

  const ranges: { label: string; value: TimeRange }[] = [
    { label: '3 Months', value: '3M' },
    { label: '6 Months', value: '6M' },
    { label: '1 Year', value: '1Y' },
    { label: '2 Years', value: '2Y' },
    { label: '3 Years', value: '3Y' },
    { label: 'Max', value: 'ALL' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 pb-4 md:pb-0 mb-2">
                        <div className="p-2 bg-purple-100 rounded-lg text-purple-700">
                            <FlaskConical size={24} />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">The Wheel Strategy Backtest</h1>
                    </div>
                    
                    <div className="text-sm text-gray-600 leading-relaxed max-w-2xl">
                        <p>
                            This backtest simulates "The Wheel" options strategy over the selected period. 
                            It compares the performance of actively selling options against a static Buy & Hold strategy.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                        <CalendarClock size={14} /> Time Horizon
                    </span>
                    <div className="inline-flex bg-gray-100 p-1 rounded-lg">
                        {ranges.map((range) => (
                            <button
                                key={range.value}
                                onClick={() => setTimeRange(range.value)}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                                    timeRange === range.value
                                        ? 'bg-white text-purple-700 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
                                }`}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-3 space-y-6">
                 <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 text-sm text-gray-700">
                    <h3 className="font-bold text-gray-900 mb-3 text-base">Simulation Rules</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ul className="list-disc list-inside space-y-2">
                            <li><strong>Initial Capital:</strong> $10,000</li>
                            <li><strong>Timeframe:</strong> {timeRange === 'ALL' ? 'Max History' : ranges.find(r => r.value === timeRange)?.label} ({filteredData.length} Weeks)</li>
                            <li><strong>Decision Day:</strong> Last trading day of the week</li>
                        </ul>
                        <ul className="list-disc list-inside space-y-2">
                            <li><strong>Covered Call:</strong> Sell 5% OTM (+5%), Collect 1% Premium</li>
                            <li><strong>Cash-Secured Put:</strong> Sell ATM (0%), Collect 5% Premium</li>
                            <li><strong>Outcome:</strong> Checked against next week's closing price</li>
                        </ul>
                    </div>
                 </div>

                <BacktestTable results={backtestResults} />
            </div>
        </div>
    </div>
  );
};

export default BacktestPage;