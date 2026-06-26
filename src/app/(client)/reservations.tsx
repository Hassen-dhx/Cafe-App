import { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { getReservations, createReservation, deleteReservation } from "@/services/api";
import type { Reservation } from "@/types";

export default function ClientReservationsScreen() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [date, setDate] = useState("");
  const [heure, setHeure] = useState("");
  const [nombrePersonnes, setNombrePersonnes] = useState("2");
  const [submitting, setSubmitting] = useState(false);

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

  const handleCreate = async () => {
    if (!date || !heure) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }
    setSubmitting(true);
    try {
      await createReservation({
        date,
        heure,
        nombrePersonnes: parseInt(nombrePersonnes) || 2,
      });
      setModalVisible(false);
      setDate("");
      setHeure("");
      setNombrePersonnes("2");
      loadReservations();
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert("Confirmer", "Annuler cette réservation ?", [
      { text: "Non", style: "cancel" },
      {
        text: "Oui",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteReservation(id);
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
      <Text style={styles.cardGuests}>{item.nombrePersonnes} personne(s)</Text>
      {item.statut !== "ANNULEE" && (
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Text style={styles.cancelLink}>Annuler</Text>
        </TouchableOpacity>
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
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nouvelle réservation</Text>
            <TextInput
              style={styles.input}
              placeholder="Date (YYYY-MM-DD)"
              value={date}
              onChangeText={setDate}
            />
            <TextInput
              style={styles.input}
              placeholder="Heure (HH:MM)"
              value={heure}
              onChangeText={setHeure}
            />
            <TextInput
              style={styles.input}
              placeholder="Nombre de personnes"
              value={nombrePersonnes}
              onChangeText={setNombrePersonnes}
              keyboardType="number-pad"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
                onPress={handleCreate}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitBtnText}>Réserver</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  cardGuests: { fontSize: 14, color: "#666" },
  cancelLink: { color: "#e74c3c", marginTop: 8, fontWeight: "600" },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#208AEF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: { color: "#fff", fontSize: 28 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 20, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
  },
  modalButtons: { flexDirection: "row", gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 8, alignItems: "center", backgroundColor: "#eee" },
  cancelBtnText: { fontWeight: "600", color: "#666" },
  submitBtn: { flex: 1, padding: 14, borderRadius: 8, alignItems: "center", backgroundColor: "#208AEF" },
  submitBtnText: { color: "#fff", fontWeight: "600" },
  empty: { textAlign: "center", color: "#999", marginTop: 40, fontSize: 16 },
});
