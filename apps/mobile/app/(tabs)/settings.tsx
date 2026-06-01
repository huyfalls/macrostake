import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { useApiStore } from "@/store/api";

export default function SettingsScreen() {
  const { setToken } = useApiStore();

  return (
    <ScrollView style={s.container} contentContainerStyle={s.scroll}>
      <Text style={s.title}>Settings</Text>

      <Text style={s.section}>Account</Text>
      <TouchableOpacity style={s.row} onPress={() => Linking.openURL("macrostake://")}>
        <Text style={s.rowText}>Manage on web</Text>
        <Text style={s.chevron}>→</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.row} onPress={() => setToken(null)}>
        <Text style={[s.rowText, { color: "#f87171" }]}>Sign out</Text>
      </TouchableOpacity>

      <Text style={s.section}>Payment Methods</Text>
      <TouchableOpacity style={s.row}>
        <Text style={s.rowText}>Add credit card (Stripe)</Text>
        <Text style={s.chevron}>→</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.row}>
        <Text style={s.rowText}>Connect crypto wallet</Text>
        <Text style={s.chevron}>→</Text>
      </TouchableOpacity>

      <Text style={s.section}>About</Text>
      <View style={s.row}><Text style={s.rowText}>Version</Text><Text style={s.rowValue}>1.0.0</Text></View>
      <View style={s.row}><Text style={s.rowText}>Food data</Text><Text style={s.rowValue}>USDA FoodData Central</Text></View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090b" },
  scroll:    { padding: 16, paddingBottom: 32 },
  title:     { color: "#fff", fontSize: 24, fontWeight: "900", marginBottom: 20 },
  section:   { color: "#71717a", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, marginTop: 24 },
  row:       { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#18181b", borderRadius: 12, padding: 16, marginBottom: 4, borderWidth: 1, borderColor: "#27272a" },
  rowText:   { color: "#fff", fontSize: 15 },
  rowValue:  { color: "#71717a", fontSize: 14 },
  chevron:   { color: "#71717a" },
});
