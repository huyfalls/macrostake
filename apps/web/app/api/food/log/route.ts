import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@macrostake/db";
import { getFoodById, parseUsdaFood, calcMacrosForGrams } from "@/lib/usda";
import { startOfDay } from "date-fns";

const schema = z.object({
  fdcId:  z.number().int().positive(),
  grams:  z.number().positive().max(5000),
  meal:   z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK", "PRE_WORKOUT", "POST_WORKOUT"]),
  foodId: z.string().optional(), // if already in DB
});

export async function POST(req: NextRequest) {
  const user = await requireAuth().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { fdcId, grams, meal } = parsed.data;

  // Upsert food into our DB (cache it so we don't hit USDA on every log)
  let food = await prisma.food.findUnique({ where: { usdaFdcId: fdcId } });

  if (!food) {
    const usdaFood = await getFoodById(fdcId);
    if (!usdaFood) return NextResponse.json({ error: "Food not found" }, { status: 404 });

    const parsed = parseUsdaFood(usdaFood);
    food = await prisma.food.upsert({
      where:  { usdaFdcId: fdcId },
      create: parsed,
      update: parsed,
    });
  }

  const macros = calcMacrosForGrams(food, grams);

  const log = await prisma.foodLog.create({
    data: {
      userId:       user.id,
      foodId:       food.id,
      date:         startOfDay(new Date()),
      meal,
      servings:     grams / food.servingSize,
      gramsConsumed: grams,
      calories:     macros.calories,
      protein:      macros.protein,
      carbs:        macros.carbs,
      fat:          macros.fat,
      fiber:        macros.fiber ?? undefined,
    },
    include: { food: true },
  });

  return NextResponse.json({ log });
}

export async function DELETE(req: NextRequest) {
  const user = await requireAuth().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.foodLog.deleteMany({ where: { id, userId: user.id } });
  return NextResponse.json({ ok: true });
}
