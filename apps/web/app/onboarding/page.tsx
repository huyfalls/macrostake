"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Link from "next/link";

const STEPS = ["Account", "Macros", "Penalty", "Goal", "Payment"];

export default function OnboardingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(0);

  const [macros, setMacros] = useState({ calories: 2000, protein: 150, carbs: 200, fat: 65 });
  const [penalty, setPenalty] = useState({
    mode: "DAILY_FLAT" as "DAILY_FLAT" | "PER_OVERAGE" | "HYBRID",
    dailyFlatAmount: 10,
    overageCalorieUnit: 200,
    overageAmount: 10,
    earnBackStreakDays: 7,
  });
  const [yearlyGoal, setYearlyGoal] = useState({
    description: "",
    targetWeight: "",
    year: new Date().getFullYear(),
    startDate: `${new Date().getFullYear()}-01-01`,
    endDate:   `${new Date().getFullYear()}-12-31`,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      await Promise.all([
        fetch("/api/goals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "macro", ...macros }),
        }),
        fetch("/api/goals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "penalty",
            ...penalty,
            calorieTolerancePct: 5,
            proteinToleranceG: 5,
            earnBackEnabled: true,
            maxPendingPenalty: 500,
            cryptoEnabled: false,
          }),
        }),
        yearlyGoal.description && fetch("/api/goals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "yearly", ...yearlyGoal }),
        }),
      ]);
    },
    onSuccess: () => {
      toast.success("Setup complete! Welcome to MacroStake.");
      router.push("/dashboard");
    },
    onError: () => toast.error("Something went wrong. Please try again."),
  });

  if (!session) {
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500 font-black text-white text-3xl mx-auto mb-6">
            M
          </div>
          <h1 className="text-2xl font-black mb-2">First, create your account</h1>
          <p className="text-zinc-400 text-sm mb-8">We&apos;ll set up your macros and penalties right after.</p>
          <div className="space-y-3">
            <button onClick={() => signIn("google", { callbackUrl: "/onboarding" })} className="btn-secondary w-full">
              Continue with Google
            </button>
            <button onClick={() => signIn("github", { callbackUrl: "/onboarding" })} className="btn-secondary w-full">
              Continue with GitHub
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <Link href="/" className="flex items-center gap-2 mb-8 justify-center">
          <div className="h-8 w-8 rounded-lg bg-red-500 flex items-center justify-center font-black text-white text-sm">M</div>
          <span className="font-black">Macro<span className="text-red-500">Stake</span></span>
        </Link>

        {/* Progress */}
        <div className="flex gap-1.5 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1">
              <div className={`h-1.5 rounded-full ${i <= step ? "bg-red-500" : "bg-zinc-800"}`} />
              <div className={`text-xs mt-1 ${i === step ? "text-white" : "text-zinc-600"}`}>{s}</div>
            </div>
          ))}
        </div>

        <div className="card">
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-black">Hey, {session.user?.name?.split(" ")[0]}! 👋</h2>
              <p className="text-zinc-400">Let&apos;s set up your MacroStake account in 4 quick steps. You&apos;ll set your daily macros, choose your penalty, set a year-end goal, and add a payment method.</p>
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-300">
                <strong>How it works:</strong> Every night at midnight, we check if you hit your macros. If not, you pay. Hit your streak and earn it back.
              </div>
              <button className="btn-primary w-full" onClick={() => setStep(1)}>Let&apos;s go →</button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-black">Set your daily macro targets</h2>
              <p className="text-zinc-400 text-sm">These are the numbers you need to hit every day. Be realistic — you can adjust them later.</p>
              {(["calories", "protein", "carbs", "fat"] as const).map((f) => (
                <div key={f}>
                  <label className="label capitalize">{f} {f === "calories" ? "(kcal)" : "(g)"}</label>
                  <input type="number" className="input" value={macros[f]}
                    onChange={(e) => setMacros((m) => ({ ...m, [f]: parseFloat(e.target.value) || 0 }))} />
                </div>
              ))}
              <div className="flex gap-3">
                <button className="btn-ghost" onClick={() => setStep(0)}>Back</button>
                <button className="btn-primary flex-1" onClick={() => setStep(2)}>Next →</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-black">Choose your punishment</h2>
              <p className="text-zinc-400 text-sm">This is what keeps you honest. How do you want to be penalized?</p>

              <div className="space-y-3">
                {[
                  { mode: "DAILY_FLAT" as const, label: "Daily flat fee", desc: "Fixed $ per missed day" },
                  { mode: "PER_OVERAGE" as const, label: "Per overage", desc: "$ per N calories over" },
                  { mode: "HYBRID" as const, label: "Hybrid (hardest)", desc: "Flat fee + per overage" },
                ].map((opt) => (
                  <button key={opt.mode} onClick={() => setPenalty((p) => ({ ...p, mode: opt.mode }))}
                    className={`w-full text-left rounded-xl border p-4 transition ${penalty.mode === opt.mode ? "border-red-500 bg-red-500/10" : "border-zinc-700 hover:border-zinc-500"}`}>
                    <div className="font-bold">{opt.label}</div>
                    <div className="text-sm text-zinc-400">{opt.desc}</div>
                  </button>
                ))}
              </div>

              <div>
                <label className="label">Amount ($)</label>
                <input type="number" className="input" value={penalty.dailyFlatAmount} min="1" max="1000"
                  onChange={(e) => setPenalty((p) => ({ ...p, dailyFlatAmount: parseFloat(e.target.value) || 0 }))} />
              </div>

              <div>
                <label className="label">Earn-back streak (days)</label>
                <div className="flex gap-2">
                  {[7, 14, 21].map((d) => (
                    <button key={d} onClick={() => setPenalty((p) => ({ ...p, earnBackStreakDays: d }))}
                      className={`flex-1 rounded-xl border py-3 font-bold transition ${penalty.earnBackStreakDays === d ? "border-green-500 bg-green-500/10 text-green-400" : "border-zinc-700 text-zinc-400"}`}>
                      {d} days
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button className="btn-ghost" onClick={() => setStep(1)}>Back</button>
                <button className="btn-primary flex-1" onClick={() => setStep(3)}>Next →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-black">Set your year-end goal</h2>
              <p className="text-zinc-400 text-sm">What are you working toward? This keeps you focused on the big picture.</p>
              <div>
                <label className="label">Describe your goal</label>
                <textarea className="input resize-none" rows={3}
                  placeholder="e.g. Get to 175 lbs, build visible abs, hit protein goal 350 days this year..."
                  value={yearlyGoal.description}
                  onChange={(e) => setYearlyGoal((g) => ({ ...g, description: e.target.value }))} />
              </div>
              <div>
                <label className="label">Target weight (kg, optional)</label>
                <input type="number" className="input" value={yearlyGoal.targetWeight}
                  onChange={(e) => setYearlyGoal((g) => ({ ...g, targetWeight: e.target.value }))} />
              </div>
              <div className="flex gap-3">
                <button className="btn-ghost" onClick={() => setStep(2)}>Back</button>
                <button className="btn-primary flex-1" onClick={() => setStep(4)}>Next →</button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-black">Add a payment method</h2>
              <p className="text-zinc-400 text-sm">Penalties are charged automatically. You can skip this now and add it in Settings.</p>
              <div className="rounded-xl bg-zinc-800 p-4 text-sm text-zinc-400">
                Stripe integration is configured in Settings → Payment Methods after setup.
              </div>
              <div className="flex gap-3">
                <button className="btn-ghost" onClick={() => setStep(3)}>Back</button>
                <button className="btn-primary flex-1" disabled={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
                  {saveMutation.isPending ? "Setting up..." : "Finish setup 🚀"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
