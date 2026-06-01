import type { YearlyGoal } from "@macrostake/db";
import { format } from "date-fns";

interface Props {
  goal: YearlyGoal;
  yearPct: number;
  daysPassed: number;
}

export function YearlyProgressCard({ goal, yearPct, daysPassed }: Props) {
  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold flex items-center gap-2">
            <span>🎯</span> Yearly Goal — {goal.year}
          </h3>
          {goal.description && (
            <p className="text-sm text-zinc-400 mt-1">{goal.description}</p>
          )}
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-white">{yearPct}%</div>
          <div className="text-xs text-zinc-500">of year elapsed</div>
        </div>
      </div>

      <div className="h-3 rounded-full bg-zinc-800 overflow-hidden mb-3">
        <div
          className="h-full rounded-full bg-gradient-to-r from-red-500 via-orange-500 to-green-500 transition-all"
          style={{ width: `${yearPct}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-500 mb-4">
        <span>{format(new Date(goal.startDate), "MMM d")}</span>
        <span>{daysPassed} days in</span>
        <span>{format(new Date(goal.endDate), "MMM d")}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {goal.targetWeight && (
          <div className="rounded-xl bg-zinc-800 px-3 py-2">
            <div className="text-xs text-zinc-500">Target weight</div>
            <div className="font-bold">{goal.targetWeight} kg</div>
          </div>
        )}
        {goal.targetCalories && (
          <div className="rounded-xl bg-zinc-800 px-3 py-2">
            <div className="text-xs text-zinc-500">Daily calories</div>
            <div className="font-bold">{goal.targetCalories} kcal</div>
          </div>
        )}
        {goal.targetProtein && (
          <div className="rounded-xl bg-zinc-800 px-3 py-2">
            <div className="text-xs text-zinc-500">Daily protein</div>
            <div className="font-bold">{goal.targetProtein}g</div>
          </div>
        )}
      </div>
    </div>
  );
}
