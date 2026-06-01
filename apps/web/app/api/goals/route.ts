import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@macrostake/db";

const macroGoalSchema = z.object({
  calories: z.number().int().min(500).max(10000),
  protein:  z.number().min(0).max(1000),
  carbs:    z.number().min(0).max(2000),
  fat:      z.number().min(0).max(1000),
  fiber:    z.number().optional(),
});

const yearlyGoalSchema = z.object({
  year:           z.number().int().min(2024).max(2030),
  targetWeight:   z.number().optional(),
  description:    z.string().max(500).optional(),
  targetCalories: z.number().int().optional(),
  targetProtein:  z.number().optional(),
  startDate:      z.string(),
  endDate:        z.string(),
});

export async function GET(req: NextRequest) {
  const user = await requireAuth().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [macroGoal, yearlyGoal, penaltyConfig] = await Promise.all([
    prisma.macroGoal.findFirst({ where: { userId: user.id, isActive: true } }),
    prisma.yearlyGoal.findUnique({ where: { userId: user.id } }),
    prisma.penaltyConfig.findUnique({ where: { userId: user.id } }),
  ]);

  return NextResponse.json({ macroGoal, yearlyGoal, penaltyConfig });
}

export async function POST(req: NextRequest) {
  const user = await requireAuth().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const type = body.type as "macro" | "yearly" | "penalty";

  if (type === "macro") {
    const data = macroGoalSchema.safeParse(body);
    if (!data.success) return NextResponse.json({ error: data.error.flatten() }, { status: 400 });

    // Deactivate existing goals
    await prisma.macroGoal.updateMany({
      where: { userId: user.id, isActive: true },
      data:  { isActive: false, effectiveTo: new Date() },
    });

    const goal = await prisma.macroGoal.create({
      data: { userId: user.id, ...data.data },
    });
    return NextResponse.json({ goal });
  }

  if (type === "yearly") {
    const data = yearlyGoalSchema.safeParse(body);
    if (!data.success) return NextResponse.json({ error: data.error.flatten() }, { status: 400 });

    const goal = await prisma.yearlyGoal.upsert({
      where:  { userId: user.id },
      create: { userId: user.id, ...data.data, startDate: new Date(data.data.startDate), endDate: new Date(data.data.endDate) },
      update: { ...data.data, startDate: new Date(data.data.startDate), endDate: new Date(data.data.endDate) },
    });
    return NextResponse.json({ goal });
  }

  if (type === "penalty") {
    const penaltySchema = z.object({
      mode:                 z.enum(["DAILY_FLAT", "PER_OVERAGE", "HYBRID"]),
      dailyFlatAmount:      z.number().min(1).max(1000),
      overageCalorieUnit:   z.number().int().min(50).max(1000),
      overageAmount:        z.number().min(1).max(1000),
      calorieTolerancePct:  z.number().min(0).max(20),
      proteinToleranceG:    z.number().min(0).max(50),
      earnBackEnabled:      z.boolean(),
      earnBackStreakDays:   z.number().int().min(1).max(30),
      earnBackAmount:       z.number().optional(),
      maxPendingPenalty:    z.number().min(10).max(10000),
      cryptoEnabled:        z.boolean().default(false),
      cryptoToken:          z.string().optional(),
    });

    const data = penaltySchema.safeParse(body);
    if (!data.success) return NextResponse.json({ error: data.error.flatten() }, { status: 400 });

    const config = await prisma.penaltyConfig.upsert({
      where:  { userId: user.id },
      create: { userId: user.id, ...data.data },
      update: data.data,
    });
    return NextResponse.json({ config });
  }

  return NextResponse.json({ error: "Unknown type" }, { status: 400 });
}
