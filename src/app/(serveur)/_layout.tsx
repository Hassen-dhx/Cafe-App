import { Tabs, Redirect } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "@/store/AuthContext";

export default function ServeurLayout() {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated || role !== "SERVEUR") {
    return <Redirect href={"/menu" as any} />;
  }

  return (
    <Tabs screenOptions={{ headerShown: true }}>
      <Tabs.Screen
        name="orders"
        options={{
          title: "Commandes",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="receipt-long" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Mon compte",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}