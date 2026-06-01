import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#18181b",
          borderTopColor:  "#27272a",
          paddingBottom:   4,
        },
        tabBarActiveTintColor:   "#ef4444",
        tabBarInactiveTintColor: "#71717a",
        headerStyle:      { backgroundColor: "#09090b" },
        headerTintColor:  "#fff",
        headerTitleStyle: { fontWeight: "900", fontSize: 18 },
      }}
    >
      <Tabs.Screen name="index"    options={{ title: "Today",    tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📊</Text> }} />
      <Tabs.Screen name="food"     options={{ title: "Log Food", tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🍽️</Text> }} />
      <Tabs.Screen name="progress" options={{ title: "Progress", tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📈</Text> }} />
      <Tabs.Screen name="goals"    options={{ title: "Goals",    tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🎯</Text> }} />
      <Tabs.Screen name="settings" options={{ title: "Settings", tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>⚙️</Text> }} />
    </Tabs>
  );
}
