export interface DailyData {
  date: string;
  price: number;
  originalIndex: number;
  changePct: number | null;
}

export interface WeeklySummary {
  id: string; // Unique ID for key
  weekEndDate: string;
  weekEndPrice: number;
  
  // Comparisons (Percentage Change)
  changeVsPrevDay: number | null;
  changeVsPrev2Day: number | null;
  changeVsPrevWeek: number | null; // Vs the last trading day of the previous week

  // Raw Prices for tooltip/context if needed
  prevDayPrice: number | null;
  prev2DayPrice: number | null;
  prevWeekPrice: number | null;
}

export type SortDirection = 'asc' | 'desc';

export type SortKey = keyof WeeklySummary | keyof DailyData;

// Backtest Types
export type PositionState = 'HOLDING_STOCK' | 'HOLDING_CASH';

export interface BacktestResult {
  weekDate: string;
  closePrice: number;
  nextClosePrice: number | null; // Added for clarity
  
  // State at the start of the week (after previous week's outcome)
  positionState: PositionState;
  
  // The Action taken this week
  action: string; // e.g., "Sell Call @ 105", "Sell Put @ 95"
  strikePrice: number;
  premiumReceived: number;
  
  // The Outcome determined by NEXT week's price
  outcome: 'EXPIRED' | 'ASSIGNED' | 'PENDING';
  outcomeDescription: string;
  
  // Portfolio Values
  cashBalance: number;
  sharesHeld: number;
  totalValue: number; // Cash + (Shares * ClosePrice)
  
  // Benchmarks
  buyAndHoldValue: number;
  stockReturnPct: number | null; // Weekly return of the underlying stock
  
  // Metrics
  weeklyReturnPct: number; // Weekly return of the strategy portfolio
}