import React, { useState, useMemo } from 'react';
import { WeeklySummary, SortKey, SortDirection } from '../types';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface StockTableProps {
  data: WeeklySummary[];
}

const StockTable: React.FC<StockTableProps> = ({ data }) => {
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({
    key: 'weekEndDate',
    direction: 'desc',
  });

  const sortedData = useMemo(() => {
    const sortableItems = [...data];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === null && bValue === null) return 0;
        if (aValue === null) return 1;
        if (bValue === null) return -1;

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: SortKey) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={14} className="ml-1 text-gray-400" />;
    if (sortConfig.direction === 'asc') return <ArrowUp size={14} className="ml-1 text-blue-600" />;
    return <ArrowDown size={14} className="ml-1 text-blue-600" />;
  };

  const formatPct = (val: number | null) => {
    if (val === null) return '-';
    const formatted = val.toFixed(2) + '%';
    if (val > 0) return <span className="text-green-600 font-medium">+{formatted}</span>;
    if (val < 0) return <span className="text-red-600 font-medium">{formatted}</span>;
    return <span className="text-gray-500">{formatted}</span>;
  };

  const formatPrice = (val: number) => {
    return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="overflow-x-auto shadow-md sm:rounded-lg border border-gray-200">
      <table className="w-full text-sm text-left text-gray-700">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
          <tr>
            <th scope="col" className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => requestSort('weekEndDate')}>
              <div className="flex items-center">
                Date (Week End)
                {getSortIcon('weekEndDate')}
              </div>
            </th>
            <th scope="col" className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors text-right" onClick={() => requestSort('weekEndPrice')}>
              <div className="flex items-center justify-end">
                Close Price
                {getSortIcon('weekEndPrice')}
              </div>
            </th>
            <th scope="col" className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors text-right" onClick={() => requestSort('changeVsPrevDay')}>
              <div className="flex items-center justify-end">
                vs Prev Day
                {getSortIcon('changeVsPrevDay')}
              </div>
            </th>
            <th scope="col" className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors text-right" onClick={() => requestSort('changeVsPrev2Day')}>
              <div className="flex items-center justify-end">
                vs 2 Days Ago
                {getSortIcon('changeVsPrev2Day')}
              </div>
            </th>
            <th scope="col" className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors text-right" onClick={() => requestSort('changeVsPrevWeek')}>
              <div className="flex items-center justify-end">
                vs Last Week
                {getSortIcon('changeVsPrevWeek')}
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, index) => (
            <tr key={row.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-0`}>
              <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                {row.weekEndDate}
              </td>
              <td className="px-6 py-4 text-right font-mono">
                {formatPrice(row.weekEndPrice)}
              </td>
              <td className="px-6 py-4 text-right font-mono">
                {formatPct(row.changeVsPrevDay)}
              </td>
              <td className="px-6 py-4 text-right font-mono">
                {formatPct(row.changeVsPrev2Day)}
              </td>
              <td className="px-6 py-4 text-right font-mono bg-gray-50/50">
                {formatPct(row.changeVsPrevWeek)}
              </td>
            </tr>
          ))}
          {sortedData.length === 0 && (
             <tr>
               <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                 No data available to display.
               </td>
             </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StockTable;