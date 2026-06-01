// ─── USDA Food API ────────────────────────────────────────────────────────────

export interface UsdaFoodSearchResult {
  fdcId: number;
  description: string;
  brandOwner?: string;
  brandName?: string;
  foodCategory?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  foodNutrients: UsdaNutrient[];
}

export interface UsdaNutrient {
  nutrientId: number;
  nutrientName: string;
  nutrientNumber: string;
  unitName: string;
  value: number;
}

export interface UsdaSearchResponse {
  totalHits: number;
  currentPage: number;
  totalPages: number;
  foods: UsdaFoodSearchResult[];
}

// ─── Macro Targets ────────────────────────────────────────────────────────────

export interface MacroTargets {
  calories: number;
  protein: number;   // g
  carbs: number;     // g
  fat: number;       // g
  fiber?: number;    // g
}

export interface MacroActuals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

export interface MacroCompliance {
  calories: ComplianceResult;
  protein: ComplianceResult;
  carbs: ComplianceResult;
  fat: ComplianceResult;
  overallMet: boolean;
  overageCalories: number;
  underProtein: number;
}

export interface ComplianceResult {
  actual: number;
  target: number;
  diff: number;      // actual - target
  pct: number;       // % of target
  status: "UNDER" | "ON_TRACK" | "OVER";
}

// ─── Penalty ──────────────────────────────────────────────────────────────────

export interface PenaltyCalculation {
  amount: number;
  reason: string;
  type: "DAILY_MISS" | "CALORIE_OVERAGE" | "HYBRID";
  breakdown: PenaltyBreakdownItem[];
}

export interface PenaltyBreakdownItem {
  label: string;
  amount: number;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardStats {
  todayMacros: MacroActuals;
  todayGoal: MacroTargets;
  compliance: MacroCompliance;
  currentStreak: number;
  longestStreak: number;
  totalPenalties: number;       // USD
  pendingPenalties: number;     // USD
  earnedBack: number;           // USD
  yearProgress: number;         // 0-100%
  daysUntilYearEnd: number;
}

// ─── Food Log Entry (client-safe) ─────────────────────────────────────────────

export interface FoodLogEntry {
  id: string;
  foodName: string;
  brandName?: string;
  meal: string;
  gramsConsumed: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  createdAt: string;
}

// ─── Yearly Progress ──────────────────────────────────────────────────────────

export interface YearlyProgress {
  goal: {
    targetWeight?: number;
    targetCalories?: number;
    targetProtein?: number;
    startDate: string;
    endDate: string;
    description?: string;
  };
  current: {
    weight?: number;
    avgDailyCalories: number;
    avgDailyProtein: number;
  };
  streakHistory: StreakSummary[];
  penaltyHistory: PenaltySummary[];
  complianceByMonth: MonthlyCompliance[];
}

export interface StreakSummary {
  startDate: string;
  endDate?: string;
  days: number;
  completed: boolean;
}

export interface PenaltySummary {
  date: string;
  amount: number;
  status: string;
  reason: string;
}

export interface MonthlyCompliance {
  month: string;  // "2025-01"
  daysLogged: number;
  daysOnTrack: number;
  totalPenalties: number;
}

// ─── Crypto ───────────────────────────────────────────────────────────────────

export interface CryptoStakeConfig {
  network: "ethereum" | "polygon" | "base";
  token: "ETH" | "USDC" | "USDT";
  walletAddress: string;
  stakeAmount: number;
}
