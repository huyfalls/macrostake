import type { FoodLogEntry } from "@macrostake/types";

interface Props { logs: FoodLogEntry[] }

const MEAL_LABELS: Record<string, string> = {
  BREAKFAST: "Breakfast", LUNCH: "Lunch", DINNER: "Dinner",
  SNACK: "Snack", PRE_WORKOUT: "Pre-WO", POST_WORKOUT: "Post-WO",
};

export function RecentLogsTable({ logs }: Props) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-10 text-zinc-500">
        <p className="text-3xl mb-2">🍽️</p>
        <p>No food logged yet today.</p>
        <a href="/dashboard/food" className="text-red-400 hover:text-red-300 text-sm mt-1 inline-block">
          Log your first meal →
        </a>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-zinc-500 text-xs border-b border-zinc-800">
            <th className="text-left pb-2 font-medium">Food</th>
            <th className="text-left pb-2 font-medium">Meal</th>
            <th className="text-right pb-2 font-medium">Grams</th>
            <th className="text-right pb-2 font-medium">Cal</th>
            <th className="text-right pb-2 font-medium">Protein</th>
            <th className="text-right pb-2 font-medium">Carbs</th>
            <th className="text-right pb-2 font-medium">Fat</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/50">
          {logs.map((log) => (
            <tr key={log.id} className="hover:bg-zinc-800/30 transition">
              <td className="py-2.5 pr-4">
                <div className="font-medium truncate max-w-[200px]">{log.foodName}</div>
                {log.brandName && (
                  <div className="text-zinc-500 text-xs truncate">{log.brandName}</div>
                )}
              </td>
              <td className="py-2.5 pr-4 text-zinc-400">
                {MEAL_LABELS[log.meal] ?? log.meal}
              </td>
              <td className="py-2.5 text-right text-zinc-400">{log.gramsConsumed}g</td>
              <td className="py-2.5 text-right font-medium">{log.calories.toFixed(0)}</td>
              <td className="py-2.5 text-right text-orange-400">{log.protein.toFixed(1)}g</td>
              <td className="py-2.5 text-right text-yellow-400">{log.carbs.toFixed(1)}g</td>
              <td className="py-2.5 text-right text-blue-400">{log.fat.toFixed(1)}g</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
