"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { MacroGoal, YearlyGoal, PenaltyConfig } from "@macrostake/db";

interface Props {
  initialMacroGoal:    MacroGoal | null;
  initialYearlyGoal:   YearlyGoal | null;
  initialPenaltyConfig: PenaltyConfig | null;
}

export function GoalsForm({ initialMacroGoal, initialYearlyGoal, initialPenaltyConfig }: Props) {
  const [tab, setTab] = useState<"macros" | "yearly" | "penalty">("macros");

  const save = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetch("/api/goals", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => toast.success("Saved!"),
    onError:   () => toast.error("Failed to save"),
  });

  return (
    <div className="card">
      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-zinc-800 p-1 mb-6">
        {(["macros", "yearly", "penalty"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition capitalize ${
              tab === t ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-white"
            }`}
          >
            {t === "macros" ? "Daily Macros" : t === "yearly" ? "Yearly Goal" : "Penalties"}
          </button>
        ))}
      </div>

      {tab === "macros" && (
        <MacrosTab initial={initialMacroGoal} onSave={(d) => save.mutate({ type: "macro", ...d })} loading={save.isPending} />
      )}
      {tab === "yearly" && (
        <YearlyTab initial={initialYearlyGoal} onSave={(d) => save.mutate({ type: "yearly", ...d })} loading={save.isPending} />
      )}
      {tab === "penalty" && (
        <PenaltyTab initial={initialPenaltyConfig} onSave={(d) => save.mutate({ type: "penalty", ...d })} loading={save.isPending} />
      )}
    </div>
  );
}

function MacrosTab({ initial, onSave, loading }: { initial: MacroGoal | null; onSave: (d: any) => void; loading: boolean }) {
  const [form, setForm] = useState({
    calories: initial?.calories ?? 2000,
    protein:  initial?.protein  ?? 150,
    carbs:    initial?.carbs    ?? 200,
    fat:      initial?.fat      ?? 65,
    fiber:    initial?.fiber    ?? 25,
  });

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-400">These targets apply every day. Miss any of them and you may face a penalty.</p>
      {(["calories", "protein", "carbs", "fat", "fiber"] as const).map((field) => (
        <div key={field}>
          <label className="label capitalize">{field} {field === "calories" ? "(kcal)" : "(g)"}</label>
          <input
            type="number"
            className="input"
            value={form[field]}
            onChange={(e) => setForm((f) => ({ ...f, [field]: parseFloat(e.target.value) || 0 }))}
          />
        </div>
      ))}
      <button className="btn-primary w-full" onClick={() => onSave(form)} disabled={loading}>
        {loading ? "Saving..." : "Save Macro Goals"}
      </button>
    </div>
  );
}

function YearlyTab({ initial, onSave, loading }: { initial: YearlyGoal | null; onSave: (d: any) => void; loading: boolean }) {
  const currentYear = new Date().getFullYear();
  const [form, setForm] = useState({
    year:           initial?.year           ?? currentYear,
    targetWeight:   initial?.targetWeight   ?? "",
    description:    initial?.description    ?? "",
    targetCalories: initial?.targetCalories ?? "",
    targetProtein:  initial?.targetProtein  ?? "",
    startDate:      initial ? new Date(initial.startDate).toISOString().split("T")[0] : `${currentYear}-01-01`,
    endDate:        initial ? new Date(initial.endDate).toISOString().split("T")[0]   : `${currentYear}-12-31`,
  });

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-400">Set a meaningful goal for the entire year. This is what you&apos;re working toward.</p>
      <div>
        <label className="label">Goal description</label>
        <textarea
          className="input resize-none"
          rows={3}
          placeholder="e.g. Get down to 175 lbs and stay there, hit 180g protein every day..."
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Target weight (kg)</label>
          <input type="number" className="input" value={form.targetWeight} onChange={(e) => setForm((f) => ({ ...f, targetWeight: e.target.value }))} />
        </div>
        <div>
          <label className="label">Daily calorie target</label>
          <input type="number" className="input" value={form.targetCalories} onChange={(e) => setForm((f) => ({ ...f, targetCalories: e.target.value }))} />
        </div>
        <div>
          <label className="label">Start date</label>
          <input type="date" className="input" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
        </div>
        <div>
          <label className="label">End date</label>
          <input type="date" className="input" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
        </div>
      </div>
      <button className="btn-primary w-full" onClick={() => onSave(form)} disabled={loading}>
        {loading ? "Saving..." : "Save Yearly Goal"}
      </button>
    </div>
  );
}

function PenaltyTab({ initial, onSave, loading }: { initial: PenaltyConfig | null; onSave: (d: any) => void; loading: boolean }) {
  const [form, setForm] = useState({
    mode:               (initial?.mode   ?? "DAILY_FLAT") as "DAILY_FLAT" | "PER_OVERAGE" | "HYBRID",
    dailyFlatAmount:    initial?.dailyFlatAmount    ?? 10,
    overageCalorieUnit: initial?.overageCalorieUnit ?? 200,
    overageAmount:      initial?.overageAmount      ?? 10,
    calorieTolerancePct: initial?.calorieTolerancePct ?? 5,
    proteinToleranceG:  initial?.proteinToleranceG  ?? 5,
    earnBackEnabled:    initial?.earnBackEnabled    ?? true,
    earnBackStreakDays: initial?.earnBackStreakDays  ?? 7,
    maxPendingPenalty:  initial?.maxPendingPenalty  ?? 500,
    cryptoEnabled:      initial?.cryptoEnabled      ?? false,
  });

  return (
    <div className="space-y-5">
      <div>
        <label className="label">Penalty mode</label>
        <div className="grid grid-cols-3 gap-2">
          {(["DAILY_FLAT", "PER_OVERAGE", "HYBRID"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setForm((f) => ({ ...f, mode: m }))}
              className={`rounded-xl border px-3 py-2.5 text-xs font-medium transition ${
                form.mode === m ? "border-red-500 bg-red-500/10 text-red-400" : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
              }`}
            >
              {m === "DAILY_FLAT" ? "Daily Flat" : m === "PER_OVERAGE" ? "Per Overage" : "Hybrid"}
            </button>
          ))}
        </div>
        <p className="text-xs text-zinc-500 mt-2">
          {form.mode === "DAILY_FLAT"   && "Fixed amount charged for each day you miss your macro goals."}
          {form.mode === "PER_OVERAGE"  && "Charged per N calories you go over your target."}
          {form.mode === "HYBRID"       && "Both: flat fee plus per-calorie-overage charge."}
        </p>
      </div>

      {(form.mode === "DAILY_FLAT" || form.mode === "HYBRID") && (
        <div>
          <label className="label">Daily flat amount ($)</label>
          <input type="number" className="input" min="1" max="1000" value={form.dailyFlatAmount}
            onChange={(e) => setForm((f) => ({ ...f, dailyFlatAmount: parseFloat(e.target.value) || 0 }))} />
        </div>
      )}

      {(form.mode === "PER_OVERAGE" || form.mode === "HYBRID") && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Per every N calories over</label>
            <input type="number" className="input" min="50" max="1000" value={form.overageCalorieUnit}
              onChange={(e) => setForm((f) => ({ ...f, overageCalorieUnit: parseInt(e.target.value) || 200 }))} />
          </div>
          <div>
            <label className="label">Charge amount ($)</label>
            <input type="number" className="input" min="1" max="1000" value={form.overageAmount}
              onChange={(e) => setForm((f) => ({ ...f, overageAmount: parseFloat(e.target.value) || 0 }))} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Calorie tolerance (%)</label>
          <input type="number" className="input" min="0" max="20" value={form.calorieTolerancePct}
            onChange={(e) => setForm((f) => ({ ...f, calorieTolerancePct: parseFloat(e.target.value) || 0 }))} />
          <p className="text-xs text-zinc-600 mt-1">How far over/under before it counts as a miss</p>
        </div>
        <div>
          <label className="label">Protein tolerance (g)</label>
          <input type="number" className="input" min="0" max="50" value={form.proteinToleranceG}
            onChange={(e) => setForm((f) => ({ ...f, proteinToleranceG: parseFloat(e.target.value) || 0 }))} />
        </div>
      </div>

      <div className="border border-zinc-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <label className="font-medium text-sm">Earn-back system</label>
          <button
            onClick={() => setForm((f) => ({ ...f, earnBackEnabled: !f.earnBackEnabled }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${form.earnBackEnabled ? "bg-green-500" : "bg-zinc-700"}`}
          >
            <span className={`inline-block h-4 w-4 rounded-full bg-white transition ${form.earnBackEnabled ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>
        {form.earnBackEnabled && (
          <div>
            <label className="label">Consecutive days to earn back</label>
            <div className="flex gap-3">
              {[7, 14, 21, 30].map((d) => (
                <button
                  key={d}
                  onClick={() => setForm((f) => ({ ...f, earnBackStreakDays: d }))}
                  className={`flex-1 rounded-xl border py-2 text-sm font-bold transition ${
                    form.earnBackStreakDays === d ? "border-green-500 bg-green-500/10 text-green-400" : "border-zinc-700 text-zinc-500 hover:border-zinc-500"
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="label">Max pending penalty cap ($)</label>
        <input type="number" className="input" min="10" max="10000" value={form.maxPendingPenalty}
          onChange={(e) => setForm((f) => ({ ...f, maxPendingPenalty: parseFloat(e.target.value) || 500 }))} />
        <p className="text-xs text-zinc-600 mt-1">Total penalties are capped at this amount</p>
      </div>

      <div className="flex items-center justify-between border border-zinc-800 rounded-xl p-4">
        <div>
          <div className="font-medium text-sm">Crypto staking</div>
          <div className="text-xs text-zinc-500">Stake USDC, USDT or ETH instead of card</div>
        </div>
        <button
          onClick={() => setForm((f) => ({ ...f, cryptoEnabled: !f.cryptoEnabled }))}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${form.cryptoEnabled ? "bg-blue-500" : "bg-zinc-700"}`}
        >
          <span className={`inline-block h-4 w-4 rounded-full bg-white transition ${form.cryptoEnabled ? "translate-x-6" : "translate-x-1"}`} />
        </button>
      </div>

      <button className="btn-primary w-full" onClick={() => onSave(form)} disabled={loading}>
        {loading ? "Saving..." : "Save Penalty Settings"}
      </button>
    </div>
  );
}
