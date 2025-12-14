import React, { useMemo, useState } from 'react';
import { FlaskConical, CalendarClock, Settings2 } from 'lucide-react';
import { WeeklySummary } from '../types';
import { runWheelStrategy } from '../utils';
import BacktestTable from '../components/BacktestTable';

interface BacktestPageProps {
  data: WeeklySummary[];
}

type TimeRange = '3M' | '6M' | '1Y' | '2Y' | '3Y' | 'ALL';

const BacktestPage: React.FC<BacktestPageProps> = ({ data }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('1Y');
  const [callPremiumInput, setCallPremiumInput] = useState<number>(1.0);
  const [putPremiumInput, setPutPremiumInput] = useState<number>(5.0);

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
    // Convert inputs (e.g. 1.0) to decimal (0.01)
    const callPct = callPremiumInput / 100;
    const putPct = putPremiumInput / 100;
    return runWheelStrategy(filteredData, callPct, putPct);
  }, [filteredData, callPremiumInput, putPremiumInput]);

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
                            This backtest simulates "The Wheel" options strategy. 
                            Customize your estimated premium yields below to see how they impact total returns compared to Buy & Hold.
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
                 {/* Configuration and Rules Card */}
                 <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 text-sm text-gray-700">
                    <div className="flex flex-col md:flex-row gap-8 justify-between">
                        
                        {/* Interactive Settings */}
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-900 mb-4 text-base flex items-center gap-2">
                                <Settings2 size={18} /> Strategy Parameters
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="callPrem" className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                                        Covered Call Premium %
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            id="callPrem"
                                            min="0"
                                            step="0.1"
                                            value={callPremiumInput}
                                            onChange={(e) => setCallPremiumInput(parseFloat(e.target.value) || 0)}
                                            className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-gray-900 font-medium"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">%</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Est. weekly yield when selling calls.</p>
                                </div>
                                <div>
                                    <label htmlFor="putPrem" className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                                        Secured Put Premium %
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            id="putPrem"
                                            min="0"
                                            step="0.1"
                                            value={putPremiumInput}
                                            onChange={(e) => setPutPremiumInput(parseFloat(e.target.value) || 0)}
                                            className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-gray-900 font-medium"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">%</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Est. weekly yield when selling puts.</p>
                                </div>
                            </div>
                        </div>

                        {/* Static Rules Summary */}
                        <div className="flex-1 md:border-l md:border-blue-200 md:pl-8">
                             <h3 className="font-bold text-gray-900 mb-4 text-base">Simulation Logic</h3>
                            <ul className="list-disc list-inside space-y-2">
                                <li><strong>Initial Capital:</strong> $10,000</li>
                                <li><strong>Covered Call:</strong> Sell 5% OTM (+5%), Collect <strong>{callPremiumInput}%</strong> Premium</li>
                                <li><strong>Cash-Secured Put:</strong> Sell ATM (0%), Collect <strong>{putPremiumInput}%</strong> Premium</li>
                                <li><strong>Decision:</strong> Options sold on last trading day of week.</li>
                            </ul>
                        </div>
                    </div>
                 </div>

                <BacktestTable results={backtestResults} />
            </div>
        </div>
    </div>
  );
};

export default BacktestPage;