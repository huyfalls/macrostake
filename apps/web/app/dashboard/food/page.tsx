import { FoodSearchClient } from "@/components/food/FoodSearchClient";

export const metadata = { title: "Log Food" };

export default function FoodPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">Log Food</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Search 300,000+ foods from the USDA database. Every gram counts.
        </p>
      </div>
      <FoodSearchClient />
    </div>
  );
}
