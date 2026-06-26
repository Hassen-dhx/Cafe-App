import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCart } from "@/store/CartContext";
import { createOrder } from "@/services/api";

export default function CartScreen() {
  const { items, removeItem, updateQuantity, clearCart, total } = useCart();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleOrder = async () => {
    setLoading(true);
    try {
      const lignes = items.map((i) => ({
        produitId: i.product.id,
        quantite: i.quantite,
      }));
      const order = await createOrder(lignes);
      clearCart();
      Alert.alert("Commande passée", `Commande #${order.id} créée avec succès`, [
        { text: "OK", onPress: () => router.push("/(client)/orders" as any) },
      ]);
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Panier vide</Text>
          <TouchableOpacity style={styles.browseBtn} onPress={() => router.push("/menu" as any)}>
            <Text style={styles.browseBtnText}>Voir le menu</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(i) => String(i.product.id)}
            contentContainerStyle={{ padding: 16, gap: 12 }}
            renderItem={({ item }) => (
              <View style={styles.cartItem}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.product.nom}</Text>
                  <Text style={styles.itemPrice}>
                    {(item.product.prix * item.quantite).toFixed(2)} DT
                  </Text>
                </View>
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateQuantity(item.product.id, item.quantite - 1)}
                  >
                    <Text style={styles.qtyBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.qty}>{item.quantite}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateQuantity(item.product.id, item.quantite + 1)}
                  >
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                    <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => removeItem(item.product.id)}
                  >
                    <MaterialIcons name="delete-outline" size={22} color="#e74c3c" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>{total.toFixed(2)} DT</Text>
            </View>
            <TouchableOpacity
              style={[styles.orderBtn, loading && styles.disabled]}
              onPress={handleOrder}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.orderBtnText}>Passer la commande</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 18, color: "#999", marginBottom: 16 },
  browseBtn: { backgroundColor: "#208AEF", padding: 12, borderRadius: 8 },
  browseBtnText: { color: "#fff", fontWeight: "600" },
  cartItem: {
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
  },
  itemInfo: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  itemName: { fontSize: 16, fontWeight: "600", flex: 1 },
  itemPrice: { fontSize: 16, fontWeight: "700", color: "#208AEF" },
  quantityControls: { flexDirection: "row", alignItems: "center", gap: 12 },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  qtyBtnText: { fontSize: 18, fontWeight: "700" },
  qty: { fontSize: 16, fontWeight: "600", minWidth: 24, textAlign: "center" },
  removeBtn: { marginLeft: "auto" },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  totalLabel: { fontSize: 18, fontWeight: "600" },
  totalAmount: { fontSize: 18, fontWeight: "700", color: "#208AEF" },
  orderBtn: {
    backgroundColor: "#208AEF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  disabled: { opacity: 0.6 },
  orderBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
