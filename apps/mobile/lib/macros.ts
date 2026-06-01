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
