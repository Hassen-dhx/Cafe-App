import { MaterialIcons } from "@expo/vector-icons";
import { AuthProvider, useAuth } from "@/store/AuthContext";
import { CartProvider, useCart } from "@/store/CartContext";
import { Stack, usePathname, useRouter } from "expo-router";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

function FloatingCart() {
  const insets = useSafeAreaInsets();
  const { itemCount } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (pathname !== "/menu" && !pathname.startsWith("/product/")) return null;

  const handlePress = () => {
    if (!isAuthenticated) {
      if (itemCount === 0) {
        Alert.alert("Panier vide", "Ajoutez des produits depuis le menu.");
        return;
      }
      Alert.alert(
        "Connexion requise",
        "Connectez-vous pour finaliser votre commande.",
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Se connecter",
            onPress: () => router.push("/(auth)/login" as any),
          },
        ],
      );
      return;
    }
    router.push("/(client)/cart" as any);
  };

  return (
    <TouchableOpacity
      style={[styles.fab, { bottom: insets.bottom + 20, right: 10 }]}
      onPress={handlePress}
      activeOpacity={0.75}
    >
      <MaterialIcons name="shopping-cart" size={24} color="#fff" />
      {itemCount > 0 && (
        <View style={styles.fabBadge}>
          <Text style={styles.fabBadgeText}>
            {itemCount > 99 ? "99+" : itemCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <View style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="menu" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(client)" />
              <Stack.Screen name="(serveur)" />
              <Stack.Screen name="(gerant)" />
              <Stack.Screen
                name="product/[id]"
                options={{ headerShown: true, title: "Détail" }}
              />
            </Stack>
            <FloatingCart />
          </View>
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#208AEF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.25)",
    shadowColor: "#208AEF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 999,
  },
  fabBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#e74c3c",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  fabBadgeText: { color: "#fff", fontSize: 12, fontWeight: "800" },
});
