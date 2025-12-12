import { DailyData, WeeklySummary, BacktestResult, PositionState } from './types';

// New helper to process raw date/price pairs into full DailyData with metrics
export const processRawData = (rawData: {date: string, price: number}[]): DailyData[] => {
  // Ensure sorted by date ascending using string comparison (ISO Safe for YYYY-MM-DD)
  const sorted = [...rawData].sort((a, b) => a.date.localeCompare(b.date));
  
  // Calculate daily change percentage and assign index
  return sorted.map((d, index) => {
    let changePct: number | null = null;
    if (index > 0) {
      const prevPrice = sorted[index - 1].price;
      changePct = ((d.price - prevPrice) / prevPrice) * 100;
    }

    return { 
      ...d, 
      originalIndex: index,
      changePct
    };
  });
};

export const parseCSV = (csv: string): DailyData[] => {
  const lines = csv.split(/\r?\n/).filter(line => line.trim() !== '');
  const rawData: {date: string, price: number}[] = [];
  
  // Skip header (index 0)
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',');
    if (parts.length >= 2) {
      const date = parts[0].trim();
      const price = parseFloat(parts[1].trim());
      
      if (!isNaN(price) && date) {
        rawData.push({ date, price });
      }
    }
  }

  return processRawData(rawData);
};

const getFridayOfWeek = (dateStr: string): string => {
  // Parse YYYY-MM-DD safely
  const parts = dateStr.split('-').map(Number);
  // Create Date object (Month is 0-indexed)
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  
  // Calculate difference to Friday (5)
  // Day: 0 (Sun) ... 5 (Fri) ... 6 (Sat)
  const day = date.getDay();
  const diff = 5 - day; // If Fri(5), diff=0. If Mon(1), diff=4. If Sat(6), diff=-1.
  
  // Adjust date to Friday
  date.setDate(date.getDate() + diff);
  
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  
  return `${y}-${m}-${d}`;
};

export const calculateWeeklyMetrics = (dailyData: DailyData[]): WeeklySummary[] => {
  const weeklyGroups: { [key: string]: DailyData[] } = {};

  // Group by "Friday of the Week"
  dailyData.forEach(day => {
    const fridayDate = getFridayOfWeek(day.date);
    if (!weeklyGroups[fridayDate]) {
      weeklyGroups[fridayDate] = [];
    }
    weeklyGroups[fridayDate].push(day);
  });

  // Sort weeks chronologically
  const weekIds = Object.keys(weeklyGroups).sort();
  const summary: WeeklySummary[] = [];

  for (let i = 0; i < weekIds.length; i++) {
    const currentWeekId = weekIds[i];
    const daysInWeek = weeklyGroups[currentWeekId];
    
    // Last trading day of the week
    const lastDay = daysInWeek[daysInWeek.length - 1];
    const currentIndex = lastDay.originalIndex;

    // 1. Previous Trading Day (Global lookup to span across weeks)
    const prevDayIndex = currentIndex - 1;
    const prevDay = prevDayIndex >= 0 ? dailyData[prevDayIndex] : null;

    // 2. Two Trading Days ago
    const prev2DayIndex = currentIndex - 2;
    const prev2Day = prev2DayIndex >= 0 ? dailyData[prev2DayIndex] : null;

    // 3. Last Trading Day of Previous Week (Sequence based)
    const prevWeekSummary = i > 0 ? summary[i - 1] : null;
    const prevWeekPrice = prevWeekSummary ? prevWeekSummary.weekEndPrice : null;

    // Calculate Percentages
    const calcPct = (current: number, past: number | null) => {
      if (past === null) return null;
      return ((current - past) / past) * 100;
    };

    summary.push({
      id: currentWeekId,
      weekEndDate: lastDay.date,
      weekEndPrice: lastDay.price,
      
      prevDayPrice: prevDay ? prevDay.price : null,
      changeVsPrevDay: calcPct(lastDay.price, prevDay ? prevDay.price : null),

      prev2DayPrice: prev2Day ? prev2Day.price : null,
      changeVsPrev2Day: calcPct(lastDay.price, prev2Day ? prev2Day.price : null),

      prevWeekPrice: prevWeekPrice,
      changeVsPrevWeek: calcPct(lastDay.price, prevWeekPrice),
    });
  }

  // Reverse to show newest first by default for the table
  return summary.reverse();
};

// --- Backtesting Logic ---

const INITIAL_CAPITAL = 10000;
const CALL_STRIKE_PCT = 1.05; // +5%
const CALL_PREMIUM_PCT = 0.01; // 1%
const PUT_STRIKE_PCT = 1.0; // ATM
const PUT_PREMIUM_PCT = 0.05; // 5% (Updated as requested)

export const runWheelStrategy = (weeklyData: WeeklySummary[]): BacktestResult[] => {
  // Ensure chronological order (Oldest -> Newest) for simulation
  const sortedWeeks = [...weeklyData].reverse();
  
  if (sortedWeeks.length === 0) return [];

  const results: BacktestResult[] = [];
  
  // Initial State: Buy Stock
  let currentShares = INITIAL_CAPITAL / sortedWeeks[0].weekEndPrice;
  let currentCash = 0;
  let state: PositionState = 'HOLDING_STOCK';
  
  const initialBuyAndHoldShares = currentShares;

  for (let i = 0; i < sortedWeeks.length; i++) {
    const week = sortedWeeks[i];
    const nextWeek = i < sortedWeeks.length - 1 ? sortedWeeks[i + 1] : null;
    const currentPrice = week.weekEndPrice;

    // Calculate Buy & Hold Value
    const bhValue = initialBuyAndHoldShares * currentPrice;

    let action = '';
    let strike = 0;
    let premium = 0;
    let outcome: 'EXPIRED' | 'ASSIGNED' | 'PENDING' = 'PENDING';
    let outcomeDesc = '';
    let nextPrice: number | null = null;

    if (nextWeek) {
        nextPrice = nextWeek.weekEndPrice;
    }

    // Logic for this week
    if (state === 'HOLDING_STOCK') {
      // Strategy: Sell Covered Call
      strike = currentPrice * CALL_STRIKE_PCT;
      premium = currentPrice * CALL_PREMIUM_PCT * currentShares; // Total premium cash
      
      // Receive Premium immediately
      currentCash += premium;
      
      action = `Sell Call (Strike: ${strike.toFixed(2)})`;

      if (nextPrice !== null) {
        if (nextPrice > strike) {
          // CALLED AWAY
          outcome = 'ASSIGNED';
          outcomeDesc = 'Shares Called Away';
          // Sell shares at strike
          currentCash += (strike * currentShares);
          currentShares = 0;
          state = 'HOLDING_CASH';
        } else {
          // EXPIRED
          outcome = 'EXPIRED';
          outcomeDesc = 'Call Expired';
          // Keep shares, Keep premium (already added)
          state = 'HOLDING_STOCK';
        }
      }

    } else {
      // Strategy: Sell Cash-Secured Put
      // We assume we use all available cash to secure the put
      strike = currentPrice * PUT_STRIKE_PCT;
      
      // How many contracts/shares can we secure?
      const notionalShares = currentCash / strike;
      premium = currentPrice * PUT_PREMIUM_PCT * notionalShares;
      
      // Receive Premium
      currentCash += premium;
      
      action = `Sell Put (Strike: ${strike.toFixed(2)})`;

      if (nextPrice !== null) {
        if (nextPrice < strike) {
          // ASSIGNED
          outcome = 'ASSIGNED';
          outcomeDesc = 'Put Assigned (Bought Stock)';
          // Buy shares at strike using cash. 
          const sharesToBuy = currentCash / strike;
          currentShares = sharesToBuy;
          currentCash = 0; // All cash converts to stock
          state = 'HOLDING_STOCK';
        } else {
          // EXPIRED
          outcome = 'EXPIRED';
          outcomeDesc = 'Put Expired';
          // Keep Cash, Keep Premium
          state = 'HOLDING_CASH';
        }
      }
    }

    const totalValue = currentCash + (currentShares * currentPrice);
    
    // Calculate weekly return for this specific week vs previous total value
    const prevTotal = i > 0 ? results[i-1].totalValue : INITIAL_CAPITAL;
    const weeklyReturn = ((totalValue - prevTotal) / prevTotal) * 100;

    results.push({
      weekDate: week.weekEndDate,
      closePrice: currentPrice,
      nextClosePrice: nextPrice,
      positionState: state === 'HOLDING_STOCK' && outcome === 'ASSIGNED' ? 'HOLDING_STOCK' : 
                     state === 'HOLDING_CASH' && outcome === 'ASSIGNED' ? 'HOLDING_CASH' : state, 
      action,
      strikePrice: strike,
      premiumReceived: premium,
      outcome,
      outcomeDescription: outcomeDesc,
      cashBalance: currentCash,
      sharesHeld: currentShares,
      totalValue,
      buyAndHoldValue: bhValue,
      stockReturnPct: week.changeVsPrevWeek, // From WeeklySummary
      weeklyReturnPct: weeklyReturn
    });
  }

  // Return Newest -> Oldest for Table Display
  return results.reverse();
};