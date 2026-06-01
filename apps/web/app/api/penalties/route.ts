import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@macrostake/db";
import { startOfDay, subDays } from "date-fns";
import { checkCompliance, calculatePenalty } from "@/lib/penalties";
import { chargePenalty } from "@/lib/stripe";
import { z } from "zod";

// GET /api/penalties — list user's penalties
export async function GET(req: NextRequest) {
  const user = await requireAuth().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const penalties = await prisma.penalty.findMany({
    where:   { userId: user.id },
    orderBy: { createdAt: "desc" },
    take:    50,
  });

  return NextResponse.json({ penalties });
}

// POST /api/penalties/process — called by cron at midnight to process yesterday
export async function POST(req: NextRequest) {
  // Verify internal cron secret
  const auth = req.headers.get("x-cron-secret");
  if (auth !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const yesterday = startOfDay(subDays(new Date(), 1));

  // Find all users who have penalty configs and logged food yesterday
  const configs = await prisma.penaltyConfig.findMany({
    include: { user: { include: { macroGoals: { where: { isActive: true }, take: 1 } } } },
  });

  const results = await Promise.allSettled(
    configs.map(async (config) => {
      const user = config.user;
      const goal = user.macroGoals[0];
      if (!goal) return;

      // Check if already processed
      const existing = await prisma.dailySummary.findUnique({
        where: { userId_date: { userId: user.id, date: yesterday } },
      });
      if (existing?.penaltyTriggered) return;

      // Sum yesterday's food logs
      const logs = await prisma.foodLog.findMany({
        where: { userId: user.id, date: yesterday },
      });

      if (logs.length === 0) {
        // No logs = automatic fail
        const compliance = checkCompliance(
          { calories: 0, protein: 0, carbs: 0, fat: 0 },
          goal,
          { calorieTolerancePct: config.calorieTolerancePct, proteinToleranceG: config.proteinToleranceG }
        );

        const penalty = calculatePenalty(compliance, config);
        if (penalty && penalty.amount > 0) {
          await createAndChargePenalty(user.id, penalty, yesterday, config);
        }
        return;
      }

      const totals = logs.reduce(
        (a, l) => ({ calories: a.calories + l.calories, protein: a.protein + l.protein, carbs: a.carbs + l.carbs, fat: a.fat + l.fat }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      const compliance = checkCompliance(totals, goal, {
        calorieTolerancePct: config.calorieTolerancePct,
        proteinToleranceG:   config.proteinToleranceG,
      });

      // Upsert daily summary
      await prisma.dailySummary.upsert({
        where:  { userId_date: { userId: user.id, date: yesterday } },
        create: {
          userId:          user.id,
          date:            yesterday,
          totalCalories:   totals.calories,
          totalProtein:    totals.protein,
          totalCarbs:      totals.carbs,
          totalFat:        totals.fat,
          goalCalories:    goal.calories,
          goalProtein:     goal.protein,
          goalCarbs:       goal.carbs,
          goalFat:         goal.fat,
          calorieStatus:   compliance.calories.status,
          proteinStatus:   compliance.protein.status,
          carbStatus:      compliance.carbs.status,
          fatStatus:       compliance.fat.status,
          metGoal:         compliance.overallMet,
          overageCalories: compliance.overageCalories,
          underProtein:    compliance.underProtein,
          penaltyTriggered: !compliance.overallMet,
        },
        update: { metGoal: compliance.overallMet, penaltyTriggered: !compliance.overallMet },
      });

      if (!compliance.overallMet) {
        const penaltyCalc = calculatePenalty(compliance, config);
        if (penaltyCalc && penaltyCalc.amount > 0) {
          await createAndChargePenalty(user.id, penaltyCalc, yesterday, config);
        }
      } else {
        // Update streak
        await handleStreakUpdate(user.id, yesterday, config);
      }
    })
  );

  const failed = results.filter((r) => r.status === "rejected").length;
  return NextResponse.json({ processed: configs.length, failed });
}

async function createAndChargePenalty(
  userId: string,
  penaltyCalc: ReturnType<typeof calculatePenalty>,
  date: Date,
  config: Awaited<ReturnType<typeof prisma.penaltyConfig.findMany>>[0]
) {
  if (!penaltyCalc) return;

  const penalty = await prisma.penalty.create({
    data: {
      userId,
      amount:      penaltyCalc.amount,
      reason:      penaltyCalc.reason,
      type:        penaltyCalc.type,
      status:      "PENDING",
      triggerDate: date,
    },
  });

  // Attempt to charge via Stripe if they have a payment method
  const pm = await prisma.paymentMethod.findFirst({
    where: { userId, type: "STRIPE_CARD", isDefault: true },
  });

  if (pm?.stripeCustomerId && pm.stripePaymentMethodId) {
    try {
      const intent = await chargePenalty(
        pm.stripeCustomerId,
        pm.stripePaymentMethodId,
        penaltyCalc.amount,
        `MacroStake penalty: ${penaltyCalc.reason}`
      );

      await prisma.penalty.update({
        where: { id: penalty.id },
        data:  { status: "CHARGED", stripeChargeId: intent.id, paidAt: new Date() },
      });

      await prisma.transaction.create({
        data: {
          userId,
          type:          "PENALTY_CHARGE",
          amount:        penaltyCalc.amount,
          description:   penaltyCalc.reason,
          status:        "COMPLETED",
          stripeIntentId: intent.id,
          penaltyId:     penalty.id,
        },
      });
    } catch (err) {
      console.error("Stripe charge failed:", err);
    }
  }

  return penalty;
}

async function handleStreakUpdate(userId: string, date: Date, config: any) {
  let streak = await prisma.streak.findFirst({
    where: { userId, completed: false },
    orderBy: { createdAt: "desc" },
  });

  if (!streak) {
    streak = await prisma.streak.create({
      data: { userId, startDate: date, currentDays: 1, targetDays: config.earnBackStreakDays },
    });
  } else {
    streak = await prisma.streak.update({
      where: { id: streak.id },
      data:  { currentDays: { increment: 1 }, endDate: date },
    });

    if (streak.currentDays >= streak.targetDays && config.earnBackEnabled) {
      // Earn back the most recent penalty
      const latestPenalty = await prisma.penalty.findFirst({
        where: { userId, status: "CHARGED" },
        orderBy: { createdAt: "desc" },
      });

      if (latestPenalty) {
        const earnAmount = config.earnBackAmount ?? latestPenalty.amount;
        await prisma.penalty.update({
          where: { id: latestPenalty.id },
          data: { status: "EARNED_BACK", earnedBackAt: new Date(), earnedBackAmount: earnAmount },
        });
        await prisma.streak.update({
          where: { id: streak.id },
          data: { completed: true, completedAt: new Date() },
        });
      }
    }
  }
}
