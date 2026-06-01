import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@macrostake/db";
import { startOfDay, endOfDay, startOfYear, subDays } from "date-fns";
import { checkCompliance } from "@/lib/penalties";
import { calculatePenalty } from "@/lib/penalties";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await requireAuth().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today    = new Date();
  const dayStart = startOfDay(today);
  const dayEnd   = endOfDay(today);

  const [macroGoal, foodLogs, penaltyConfig, streak, penalties] = await Promise.all([
    prisma.macroGoal.findFirst({ where: { userId: user.id, isActive: true } }),
    prisma.foodLog.findMany({
      where: { userId: user.id, date: { gte: dayStart, lte: dayEnd } },
    }),
    prisma.penaltyConfig.findUnique({ where: { userId: user.id } }),
    prisma.streak.findFirst({
      where: { userId: user.id, completed: false },
      orderBy: { createdAt: "desc" },
    }),
    prisma.penalty.findMany({
      where: { userId: user.id, status: { in: ["PENDING", "CHARGED"] } },
    }),
  ]);

  const totals = foodLogs.reduce(
    (a: { calories: number; protein: number; carbs: number; fat: number }, l) => ({
      calories: a.calories + l.calories,
      protein:  a.protein  + l.protein,
      carbs:    a.carbs    + l.carbs,
      fat:      a.fat      + l.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const goal = macroGoal ?? { calories: 2000, protein: 150, carbs: 200, fat: 65 };

  const compliance = checkCompliance(totals, goal, {
    calorieTolerancePct: penaltyConfig?.calorieTolerancePct ?? 5,
    proteinToleranceG:   penaltyConfig?.proteinToleranceG ?? 5,
  });

  const pendingAmount = penalties
    .filter((p) => p.status === "PENDING")
    .reduce((s, p) => s + p.amount, 0);

  const chargedAmount = penalties
    .filter((p) => p.status === "CHARGED")
    .reduce((s, p) => s + p.amount, 0);

  return NextResponse.json({
    todayMacros:      totals,
    todayGoal:        goal,
    compliance,
    currentStreak:    streak?.currentDays ?? 0,
    earnBackDays:     penaltyConfig?.earnBackStreakDays ?? 7,
    pendingPenalties: pendingAmount,
    chargedPenalties: chargedAmount,
  });
}
