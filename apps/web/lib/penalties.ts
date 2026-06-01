import type { MacroCompliance, PenaltyCalculation } from "@macrostake/types";
import type { PenaltyConfig } from "@macrostake/db";

export function calculatePenalty(
  compliance: MacroCompliance,
  config: PenaltyConfig
): PenaltyCalculation | null {
  if (compliance.overallMet) return null;

  const breakdown: PenaltyCalculation["breakdown"] = [];
  let total = 0;

  if (config.mode === "DAILY_FLAT" || config.mode === "HYBRID") {
    total += config.dailyFlatAmount;
    breakdown.push({ label: "Daily flat penalty (missed macro goal)", amount: config.dailyFlatAmount });
  }

  if ((config.mode === "PER_OVERAGE" || config.mode === "HYBRID") && compliance.overageCalories > 0) {
    const units = Math.floor(compliance.overageCalories / config.overageCalorieUnit);
    if (units > 0) {
      const overageCharge = units * config.overageAmount;
      total += overageCharge;
      breakdown.push({
        label: `${compliance.overageCalories.toFixed(0)} cal over (${units}x ${config.overageCalorieUnit}-cal units × $${config.overageAmount})`,
        amount: overageCharge,
      });
    }
  }

  // Cap at max pending
  if (total > config.maxPendingPenalty) {
    total = config.maxPendingPenalty;
    breakdown.push({ label: "Capped at maximum penalty limit", amount: 0 });
  }

  if (total === 0) return null;

  return {
    amount: Math.round(total * 100) / 100,
    reason: buildReason(compliance),
    type:   config.mode === "PER_OVERAGE" ? "CALORIE_OVERAGE" : "DAILY_MISS",
    breakdown,
  };
}

function buildReason(c: MacroCompliance): string {
  const parts: string[] = [];
  if (c.calories.status === "OVER")  parts.push(`${c.overageCalories.toFixed(0)} cal over`);
  if (c.protein.status === "UNDER")  parts.push(`${c.underProtein.toFixed(1)}g protein under`);
  if (c.carbs.status === "OVER")     parts.push("carbs over");
  if (c.fat.status === "OVER")       parts.push("fat over");
  return parts.length ? parts.join(", ") : "missed daily macro goal";
}

export function checkCompliance(
  actual: { calories: number; protein: number; carbs: number; fat: number },
  goal: { calories: number; protein: number; carbs: number; fat: number },
  config: { calorieTolerancePct: number; proteinToleranceG: number }
): MacroCompliance {
  const calDiff = actual.calories - goal.calories;
  const calPct  = (actual.calories / goal.calories) * 100;
  const calStatus = getStatus(calDiff, goal.calories * (config.calorieTolerancePct / 100));

  const protDiff = actual.protein - goal.protein;
  const protStatus = getStatus(protDiff, config.proteinToleranceG);

  const carbDiff = actual.carbs - goal.carbs;
  const carbStatus = getStatus(carbDiff, goal.carbs * (config.calorieTolerancePct / 100));

  const fatDiff = actual.fat - goal.fat;
  const fatStatus = getStatus(fatDiff, goal.fat * (config.calorieTolerancePct / 100));

  const overallMet =
    calStatus === "ON_TRACK" &&
    protStatus !== "UNDER" &&
    carbStatus !== "OVER" &&
    fatStatus !== "OVER";

  return {
    calories: { actual: actual.calories, target: goal.calories, diff: calDiff, pct: calPct, status: calStatus },
    protein:  { actual: actual.protein,  target: goal.protein,  diff: protDiff, pct: (actual.protein / goal.protein) * 100, status: protStatus },
    carbs:    { actual: actual.carbs,    target: goal.carbs,    diff: carbDiff, pct: (actual.carbs / goal.carbs) * 100,     status: carbStatus },
    fat:      { actual: actual.fat,      target: goal.fat,      diff: fatDiff,  pct: (actual.fat / goal.fat) * 100,         status: fatStatus },
    overallMet,
    overageCalories: Math.max(0, calDiff),
    underProtein:    Math.max(0, -protDiff),
  };
}

function getStatus(diff: number, tolerance: number): "UNDER" | "ON_TRACK" | "OVER" {
  if (diff < -tolerance) return "UNDER";
  if (diff > tolerance)  return "OVER";
  return "ON_TRACK";
}

export function calcEarnBackProgress(
  currentStreak: number,
  targetDays: number
): { pct: number; daysLeft: number; complete: boolean } {
  const pct = Math.min(100, (currentStreak / targetDays) * 100);
  return { pct, daysLeft: Math.max(0, targetDays - currentStreak), complete: currentStreak >= targetDays };
}
