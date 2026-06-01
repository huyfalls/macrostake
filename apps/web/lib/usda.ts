import type { UsdaFoodSearchResult, UsdaSearchResponse } from "@macrostake/types";

const BASE = "https://api.nal.usda.gov/fdc/v1";

// USDA nutrient IDs we care about
const NUTRIENT_IDS = {
  calories:     1008,
  protein:      1003,
  carbs:        1005,
  fat:          1004,
  fiber:        1079,
  sugar:        2000,
  sodium:       1093,
  cholesterol:  1253,
  saturatedFat: 1258,
  transFat:     1257,
  potassium:    1092,
  calcium:      1087,
  iron:         1089,
  vitaminC:     1162,
  vitaminD:     1114,
} as const;

function getNutrientValue(
  nutrients: UsdaFoodSearchResult["foodNutrients"],
  id: number
): number {
  return nutrients.find((n) => n.nutrientId === id)?.value ?? 0;
}

export function parseUsdaFood(food: UsdaFoodSearchResult) {
  const n = food.foodNutrients;
  return {
    usdaFdcId:    food.fdcId,
    name:         food.description,
    brandOwner:   food.brandOwner ?? null,
    brandName:    food.brandName ?? null,
    category:     food.foodCategory ?? null,
    servingSize:  food.servingSize ?? 100,
    servingUnit:  food.servingSizeUnit ?? "g",
    // macros per 100g
    calories:     getNutrientValue(n, NUTRIENT_IDS.calories),
    protein:      getNutrientValue(n, NUTRIENT_IDS.protein),
    carbs:        getNutrientValue(n, NUTRIENT_IDS.carbs),
    fat:          getNutrientValue(n, NUTRIENT_IDS.fat),
    fiber:        getNutrientValue(n, NUTRIENT_IDS.fiber) || null,
    sugar:        getNutrientValue(n, NUTRIENT_IDS.sugar) || null,
    sodium:       getNutrientValue(n, NUTRIENT_IDS.sodium) || null,
    cholesterol:  getNutrientValue(n, NUTRIENT_IDS.cholesterol) || null,
    saturatedFat: getNutrientValue(n, NUTRIENT_IDS.saturatedFat) || null,
    transFat:     getNutrientValue(n, NUTRIENT_IDS.transFat) || null,
    potassium:    getNutrientValue(n, NUTRIENT_IDS.potassium) || null,
    calcium:      getNutrientValue(n, NUTRIENT_IDS.calcium) || null,
    iron:         getNutrientValue(n, NUTRIENT_IDS.iron) || null,
    vitaminC:     getNutrientValue(n, NUTRIENT_IDS.vitaminC) || null,
    vitaminD:     getNutrientValue(n, NUTRIENT_IDS.vitaminD) || null,
  };
}

export async function searchFoods(
  query: string,
  page = 1,
  pageSize = 25
): Promise<UsdaSearchResponse> {
  const params = new URLSearchParams({
    query,
    api_key:    process.env.USDA_API_KEY ?? "DEMO_KEY",
    pageNumber: String(page),
    pageSize:   String(pageSize),
    dataType:   "Foundation,SR Legacy,Survey (FNDDS),Branded",
    sortBy:     "dataType.keyword",
    sortOrder:  "asc",
  });

  const res = await fetch(`${BASE}/foods/search?${params}`, {
    next: { revalidate: 3600 }, // cache 1hr
  });

  if (!res.ok) throw new Error(`USDA API error: ${res.status}`);
  return res.json() as Promise<UsdaSearchResponse>;
}

export async function getFoodById(fdcId: number): Promise<UsdaFoodSearchResult | null> {
  const res = await fetch(
    `${BASE}/food/${fdcId}?api_key=${process.env.USDA_API_KEY ?? "DEMO_KEY"}`,
    { next: { revalidate: 86400 } }
  );
  if (!res.ok) return null;
  return res.json() as Promise<UsdaFoodSearchResult>;
}

// Calculate macros for a given gram amount (food macros are stored per 100g)
export function calcMacrosForGrams(
  food: { calories: number; protein: number; carbs: number; fat: number; fiber?: number | null },
  grams: number
) {
  const ratio = grams / 100;
  return {
    calories: Math.round(food.calories * ratio * 10) / 10,
    protein:  Math.round(food.protein  * ratio * 10) / 10,
    carbs:    Math.round(food.carbs    * ratio * 10) / 10,
    fat:      Math.round(food.fat      * ratio * 10) / 10,
    fiber:    food.fiber ? Math.round(food.fiber * ratio * 10) / 10 : null,
  };
}
