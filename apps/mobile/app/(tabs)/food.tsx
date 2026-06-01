import {
  View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert,
} from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiStore } from "@/store/api";
import { calcMacrosForGrams } from "@/lib/macros";

const MEALS = ["BREAKFAST","LUNCH","DINNER","SNACK","PRE_WORKOUT","POST_WORKOUT"];

interface Food { fdcId: number; description: string; brandOwner?: string; calories: number; protein: number; carbs: number; fat: number; servingSize: number }

export default function FoodScreen() {
  const { apiBase, token } = useApiStore();
  const qc = useQueryClient();

  const [query,    setQuery]    = useState("");
  const [selected, setSelected] = useState<Food | null>(null);
  const [grams,    setGrams]    = useState("100");
  const [meal,     setMeal]     = useState("BREAKFAST");

  const { data, isFetching } = useQuery({
    queryKey: ["food-search-mobile", query],
    queryFn:  () =>
      fetch(`${apiBase}/api/food/search?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
    enabled:   query.trim().length >= 2,
    staleTime: 60_000,
  });

  const logMutation = useMutation({
    mutationFn: () =>
      fetch(`${apiBase}/api/food/log`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ fdcId: selected!.fdcId, grams: parseFloat(grams), meal }),
      }).then((r) => r.json()),
    onSuccess: () => {
      Alert.alert("Logged!", `${selected!.description} added.`);
      setSelected(null);
      setGrams("100");
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: () => Alert.alert("Error", "Failed to log food. Try again."),
  });

  const gramsNum = parseFloat(grams) || 0;
  const preview  = selected ? calcMacrosForGrams(selected, gramsNum) : null;

  return (
    <SafeAreaView style={s.container} edges={["bottom"]}>
      {/* Search */}
      <View style={s.searchBar}>
        <TextInput
          style={s.input}
          placeholder="Search 300,000+ foods..."
          placeholderTextColor="#52525b"
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
        />
      </View>

      {isFetching && <ActivityIndicator color="#ef4444" style={{ marginTop: 12 }} />}

      {!selected ? (
        <FlatList
          data={data?.foods ?? []}
          keyExtractor={(f: Food) => String(f.fdcId)}
          contentContainerStyle={{ padding: 16, gap: 8 }}
          ListEmptyComponent={
            query.length >= 2 && !isFetching ? (
              <Text style={s.empty}>No results for &quot;{query}&quot;</Text>
            ) : null
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={s.foodItem} onPress={() => { setSelected(item); setGrams(String(item.servingSize ?? 100)); }}>
              <Text style={s.foodName} numberOfLines={1}>{item.description}</Text>
              {item.brandOwner && <Text style={s.foodBrand} numberOfLines={1}>{item.brandOwner}</Text>}
              <View style={s.macroRow}>
                <Text style={s.macroChip}>{item.calories.toFixed(0)} kcal</Text>
                <Text style={[s.macroChip, { color: "#f97316" }]}>{item.protein.toFixed(1)}g P</Text>
                <Text style={s.dimText}>per 100g</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={s.logPanel}>
          <TouchableOpacity onPress={() => setSelected(null)} style={s.backBtn}>
            <Text style={s.backText}>← Back to search</Text>
          </TouchableOpacity>

          <View style={s.selectedCard}>
            <Text style={s.selectedName} numberOfLines={2}>{selected.description}</Text>
            {selected.brandOwner && <Text style={s.foodBrand}>{selected.brandOwner}</Text>}
          </View>

          {/* Meal picker */}
          <Text style={s.sectionLabel}>Meal</Text>
          <View style={s.mealRow}>
            {MEALS.slice(0, 4).map((m) => (
              <TouchableOpacity key={m} style={[s.mealChip, meal === m && s.mealChipActive]} onPress={() => setMeal(m)}>
                <Text style={[s.mealChipText, meal === m && s.mealChipTextActive]}>
                  {m.replace("_", " ")}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Grams */}
          <Text style={s.sectionLabel}>Amount (grams)</Text>
          <TextInput
            style={s.gramsInput}
            value={grams}
            onChangeText={setGrams}
            keyboardType="numeric"
            placeholder="100"
            placeholderTextColor="#52525b"
          />

          {/* Preview */}
          {preview && gramsNum > 0 && (
            <View style={s.previewRow}>
              {[
                { label: "Cal",     value: preview.calories.toFixed(0), color: "#ef4444" },
                { label: "Protein", value: `${preview.protein.toFixed(1)}g`, color: "#f97316" },
                { label: "Carbs",   value: `${preview.carbs.toFixed(1)}g`,   color: "#eab308" },
                { label: "Fat",     value: `${preview.fat.toFixed(1)}g`,     color: "#3b82f6" },
              ].map((m) => (
                <View key={m.label} style={s.previewItem}>
                  <Text style={[s.previewValue, { color: m.color }]}>{m.value}</Text>
                  <Text style={s.previewLabel}>{m.label}</Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={[s.logBtn, logMutation.isPending && { opacity: 0.6 }]}
            onPress={() => logMutation.mutate()}
            disabled={logMutation.isPending || gramsNum <= 0}
          >
            <Text style={s.logBtnText}>{logMutation.isPending ? "Logging..." : "Log Food"}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090b" },
  searchBar: { padding: 16, borderBottomWidth: 1, borderBottomColor: "#27272a" },
  input:     { backgroundColor: "#18181b", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, color: "#fff", fontSize: 15, borderWidth: 1, borderColor: "#27272a" },
  empty:     { color: "#71717a", textAlign: "center", marginTop: 32, fontSize: 15 },

  foodItem:  { backgroundColor: "#18181b", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#27272a" },
  foodName:  { color: "#fff", fontWeight: "700", fontSize: 14 },
  foodBrand: { color: "#71717a", fontSize: 12, marginTop: 2 },
  macroRow:  { flexDirection: "row", gap: 8, marginTop: 6, alignItems: "center" },
  macroChip: { color: "#a1a1aa", fontSize: 12 },
  dimText:   { color: "#3f3f46", fontSize: 11 },

  logPanel:     { flex: 1, padding: 16 },
  backBtn:      { marginBottom: 12 },
  backText:     { color: "#ef4444", fontSize: 14 },
  selectedCard: { backgroundColor: "#18181b", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#27272a", marginBottom: 16 },
  selectedName: { color: "#fff", fontWeight: "700", fontSize: 16 },
  sectionLabel: { color: "#a1a1aa", fontSize: 13, fontWeight: "600", marginBottom: 8 },

  mealRow:         { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  mealChip:        { borderRadius: 10, borderWidth: 1, borderColor: "#27272a", paddingHorizontal: 12, paddingVertical: 6 },
  mealChipActive:  { borderColor: "#ef4444", backgroundColor: "#450a0a" },
  mealChipText:    { color: "#71717a", fontSize: 12, fontWeight: "600" },
  mealChipTextActive: { color: "#f87171" },

  gramsInput: { backgroundColor: "#18181b", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, color: "#fff", fontSize: 20, fontWeight: "700", borderWidth: 1, borderColor: "#27272a", marginBottom: 16 },

  previewRow:   { flexDirection: "row", gap: 8, marginBottom: 20 },
  previewItem:  { flex: 1, backgroundColor: "#18181b", borderRadius: 12, padding: 10, alignItems: "center", borderWidth: 1, borderColor: "#27272a" },
  previewValue: { fontSize: 16, fontWeight: "900" },
  previewLabel: { color: "#71717a", fontSize: 10, marginTop: 2 },

  logBtn:    { backgroundColor: "#ef4444", borderRadius: 16, padding: 18, alignItems: "center" },
  logBtnText: { color: "#fff", fontWeight: "900", fontSize: 16 },
});
