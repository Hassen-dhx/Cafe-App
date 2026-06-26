import { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { getReservations, updateReservation } from "@/services/api";
import type { Reservation } from "@/types";

export default function GerantReservationsScreen() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      const data = await getReservations();
      setReservations(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id: number) => {
    try {
      await updateReservation(id, "CONFIRMEE");
      loadReservations();
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    }
  };

  const handleCancel = async (id: number) => {
    Alert.alert("Confirmer", "Annuler cette réservation ?", [
      { text: "Non", style: "cancel" },
      {
        text: "Oui",
        style: "destructive",
        onPress: async () => {
          try {
            await updateReservation(id, "ANNULEE");
            loadReservations();
          } catch (e: any) {
            Alert.alert("Erreur", e.message);
          }
        },
      },
    ]);
  };

  const renderReservation = ({ item }: { item: Reservation }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardDate}>
          {new Date(item.date).toLocaleDateString("fr-FR")} à {item.heure}
        </Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                item.statut === "CONFIRMEE" ? "#27ae60" : item.statut === "ANNULEE" ? "#e74c3c" : "#f39c12",
            },
          ]}
        >
          <Text style={styles.statusText}>
            {item.statut === "CONFIRMEE" ? "Confirmée" : item.statut === "ANNULEE" ? "Annulée" : "En attente"}
          </Text>
        </View>
      </View>
      <Text style={styles.clientName}>
        {item.client?.prenom} {item.client?.nom}
      </Text>
      <Text style={styles.guests}>{item.nombrePersonnes} personne(s)</Text>
      {item.statut === "EN_ATTENTE" && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.confirmBtn} onPress={() => handleConfirm(item.id)}>
            <Text style={styles.confirmBtnText}>Confirmer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancel(item.id)}>
            <Text style={styles.cancelBtnText}>Refuser</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
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
        data={reservations}
        keyExtractor={(r) => String(r.id)}
        renderItem={renderReservation}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListEmptyComponent={<Text style={styles.empty}>Aucune réservation</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardDate: { fontSize: 16, fontWeight: "600" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  clientName: { fontSize: 15, fontWeight: "500", marginBottom: 4 },
  guests: { fontSize: 14, color: "#666", marginBottom: 12 },
  actions: { flexDirection: "row", gap: 8 },
  confirmBtn: { flex: 1, padding: 10, borderRadius: 8, backgroundColor: "#27ae60", alignItems: "center" },
  confirmBtnText: { color: "#fff", fontWeight: "600" },
  cancelBtn: { flex: 1, padding: 10, borderRadius: 8, backgroundColor: "#e74c3c", alignItems: "center" },
  cancelBtnText: { color: "#fff", fontWeight: "600" },
  empty: { textAlign: "center", color: "#999", marginTop: 40, fontSize: 16 },
});
