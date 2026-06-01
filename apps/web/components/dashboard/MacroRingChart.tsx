"use client";

import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from "recharts";

interface Props {
  totals:  { calories: number; protein: number; carbs: number; fat: number };
  goal:    { calories: number; protein: number; carbs: number; fat: number };
  compliance: { overallMet: boolean };
}

export function MacroRingChart({ totals, goal, compliance }: Props) {
  const data = [
    { name: "Calories", value: Math.min(100, (totals.calories / goal.calories) * 100), fill: "#ef4444" },
    { name: "Protein",  value: Math.min(100, (totals.protein  / goal.protein)  * 100), fill: "#f97316" },
    { name: "Carbs",    value: Math.min(100, (totals.carbs    / goal.carbs)    * 100), fill: "#eab308" },
    { name: "Fat",      value: Math.min(100, (totals.fat      / goal.fat)      * 100), fill: "#3b82f6" },
  ];

  return (
    <div className="card flex flex-col items-center justify-center">
      <div className="relative w-64 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="30%"
            outerRadius="110%"
            data={data}
            startAngle={90}
            endAngle={-270}
          >
            <RadialBar dataKey="value" cornerRadius={6} background={{ fill: "#27272a" }} />
            <Tooltip
              formatter={(v: number) => `${v.toFixed(0)}%`}
              contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8 }}
            />
          </RadialBarChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`text-3xl font-black ${compliance.overallMet ? "text-green-400" : "text-red-400"}`}>
            {compliance.overallMet ? "✓" : "✗"}
          </div>
          <div className="text-xs text-zinc-500 mt-1">
            {compliance.overallMet ? "On track" : "Off track"}
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-2">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5 text-xs text-zinc-400">
            <div className="w-2 h-2 rounded-full" style={{ background: d.fill }} />
            {d.name}
          </div>
        ))}
      </div>
    </div>
  );
}
