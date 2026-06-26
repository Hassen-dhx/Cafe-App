import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { getStats } from "@/services/api";
import type { Stats } from "@/types";

export default function GerantStatsScreen() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await getStats();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={loadStats} />}
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vue d'ensemble</Text>
        <View style={styles.grid}>
          <StatCard label="Utilisateurs" value={String(stats.totalUsers)} color="#3498db" />
          <StatCard label="Produits" value={String(stats.totalProducts)} color="#e67e22" />
          <StatCard label="Commandes" value={String(stats.totalOrders)} color="#27ae60" />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Revenus</Text>
        <View style={styles.grid}>
          <StatCard label="Aujourd'hui" value={`${stats.todayRevenue.toFixed(2)} DT`} color="#2ecc71" />
          <StatCard label="Ce mois" value={`${stats.monthRevenue.toFixed(2)} DT`} color="#27ae60" />
          <StatCard label="Total" value={`${stats.revenue.toFixed(2)} DT`} color="#1abc9c" />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Commandes du jour</Text>
        <StatCard label="Aujourd'hui" value={String(stats.todayOrders)} color="#f39c12" />
        <StatCard label="Ce mois" value={String(stats.monthOrders)} color="#e67e22" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statuts des commandes</Text>
        {stats.ordersByStatus.map((s) => (
          <View key={s.statut} style={styles.statusRow}>
            <Text style={styles.statusLabel}>{s.statut}</Text>
            <View style={styles.statusBar}>
              <View
                style={[
                  styles.statusBarFill,
                  { width: `${(s.count / Math.max(...stats.ordersByStatus.map((x) => x.count))) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.statusCount}>{s.count}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top produits</Text>
        {stats.topProducts.map((p, i) => (
          <View key={i} style={styles.topProductRow}>
            <Text style={styles.topProductRank}>#{i + 1}</Text>
            <Text style={styles.topProductName}>{p.product}</Text>
            <Text style={styles.topProductQty}>{p.quantity} vendus</Text>
          </View>
        ))}
        {stats.topProducts.length === 0 && (
          <Text style={styles.empty}>Aucune donnée</Text>
        )}
      </View>
    </ScrollView>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  section: { padding: 16, borderBottomWidth: 1, borderBottomColor: "#eee" },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  statCard: {
    flex: 1,
    minWidth: 100,
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  statLabel: { fontSize: 13, color: "#666", marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: "700" },
  statusRow: { flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 8 },
  statusLabel: { width: 120, fontSize: 14, color: "#666" },
  statusBar: { flex: 1, height: 8, backgroundColor: "#eee", borderRadius: 4 },
  statusBarFill: { height: 8, backgroundColor: "#208AEF", borderRadius: 4 },
  statusCount: { width: 30, textAlign: "right", fontWeight: "600" },
  topProductRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8, gap: 8 },
  topProductRank: { fontSize: 16, fontWeight: "700", color: "#208AEF", width: 30 },
  topProductName: { flex: 1, fontSize: 15 },
  topProductQty: { fontSize: 14, color: "#666" },
  empty: { textAlign: "center", color: "#999", fontSize: 14 },
});
