import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiStore } from "@/store/api";

export default function GoalsScreen() {
  const { apiBase, token } = useApiStore();
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["goals"],
    queryFn:  () =>
      fetch(`${apiBase}/api/goals`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    enabled: !!token,
  });

  const [calories, setCalories] = useState(String(data?.macroGoal?.calories ?? 2000));
  const [protein,  setProtein]  = useState(String(data?.macroGoal?.protein  ?? 150));
  const [carbs,    setCarbs]    = useState(String(data?.macroGoal?.carbs    ?? 200));
  const [fat,      setFat]      = useState(String(data?.macroGoal?.fat      ?? 65));

  const saveMacros = useMutation({
    mutationFn: () =>
      fetch(`${apiBase}/api/goals`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type: "macro", calories: +calories, protein: +protein, carbs: +carbs, fat: +fat }),
      }).then((r) => r.json()),
    onSuccess: () => { Alert.alert("Saved!", "Macro goals updated."); qc.invalidateQueries({ queryKey: ["goals"] }); },
    onError:   () => Alert.alert("Error", "Failed to save."),
  });

  return (
    <ScrollView style={s.container} contentContainerStyle={s.scroll}>
      <Text style={s.title}>Daily Macro Goals</Text>
      <Text style={s.subtitle}>Hit these every day or face the penalty.</Text>

      {[
        { label: "Calories (kcal)", value: calories, set: setCalories },
        { label: "Protein (g)",     value: protein,  set: setProtein  },
        { label: "Carbs (g)",       value: carbs,    set: setCarbs    },
        { label: "Fat (g)",         value: fat,      set: setFat      },
      ].map((f) => (
        <View key={f.label} style={s.field}>
          <Text style={s.label}>{f.label}</Text>
          <TextInput
            style={s.input}
            value={f.value}
            onChangeText={f.set}
            keyboardType="numeric"
            placeholderTextColor="#52525b"
          />
        </View>
      ))}

      <TouchableOpacity style={s.saveBtn} onPress={() => saveMacros.mutate()} disabled={saveMacros.isPending}>
        <Text style={s.saveBtnText}>{saveMacros.isPending ? "Saving..." : "Save Goals"}</Text>
      </TouchableOpacity>

      {data?.yearlyGoal && (
        <View style={s.yearlyCard}>
          <Text style={s.yearlyTitle}>🎯 {data.yearlyGoal.year} Yearly Goal</Text>
          {data.yearlyGoal.description && (
            <Text style={s.yearlyDesc}>{data.yearlyGoal.description}</Text>
          )}
          {data.yearlyGoal.targetWeight && (
            <Text style={s.yearlyMeta}>Target: {data.yearlyGoal.targetWeight} kg</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090b" },
  scroll:    { padding: 16, paddingBottom: 32 },
  title:     { color: "#fff", fontSize: 24, fontWeight: "900", marginBottom: 4 },
  subtitle:  { color: "#71717a", fontSize: 14, marginBottom: 24 },
  field:     { marginBottom: 16 },
  label:     { color: "#a1a1aa", fontSize: 13, fontWeight: "600", marginBottom: 8 },
  input:     { backgroundColor: "#18181b", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, color: "#fff", fontSize: 18, fontWeight: "700", borderWidth: 1, borderColor: "#27272a" },
  saveBtn:   { backgroundColor: "#ef4444", borderRadius: 16, padding: 18, alignItems: "center", marginTop: 8 },
  saveBtnText: { color: "#fff", fontWeight: "900", fontSize: 16 },
  yearlyCard:  { backgroundColor: "#18181b", borderRadius: 16, padding: 16, marginTop: 24, borderWidth: 1, borderColor: "#27272a" },
  yearlyTitle: { color: "#fff", fontWeight: "800", fontSize: 16, marginBottom: 8 },
  yearlyDesc:  { color: "#a1a1aa", fontSize: 14, marginBottom: 8 },
  yearlyMeta:  { color: "#71717a", fontSize: 13 },
});
