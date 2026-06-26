import { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { getOrders } from "@/services/api";
import type { Order } from "@/types";

const STATUS_LABELS: Record<string, string> = {
  EN_ATTENTE: "En attente",
  ACCEPTEE: "Acceptée",
  EN_PREPARATION: "En préparation",
  PRETE: "Prête",
  SERVIE: "Servie",
  PAYEE: "Payée",
};

const STATUS_COLORS: Record<string, string> = {
  EN_ATTENTE: "#f39c12",
  ACCEPTEE: "#3498db",
  EN_PREPARATION: "#e67e22",
  PRETE: "#27ae60",
  SERVIE: "#2ecc71",
  PAYEE: "#1abc9c",
};

export default function ClientOrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <TouchableOpacity style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Commande #{item.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.statut] || "#999" }]}>
          <Text style={styles.statusText}>{STATUS_LABELS[item.statut] || item.statut}</Text>
        </View>
      </View>
      <Text style={styles.orderDate}>
        {new Date(item.dateCommande).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
      <View style={styles.orderItems}>
        {item.orderLines?.map((line) => (
          <Text key={line.id} style={styles.orderLine}>
            {line.quantite}x {line.produit.nom}
          </Text>
        ))}
      </View>
      <Text style={styles.orderTotal}>Total: {item.montantTotal.toFixed(2)} DT</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(o) => String(o.id)}
        renderItem={renderOrder}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        refreshing={loading}
        onRefresh={loadOrders}
        ListEmptyComponent={<Text style={styles.empty}>Aucune commande</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  orderCard: {
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  orderId: { fontSize: 16, fontWeight: "700" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  orderDate: { fontSize: 13, color: "#999", marginBottom: 8 },
  orderItems: { marginBottom: 8 },
  orderLine: { fontSize: 14, color: "#333" },
  orderTotal: { fontSize: 15, fontWeight: "700", color: "#208AEF" },
  empty: { textAlign: "center", color: "#999", marginTop: 40, fontSize: 16 },
});
