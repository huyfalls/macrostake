import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { useApiStore } from "@/store/api";
import { format, subDays } from "date-fns";

export default function ProgressScreen() {
  const { apiBase, token } = useApiStore();

  const { data } = useQuery({
    queryKey: ["progress"],
    queryFn:  () =>
      fetch(`${apiBase}/api/penalties`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    enabled: !!token,
  });

  const penalties = data?.penalties ?? [];
  const totalCharged   = penalties.filter((p: any) => p.status === "CHARGED"    ).reduce((s: number, p: any) => s + p.amount, 0);
  const totalEarnedBack = penalties.filter((p: any) => p.status === "EARNED_BACK").reduce((s: number, p: any) => s + p.amount, 0);

  return (
    <ScrollView style={s.container} contentContainerStyle={s.scroll}>
      <Text style={s.title}>Progress</Text>

      <View style={s.statsRow}>
        {[
          { label: "Total charged",  value: `$${totalCharged.toFixed(2)}`,    color: "#f87171" },
          { label: "Earned back",    value: `$${totalEarnedBack.toFixed(2)}`,  color: "#4ade80" },
          { label: "Net cost",       value: `$${(totalCharged - totalEarnedBack).toFixed(2)}`, color: "#fff" },
        ].map((s_) => (
          <View key={s_.label} style={s.statCard}>
            <Text style={[s.statValue, { color: s_.color }]}>{s_.value}</Text>
            <Text style={s.statLabel}>{s_.label}</Text>
          </View>
        ))}
      </View>

      <Text style={s.sectionTitle}>Recent Penalties</Text>
      {penalties.slice(0, 20).map((p: any) => (
        <View key={p.id} style={s.penaltyRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.penaltyReason} numberOfLines={1}>{p.reason}</Text>
            <Text style={s.penaltyDate}>{format(new Date(p.createdAt), "MMM d, yyyy")}</Text>
          </View>
          <View style={[s.statusBadge, { backgroundColor: p.status === "EARNED_BACK" ? "#14532d" : p.status === "CHARGED" ? "#450a0a" : "#422006" }]}>
            <Text style={[s.statusText, { color: p.status === "EARNED_BACK" ? "#4ade80" : p.status === "CHARGED" ? "#f87171" : "#fbbf24" }]}>
              ${p.amount.toFixed(2)}
            </Text>
          </View>
        </View>
      ))}

      {penalties.length === 0 && (
        <Text style={s.empty}>No penalties yet. Keep it up! 🏆</Text>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: "#09090b" },
  scroll:       { padding: 16, paddingBottom: 32 },
  title:        { color: "#fff", fontSize: 24, fontWeight: "900", marginBottom: 20 },
  statsRow:     { flexDirection: "row", gap: 8, marginBottom: 24 },
  statCard:     { flex: 1, backgroundColor: "#18181b", borderRadius: 14, padding: 12, borderWidth: 1, borderColor: "#27272a" },
  statValue:    { fontSize: 18, fontWeight: "900" },
  statLabel:    { color: "#71717a", fontSize: 11, marginTop: 2 },
  sectionTitle: { color: "#a1a1aa", fontSize: 13, fontWeight: "700", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 },
  penaltyRow:   { flexDirection: "row", alignItems: "center", backgroundColor: "#18181b", borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: "#27272a" },
  penaltyReason:{ color: "#fff", fontWeight: "600", fontSize: 14 },
  penaltyDate:  { color: "#71717a", fontSize: 12, marginTop: 2 },
  statusBadge:  { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusText:   { fontWeight: "700", fontSize: 13 },
  empty:        { color: "#71717a", textAlign: "center", marginTop: 32, fontSize: 15 },
});
