import { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { getOrders, getPendingOrders, updateOrderStatus } from "@/services/api";
import type { Order } from "@/types";

const STATUS_FLOW = ["EN_ATTENTE", "ACCEPTEE", "EN_PREPARATION", "PRETE", "SERVIE"];
const STATUS_LABELS: Record<string, string> = {
  EN_ATTENTE: "En attente",
  ACCEPTEE: "Acceptée",
  EN_PREPARATION: "En préparation",
  PRETE: "Prête",
  SERVIE: "Servie",
  PAYEE: "Payée",
};

const NEXT_ACTIONS: Record<string, string> = {
  EN_ATTENTE: "Accepter",
  ACCEPTEE: "Préparation",
  EN_PREPARATION: "Marquer prête",
  PRETE: "Servir",
};

const ACTION_COLORS: Record<string, string> = {
  EN_ATTENTE: "#27ae60",
  ACCEPTEE: "#e67e22",
  EN_PREPARATION: "#2980b9",
  PRETE: "#8e44ad",
};

const STATUS_COLORS: Record<string, string> = {
  EN_ATTENTE: "#f39c12",
  ACCEPTEE: "#3498db",
  EN_PREPARATION: "#e67e22",
  PRETE: "#27ae60",
  SERVIE: "#2ecc71",
  PAYEE: "#95a5a6",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `Il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  return new Date(dateStr).toLocaleDateString("fr-FR");
}

export default function ServeurOrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [viewAll, setViewAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadOrders();
  }, [viewAll]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = viewAll ? await getOrders() : await getPendingOrders();
      setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return orders;
    const q = search.toLowerCase();
    return orders.filter(
      (o) =>
        String(o.id).includes(q) ||
        `${o.client?.prenom} ${o.client?.nom}`.toLowerCase().includes(q) ||
        o.orderLines?.some((l) => l.produit.nom.toLowerCase().includes(q))
    );
  }, [orders, search]);

  const handleUpdateStatus = async (orderId: number, currentStatus: string) => {
    const nextStatusIndex = STATUS_FLOW.indexOf(currentStatus) + 1;
    if (nextStatusIndex >= STATUS_FLOW.length) return;
    const nextStatus = STATUS_FLOW[nextStatusIndex];
    setUpdating(orderId);
    try {
      console.log("Sending updateStatus", { orderId, nextStatus });
      const result = await updateOrderStatus(orderId, nextStatus);
      console.log("updateStatus success", result);
      await loadOrders();
    } catch (e: any) {
      console.error("updateStatus error", e);
      Alert.alert("Erreur", `Détail: ${e.message || JSON.stringify(e)}`);
    } finally {
      setUpdating(null);
    }
  };

  const renderOrder = ({ item }: { item: Order }) => {
    const nextAction = NEXT_ACTIONS[item.statut];
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.cardTopLeft}>
            <Text style={styles.orderId}>#{item.id}</Text>
            <Text style={styles.timeAgo}>{timeAgo(item.dateCommande)}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.statut] || "#999" }]}>
            <Text style={styles.badgeText}>{STATUS_LABELS[item.statut] || item.statut}</Text>
          </View>
        </View>
        <View style={styles.clientRow}>
          <MaterialIcons name="person" size={15} color="#888" />
          <Text style={styles.clientName}>
            {item.client?.prenom} {item.client?.nom}
          </Text>
        </View>
        <View style={styles.itemsSection}>
          {item.orderLines?.map((line) => (
            <View key={line.id} style={styles.itemRow}>
              <Text style={styles.itemQty}>{line.quantite}x</Text>
              <Text style={styles.itemName}>{line.produit.nom}</Text>
              <Text style={styles.itemPrice}>
                {(line.prixUnitaire * line.quantite).toFixed(2)} DT
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.cardBottom}>
          <Text style={styles.total}>{item.montantTotal.toFixed(2)} DT</Text>
          {nextAction && (
            <TouchableOpacity
              style={[
                styles.actionBtn,
                { backgroundColor: ACTION_COLORS[item.statut] || "#208AEF" },
                updating === item.id && styles.actionBtnDisabled,
              ]}
              onPress={() => handleUpdateStatus(item.id, item.statut)}
              disabled={updating === item.id}
            >
              {updating === item.id ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.actionBtnText}>{nextAction}</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading && orders.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#208AEF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Commandes</Text>
        <Text style={styles.subtitle}>
          {viewAll
            ? `Historique (${orders.length})`
            : `En attente (${orders.length})`}
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher..."
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch("")}>
            <MaterialIcons name="close" size={20} color="#999" />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, !viewAll && styles.tabActive]}
          onPress={() => setViewAll(false)}
        >
          <MaterialIcons name="pending-actions" size={18} color={!viewAll ? "#fff" : "#888"} />
          <Text style={[styles.tabText, !viewAll && styles.tabTextActive]}>En attente</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, viewAll && styles.tabActive]}
          onPress={() => setViewAll(true)}
        >
          <MaterialIcons name="history" size={18} color={viewAll ? "#fff" : "#888"} />
          <Text style={[styles.tabText, viewAll && styles.tabTextActive]}>Toutes</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(o) => String(o.id)}
        renderItem={renderOrder}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={loadOrders}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <MaterialIcons name="inbox" size={48} color="#ddd" />
            <Text style={styles.emptyText}>Aucune commande</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f7" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 },
  title: { fontSize: 26, fontWeight: "800", color: "#1a1a1a" },
  subtitle: { fontSize: 14, color: "#888", marginTop: 2 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e8e8e8",
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15, color: "#333" },
  tabs: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: "#e8e8ed",
    borderRadius: 10,
    padding: 3,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  tabActive: { backgroundColor: "#208AEF" },
  tabText: { fontWeight: "600", fontSize: 13, color: "#888" },
  tabTextActive: { color: "#fff" },
  list: { padding: 20, paddingTop: 8, gap: 14 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  cardTopLeft: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  orderId: { fontSize: 18, fontWeight: "800", color: "#1a1a1a" },
  timeAgo: { fontSize: 12, color: "#aaa" },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  clientRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
  clientName: { fontSize: 14, color: "#666" },
  itemsSection: {
    backgroundColor: "#f8f8fc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    gap: 8,
  },
  itemRow: { flexDirection: "row", alignItems: "center" },
  itemQty: { fontSize: 14, fontWeight: "700", color: "#208AEF", width: 28 },
  itemName: { fontSize: 14, color: "#333", flex: 1 },
  itemPrice: { fontSize: 13, color: "#888" },
  cardBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  total: { fontSize: 18, fontWeight: "800", color: "#208AEF" },
  actionBtn: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 10 },
  actionBtnDisabled: { opacity: 0.6 },
  actionBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  emptyWrap: { alignItems: "center", marginTop: 60 },
  emptyText: { color: "#bbb", fontSize: 16, marginTop: 12 },
});
