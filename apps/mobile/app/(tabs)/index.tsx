import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { useApiStore } from "@/store/api";
import { format } from "date-fns";

const { width } = Dimensions.get("window");

export default function TodayScreen() {
  const { apiBase, token } = useApiStore();

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () =>
      fetch(`${apiBase}/api/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
    enabled: !!token,
  });

  const today = new Date();

  if (isLoading) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.center}>
          <Text style={s.loading}>Loading your macros...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const totals = data?.todayMacros ?? { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const goal   = data?.todayGoal   ?? { calories: 2000, protein: 150, carbs: 200, fat: 65 };
  const compliance = data?.compliance;

  const calPct  = Math.min(100, (totals.calories / goal.calories) * 100);
  const onTrack = compliance?.overallMet ?? false;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.scroll}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.dateText}>{format(today, "EEEE, MMM d")}</Text>
        <View style={[s.statusPill, { backgroundColor: onTrack ? "#166534" : "#7f1d1d" }]}>
          <Text style={[s.statusText, { color: onTrack ? "#4ade80" : "#f87171" }]}>
            {onTrack ? "On track ✓" : "Off track ✗"}
          </Text>
        </View>
      </View>

      {/* Big calorie ring (simplified arc) */}
      <View style={s.calorieCard}>
        <Text style={s.calLabel}>Calories</Text>
        <Text style={s.calValue}>{totals.calories.toFixed(0)}</Text>
        <Text style={s.calGoal}>/ {goal.calories} kcal</Text>

        {/* Progress bar */}
        <View style={s.progressBg}>
          <View style={[s.progressFill, {
            width: `${calPct}%` as any,
            backgroundColor: calPct > 105 ? "#ef4444" : calPct > 90 ? "#22c55e" : "#f97316",
          }]} />
        </View>

        {/* Macros row */}
        <View style={s.macrosRow}>
          {[
            { label: "Protein", value: totals.protein, goal: goal.protein, color: "#f97316" },
            { label: "Carbs",   value: totals.carbs,   goal: goal.carbs,   color: "#eab308" },
            { label: "Fat",     value: totals.fat,     goal: goal.fat,     color: "#3b82f6" },
          ].map((m) => (
            <View key={m.label} style={s.macroItem}>
              <Text style={[s.macroValue, { color: m.color }]}>{m.value.toFixed(0)}g</Text>
              <Text style={s.macroLabel}>{m.label}</Text>
              <Text style={s.macroGoal}>/ {m.goal}g</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Streak */}
      {data?.currentStreak !== undefined && (
        <View style={s.streakCard}>
          <Text style={s.streakIcon}>🔥</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.streakTitle}>{data.currentStreak} day streak</Text>
            <Text style={s.streakSub}>
              {data.currentStreak >= (data.earnBackDays ?? 7)
                ? "Streak complete! Earn-back processing..."
                : `${(data.earnBackDays ?? 7) - data.currentStreak} more days to earn back`}
            </Text>
          </View>
        </View>
      )}

      {/* Pending penalty warning */}
      {!onTrack && data?.pendingPenalties > 0 && (
        <View style={s.penaltyWarn}>
          <Text style={s.penaltyTitle}>⚠️ At risk: ${data.pendingPenalties?.toFixed(2)}</Text>
          <Text style={s.penaltySub}>Fix your macros before midnight to avoid the charge.</Text>
        </View>
      )}

      {/* Quick log button */}
      <TouchableOpacity style={s.logBtn} onPress={() => {}}>
        <Text style={s.logBtnText}>+ Log a Meal</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090b" },
  scroll:    { padding: 16, paddingBottom: 32 },
  center:    { flex: 1, alignItems: "center", justifyContent: "center" },
  loading:   { color: "#71717a", fontSize: 16 },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  dateText: { color: "#fff", fontSize: 20, fontWeight: "900" },
  statusPill: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: "700" },

  calorieCard: {
    backgroundColor: "#18181b",
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#27272a",
  },
  calLabel: { color: "#71717a", fontSize: 13, marginBottom: 4 },
  calValue: { color: "#fff", fontSize: 48, fontWeight: "900", lineHeight: 52 },
  calGoal:  { color: "#52525b", fontSize: 16, marginBottom: 16 },
  progressBg: { height: 8, backgroundColor: "#27272a", borderRadius: 999, marginBottom: 20, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 999 },

  macrosRow: { flexDirection: "row", gap: 8 },
  macroItem: { flex: 1, backgroundColor: "#27272a", borderRadius: 12, padding: 12, alignItems: "center" },
  macroValue: { fontSize: 18, fontWeight: "900" },
  macroLabel: { color: "#71717a", fontSize: 11, marginTop: 2 },
  macroGoal:  { color: "#3f3f46", fontSize: 10 },

  streakCard: {
    backgroundColor: "#18181b",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#27272a",
  },
  streakIcon:  { fontSize: 28 },
  streakTitle: { color: "#fff", fontWeight: "700", fontSize: 16 },
  streakSub:   { color: "#71717a", fontSize: 12, marginTop: 2 },

  penaltyWarn: {
    backgroundColor: "#450a0a",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#7f1d1d",
  },
  penaltyTitle: { color: "#f87171", fontWeight: "700", fontSize: 15, marginBottom: 4 },
  penaltySub:   { color: "#fca5a5", fontSize: 13 },

  logBtn: {
    backgroundColor: "#ef4444",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    marginTop: 8,
  },
  logBtnText: { color: "#fff", fontWeight: "900", fontSize: 16 },
});
