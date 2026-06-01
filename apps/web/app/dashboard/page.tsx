import { requireAuth } from "@/lib/auth";
import { prisma } from "@macrostake/db";
import { startOfDay, endOfDay, startOfYear, format } from "date-fns";
import { MacroRingChart } from "@/components/dashboard/MacroRingChart";
import { PenaltyAlert } from "@/components/dashboard/PenaltyAlert";
import { StreakCard } from "@/components/dashboard/StreakCard";
import { RecentLogsTable } from "@/components/dashboard/RecentLogsTable";
import { YearlyProgressCard } from "@/components/dashboard/YearlyProgressCard";
import { formatCurrency } from "@/lib/utils";
import { checkCompliance } from "@/lib/penalties";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireAuth();

  const today = new Date();
  const dayStart = startOfDay(today);
  const dayEnd   = endOfDay(today);

  // Fetch all data in parallel
  const [macroGoal, foodLogs, penaltyConfig, latestPenalties, streak, yearlyGoal] = await Promise.all([
    prisma.macroGoal.findFirst({ where: { userId: user.id, isActive: true } }),
    prisma.foodLog.findMany({
      where: { userId: user.id, date: { gte: dayStart, lte: dayEnd } },
      include: { food: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.penaltyConfig.findUnique({ where: { userId: user.id } }),
    prisma.penalty.findMany({
      where: { userId: user.id, status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.streak.findFirst({
      where: { userId: user.id, completed: false },
      orderBy: { createdAt: "desc" },
    }),
    prisma.yearlyGoal.findUnique({ where: { userId: user.id } }),
  ]);

  // Sum today's macros
  const totals = foodLogs.reduce(
    (acc, log) => ({
      calories: acc.calories + log.calories,
      protein:  acc.protein  + log.protein,
      carbs:    acc.carbs    + log.carbs,
      fat:      acc.fat      + log.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const defaultGoal = { calories: 2000, protein: 150, carbs: 200, fat: 65 };
  const goal = macroGoal ?? defaultGoal;

  const compliance = checkCompliance(totals, goal, {
    calorieTolerancePct: penaltyConfig?.calorieTolerancePct ?? 5,
    proteinToleranceG:   penaltyConfig?.proteinToleranceG ?? 5,
  });

  const pendingTotal = latestPenalties.reduce((s, p) => s + p.amount, 0);

  // Year progress
  const yearDays = yearlyGoal
    ? Math.round((new Date(yearlyGoal.endDate).getTime() - new Date(yearlyGoal.startDate).getTime()) / 86400000)
    : 365;
  const daysPassed = Math.round((today.getTime() - startOfYear(today).getTime()) / 86400000);
  const yearPct = Math.min(100, Math.round((daysPassed / yearDays) * 100));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black">
          {format(today, "EEEE, MMMM d")}
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          {compliance.overallMet
            ? "On track — keep it up."
            : "Off track — every bite counts."}
        </p>
      </div>

      {/* Penalty alert */}
      {!compliance.overallMet && penaltyConfig && (
        <PenaltyAlert compliance={compliance} config={penaltyConfig} />
      )}

      {/* Macro rings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MacroRingChart totals={totals} goal={goal} compliance={compliance} />

        <div className="grid grid-cols-2 gap-4">
          {/* Calories card */}
          <div className="card col-span-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-400">Calories</span>
              <span className={`text-xs font-medium ${
                compliance.calories.status === "ON_TRACK" ? "text-green-400" :
                compliance.calories.status === "OVER" ? "text-red-400" : "text-yellow-400"
              }`}>
                {compliance.calories.status === "ON_TRACK" ? "On track" :
                 compliance.calories.status === "OVER" ? `+${compliance.overageCalories.toFixed(0)} over` : "Under"}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black">{totals.calories.toFixed(0)}</span>
              <span className="text-zinc-500">/ {goal.calories} kcal</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  compliance.calories.status === "OVER" ? "bg-red-500" :
                  compliance.calories.status === "ON_TRACK" ? "bg-green-500" : "bg-yellow-500"
                }`}
                style={{ width: `${Math.min(100, compliance.calories.pct)}%` }}
              />
            </div>
          </div>

          {/* Protein */}
          {(["protein", "carbs", "fat"] as const).map((macro) => (
            <div key={macro} className="card">
              <div className="text-xs text-zinc-500 capitalize mb-1">{macro}</div>
              <div className="text-xl font-black">
                {totals[macro].toFixed(1)}
                <span className="text-zinc-600 text-sm font-normal">g</span>
              </div>
              <div className="text-xs text-zinc-500">/ {(goal as any)[macro]}g</div>
              <div className="mt-2 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    compliance[macro].status === "OVER" ? "bg-red-500" :
                    compliance[macro].status === "ON_TRACK" ? "bg-green-500" : "bg-yellow-500"
                  }`}
                  style={{ width: `${Math.min(100, compliance[macro].pct)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Streak + Pending penalties row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StreakCard streak={streak} penaltyConfig={penaltyConfig} />

        <div className="card">
          <h3 className="font-bold mb-4 flex items-center justify-between">
            Pending Penalties
            <span className="text-red-400 font-black">{formatCurrency(pendingTotal)}</span>
          </h3>
          {latestPenalties.length === 0 ? (
            <p className="text-zinc-500 text-sm">No pending penalties. Keep it up!</p>
          ) : (
            <ul className="space-y-2">
              {latestPenalties.map((p) => (
                <li key={p.id} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">{p.reason}</span>
                  <span className="text-red-400 font-bold">{formatCurrency(p.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Yearly goal */}
      {yearlyGoal && (
        <YearlyProgressCard goal={yearlyGoal} yearPct={yearPct} daysPassed={daysPassed} />
      )}

      {/* Today's food log */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">Today&apos;s Log</h3>
          <a href="/dashboard/food" className="text-sm text-red-400 hover:text-red-300 transition">
            + Add food
          </a>
        </div>
        <RecentLogsTable logs={foodLogs.map((l) => ({
          id:           l.id,
          foodName:     l.food.name,
          brandName:    l.food.brandName ?? undefined,
          meal:         l.meal,
          gramsConsumed: l.gramsConsumed,
          calories:     l.calories,
          protein:      l.protein,
          carbs:        l.carbs,
          fat:          l.fat,
          createdAt:    l.createdAt.toISOString(),
        }))} />
      </div>
    </div>
  );
}
