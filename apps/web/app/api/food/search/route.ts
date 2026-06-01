import { NextRequest, NextResponse } from "next/server";
import { searchFoods, parseUsdaFood } from "@/lib/usda";

export async function GET(req: NextRequest) {
  const q    = req.nextUrl.searchParams.get("q") ?? "";
  const page = parseInt(req.nextUrl.searchParams.get("page") ?? "1");

  if (q.trim().length < 2) {
    return NextResponse.json({ foods: [], totalHits: 0 });
  }

  try {
    const results = await searchFoods(q.trim(), page, 25);
    const foods = results.foods.map((f) => ({
      fdcId:     f.fdcId,
      description: f.description,
      brandOwner: f.brandOwner,
      brandName:  f.brandName,
      category:   f.foodCategory,
      servingSize: f.servingSize ?? 100,
      ...Object.fromEntries(
        Object.entries(parseUsdaFood(f)).filter(([k]) =>
          ["calories","protein","carbs","fat","fiber","sodium","sugar"].includes(k)
        )
      ),
    }));

    return NextResponse.json({ foods, totalHits: results.totalHits, totalPages: results.totalPages });
  } catch (err) {
    console.error("USDA search error:", err);
    return NextResponse.json({ error: "Food search failed" }, { status: 500 });
  }
}
