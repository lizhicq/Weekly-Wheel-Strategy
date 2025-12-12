import React, { useState } from 'react';
import { BacktestResult } from '../types';
import { ArrowUpRight, ArrowDownRight, RefreshCcw, DollarSign, Briefcase } from 'lucide-react';

interface BacktestTableProps {
  results: BacktestResult[];
}

const BacktestTable: React.FC<BacktestTableProps> = ({ results }) => {
  const [showAll, setShowAll] = useState(false);

  // Calculate Summary Stats
  const initialValue = results.length > 0 ? results[results.length - 1].buyAndHoldValue : 0; // Approximation based on logic
  const finalResult = results[0];
  
  if (!finalResult) return null;

  const strategyReturn = ((finalResult.totalValue - 10000) / 10000) * 100;
  const bhReturn = ((finalResult.buyAndHoldValue - 10000) / 10000) * 100;

  const displayData = showAll ? results : results.slice(0, 50);

  const formatPct = (val: number | null) => {
    if (val === null) return '-';
    const formatted = val.toFixed(2) + '%';
    if (val > 0) return <span className="text-green-600 font-medium">+{formatted}</span>;
    if (val < 0) return <span className="text-red-600 font-medium">{formatted}</span>;
    return <span className="text-gray-500">{formatted}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strategy Card */}
        <div className={`p-6 rounded-xl border ${strategyReturn >= bhReturn ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 shadow-sm'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <RefreshCcw size={20} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Wheel Strategy</h3>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-sm text-gray-500">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">${finalResult.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Return</p>
              <p className={`text-xl font-bold ${strategyReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {strategyReturn > 0 ? '+' : ''}{strategyReturn.toFixed(2)}%
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200/60 text-sm text-gray-600 space-y-1">
             <div className="flex justify-between">
                <span>Current State:</span>
                <span className="font-medium flex items-center gap-1">
                    {finalResult.positionState === 'HOLDING_STOCK' ? <Briefcase size={14}/> : <DollarSign size={14}/>}
                    {finalResult.positionState === 'HOLDING_STOCK' ? 'Holding Stock' : 'Holding Cash'}
                </span>
             </div>
             <p className="text-xs text-gray-400 mt-2">
                Rules: Sell 5% OTM Call (1% Prem). If called, Sell ATM Put (5% Prem).
             </p>
          </div>
        </div>

        {/* Benchmark Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-gray-600 rounded-lg text-white">
              <ArrowUpRight size={20} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Buy & Hold</h3>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-sm text-gray-500">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">${finalResult.buyAndHoldValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Return</p>
              <p className={`text-xl font-bold ${bhReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {bhReturn > 0 ? '+' : ''}{bhReturn.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden shadow-md sm:rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-700">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                <tr>
                <th className="px-6 py-3 whitespace-nowrap">Week Ending</th>
                <th className="px-6 py-3 text-right">Close</th>
                <th className="px-6 py-3 text-right">Stock %</th>
                <th className="px-6 py-3">Action</th>
                <th className="px-6 py-3 text-right">Strike</th>
                <th className="px-6 py-3 text-right">Prem.</th>
                <th className="px-6 py-3 text-right border-l border-gray-200 bg-gray-50/50">Next Close</th>
                <th className="px-6 py-3">Outcome</th>
                <th className="px-6 py-3 text-right bg-blue-50/50 border-l border-blue-100">Stock Tx</th>
                <th className="px-6 py-3 text-right">Strategy Val</th>
                <th className="px-6 py-3 text-right">Strat %</th>
                </tr>
            </thead>
            <tbody>
                {displayData.map((row, idx) => {
                    const isAssignment = row.outcome === 'ASSIGNED';
                    const isCallAway = isAssignment && row.action.includes('Call');
                    const isPutIn = isAssignment && row.action.includes('Put');

                    const rowClass = isCallAway 
                        ? 'bg-green-50 hover:bg-green-100' 
                        : isPutIn 
                        ? 'bg-orange-50 hover:bg-orange-100' 
                        : idx % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-slate-50 hover:bg-gray-100';

                    return (
                        <tr key={idx} className={`${rowClass} border-b border-gray-100 transition-colors`}>
                            <td className="px-6 py-4 font-medium whitespace-nowrap">{row.weekDate}</td>
                            <td className="px-6 py-4 text-right font-mono">{row.closePrice.toFixed(2)}</td>
                            <td className="px-6 py-4 text-right font-mono">{formatPct(row.stockReturnPct)}</td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${row.action.includes('Call') ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800'}`}>
                                    {row.action.split('(')[0]}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right font-mono text-gray-500">{row.strikePrice.toFixed(2)}</td>
                            <td className="px-6 py-4 text-right font-mono text-green-600">+{row.premiumReceived.toLocaleString(undefined, {maximumFractionDigits:0})}</td>
                            <td className="px-6 py-4 text-right font-mono text-gray-500 border-l border-gray-200 bg-gray-50/30">
                                {row.nextClosePrice ? row.nextClosePrice.toFixed(2) : '-'}
                            </td>
                            <td className="px-6 py-4">
                                {isAssignment ? (
                                    <span className={`font-bold flex items-center gap-1 ${isCallAway ? 'text-green-700' : 'text-orange-700'}`}>
                                        {isCallAway ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>}
                                        {row.outcomeDescription}
                                    </span>
                                ) : (
                                    <span className="text-gray-400">Expired</span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-right border-l border-blue-100/50 bg-blue-50/20">
                                {isAssignment ? (
                                    <span className={`font-mono font-bold ${isCallAway ? 'text-red-600' : 'text-blue-600'}`}>
                                        {isCallAway ? 'Sold' : 'Buy'} @ {row.strikePrice.toFixed(2)}
                                    </span>
                                ) : '-'}
                            </td>
                            <td className="px-6 py-4 text-right font-mono font-bold text-gray-900">${row.totalValue.toLocaleString(undefined, {maximumFractionDigits:0})}</td>
                            <td className="px-6 py-4 text-right font-mono">{formatPct(row.weeklyReturnPct)}</td>
                        </tr>
                    );
                })}
            </tbody>
            </table>
        </div>
      </div>
      
      {!showAll && results.length > 50 && (
          <div className="text-center">
              <button 
                  onClick={() => setShowAll(true)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
              >
                  Show All History ({results.length} Weeks)
              </button>
          </div>
      )}
    </div>
  );
};

export default BacktestTable;