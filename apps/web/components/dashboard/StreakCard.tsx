import { calcEarnBackProgress } from "@/lib/penalties";
import type { Streak, PenaltyConfig } from "@macrostake/db";

interface Props {
  streak: Streak | null;
  penaltyConfig: PenaltyConfig | null;
}

export function StreakCard({ streak, penaltyConfig }: Props) {
  const targetDays = streak?.targetDays ?? penaltyConfig?.earnBackStreakDays ?? 7;
  const currentDays = streak?.currentDays ?? 0;
  const progress = calcEarnBackProgress(currentDays, targetDays);

  return (
    <div className="card">
      <h3 className="font-bold mb-4 flex items-center gap-2">
        <span>🔥</span> Current Streak
      </h3>

      <div className="flex items-center gap-4 mb-4">
        <div className="text-5xl font-black text-orange-400">{currentDays}</div>
        <div>
          <div className="text-sm text-zinc-400">days on track</div>
          <div className="text-xs text-zinc-600">{targetDays - currentDays} more to earn back</div>
        </div>
      </div>

      <div className="h-3 rounded-full bg-zinc-800 overflow-hidden mb-2">
        <div
          className="h-full rounded-full bg-gradient-to-r from-orange-500 to-green-500 transition-all"
          style={{ width: `${progress.pct}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-zinc-500">
        <span>Day 0</span>
        <span className="text-orange-400 font-medium">{progress.pct.toFixed(0)}%</span>
        <span>Day {targetDays}</span>
      </div>

      {progress.complete && (
        <div className="mt-3 rounded-xl bg-green-500/10 border border-green-500/30 px-3 py-2 text-sm text-green-400 font-medium text-center">
          🎉 Streak complete! Claiming your earn-back...
        </div>
      )}
    </div>
  );
}
