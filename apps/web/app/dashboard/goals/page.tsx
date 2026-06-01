import { requireAuth } from "@/lib/auth";
import { prisma } from "@macrostake/db";
import { GoalsForm } from "@/components/goals/GoalsForm";

export const metadata = { title: "Goals" };

export default async function GoalsPage() {
  const user = await requireAuth();
  const [macroGoal, yearlyGoal, penaltyConfig] = await Promise.all([
    prisma.macroGoal.findFirst({ where: { userId: user.id, isActive: true } }),
    prisma.yearlyGoal.findUnique({ where: { userId: user.id } }),
    prisma.penaltyConfig.findUnique({ where: { userId: user.id } }),
  ]);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black">Goals & Penalties</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Set your macro targets, yearly goal, and configure how much you pay when you fail.
        </p>
      </div>
      <GoalsForm
        initialMacroGoal={macroGoal}
        initialYearlyGoal={yearlyGoal}
        initialPenaltyConfig={penaltyConfig}
      />
    </div>
  );
}
