"use client";

import { calculatePenalty } from "@/lib/penalties";
import type { MacroCompliance } from "@macrostake/types";
import type { PenaltyConfig } from "@macrostake/db";
import { formatCurrency } from "@/lib/utils";

interface Props {
  compliance: MacroCompliance;
  config: PenaltyConfig;
}

export function PenaltyAlert({ compliance, config }: Props) {
  const penalty = calculatePenalty(compliance, config);
  if (!penalty) return null;

  return (
    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-bold text-red-400 mb-1 flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            At risk of penalty tonight
          </div>
          <p className="text-sm text-zinc-400">
            If you don&apos;t fix your macros before midnight,{" "}
            <span className="text-red-400 font-bold">{formatCurrency(penalty.amount)}</span> will be charged.
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-2xl font-black text-red-400">{formatCurrency(penalty.amount)}</div>
          <div className="text-xs text-zinc-500">at risk</div>
        </div>
      </div>

      {penalty.breakdown.length > 0 && (
        <div className="mt-4 space-y-1 border-t border-red-500/20 pt-3">
          {penalty.breakdown.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">{item.label}</span>
              {item.amount > 0 && (
                <span className="text-red-400 font-medium">{formatCurrency(item.amount)}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
