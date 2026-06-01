"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { calcMacrosForGrams } from "@/lib/usda";

type Meal = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK" | "PRE_WORKOUT" | "POST_WORKOUT";

const MEALS: { value: Meal; label: string }[] = [
  { value: "BREAKFAST",    label: "Breakfast" },
  { value: "LUNCH",        label: "Lunch" },
  { value: "DINNER",       label: "Dinner" },
  { value: "SNACK",        label: "Snack" },
  { value: "PRE_WORKOUT",  label: "Pre-Workout" },
  { value: "POST_WORKOUT", label: "Post-Workout" },
];

interface FoodResult {
  fdcId: number;
  description: string;
  brandOwner?: string;
  brandName?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  servingSize: number;
}

export function FoodSearchClient() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<FoodResult | null>(null);
  const [grams, setGrams] = useState("100");
  const [meal, setMeal] = useState<Meal>("BREAKFAST");
  const qc = useQueryClient();

  const { data, isFetching } = useQuery({
    queryKey:  ["food-search", query],
    queryFn:   () => fetch(`/api/food/search?q=${encodeURIComponent(query)}`).then((r) => r.json()),
    enabled:   query.trim().length >= 2,
    staleTime: 60_000,
  });

  const logMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/food/log", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fdcId:  selected!.fdcId,
          grams:  parseFloat(grams),
          meal,
        }),
      });
      if (!res.ok) throw new Error("Failed to log food");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Food logged!");
      setSelected(null);
      setGrams("100");
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: () => toast.error("Failed to log food"),
  });

  const gramsNum = parseFloat(grams) || 0;
  const preview = selected ? calcMacrosForGrams(selected, gramsNum) : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Search panel */}
      <div className="card space-y-4">
        <h2 className="font-bold text-lg">Search Foods</h2>
        <input
          type="text"
          className="input"
          placeholder="e.g. chicken breast, brown rice, greek yogurt..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {isFetching && (
          <div className="text-sm text-zinc-500 animate-pulse">Searching USDA database...</div>
        )}

        {data?.foods && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {data.foods.map((food: FoodResult) => (
              <button
                key={food.fdcId}
                onClick={() => {
                  setSelected(food);
                  setGrams(String(food.servingSize ?? 100));
                }}
                className={`w-full text-left rounded-xl p-3 transition border ${
                  selected?.fdcId === food.fdcId
                    ? "border-red-500 bg-red-500/10"
                    : "border-zinc-800 hover:border-zinc-600 bg-zinc-800/50"
                }`}
              >
                <div className="font-medium text-sm truncate">{food.description}</div>
                {food.brandOwner && (
                  <div className="text-xs text-zinc-500 truncate">{food.brandOwner}</div>
                )}
                <div className="flex gap-3 mt-1 text-xs text-zinc-400">
                  <span>{food.calories.toFixed(0)} kcal</span>
                  <span>{food.protein.toFixed(1)}g protein</span>
                  <span>per 100g</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {data?.foods?.length === 0 && query.length >= 2 && (
          <p className="text-zinc-500 text-sm">No results found. Try a different search term.</p>
        )}
      </div>

      {/* Log panel */}
      <div className="card space-y-4">
        <h2 className="font-bold text-lg">Log Selected Food</h2>

        {!selected ? (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
            <div className="text-4xl mb-3">👈</div>
            <p className="text-sm">Select a food from the search results</p>
          </div>
        ) : (
          <>
            <div className="rounded-xl bg-zinc-800 p-4">
              <div className="font-semibold truncate">{selected.description}</div>
              {selected.brandOwner && (
                <div className="text-xs text-zinc-500">{selected.brandOwner}</div>
              )}
            </div>

            {/* Meal selector */}
            <div>
              <label className="label">Meal</label>
              <select
                className="input"
                value={meal}
                onChange={(e) => setMeal(e.target.value as Meal)}
              >
                {MEALS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            {/* Grams input */}
            <div>
              <label className="label">Amount (grams)</label>
              <input
                type="number"
                className="input"
                value={grams}
                min="1"
                max="2000"
                onChange={(e) => setGrams(e.target.value)}
              />
            </div>

            {/* Macro preview */}
            {preview && gramsNum > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Calories", value: preview.calories.toFixed(0), unit: "kcal", color: "text-red-400" },
                  { label: "Protein",  value: preview.protein.toFixed(1),  unit: "g",    color: "text-orange-400" },
                  { label: "Carbs",    value: preview.carbs.toFixed(1),    unit: "g",    color: "text-yellow-400" },
                  { label: "Fat",      value: preview.fat.toFixed(1),      unit: "g",    color: "text-blue-400" },
                ].map((m) => (
                  <div key={m.label} className="rounded-xl bg-zinc-800 px-3 py-2 text-center">
                    <div className={`text-lg font-black ${m.color}`}>{m.value}</div>
                    <div className="text-zinc-500 text-xs">{m.label}</div>
                  </div>
                ))}
              </div>
            )}

            <button
              className="btn-primary w-full"
              disabled={logMutation.isPending || gramsNum <= 0}
              onClick={() => logMutation.mutate()}
            >
              {logMutation.isPending ? "Logging..." : "Log Food"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
