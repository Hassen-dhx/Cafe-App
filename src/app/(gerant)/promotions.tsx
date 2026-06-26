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
import { MaterialIcons } from "@expo/vector-icons";
import { getPromotions, createPromotion, updatePromotion, deletePromotion } from "@/services/api";
import type { Promotion } from "@/types";

export default function GerantPromotionsScreen() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [description, setDescription] = useState("");
  const [type, setType] = useState("POURCENTAGE");
  const [valeur, setValeur] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    setLoading(true);
    try {
      const data = await getPromotions();
      setPromotions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setDescription("");
    setType("POURCENTAGE");
    setValeur("");
    setDateDebut("");
    setDateFin("");
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!description || !valeur || !dateDebut || !dateFin) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }
    const data = { description, type, valeur: parseFloat(valeur), dateDebut, dateFin };
    try {
      if (editing) {
        await updatePromotion(editing.id, data);
      } else {
        await createPromotion(data);
      }
      setModalVisible(false);
      loadPromotions();
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert("Confirmer", "Supprimer cette promotion ?", [
      { text: "Non", style: "cancel" },
      { text: "Oui", style: "destructive", onPress: async () => {
        try {
          await deletePromotion(id);
          loadPromotions();
        } catch (e: any) { Alert.alert("Erreur", e.message); }
      }},
    ]);
  };

  const renderPromotion = ({ item }: { item: Promotion }) => (
    <View style={styles.card}>
      <Text style={styles.cardDesc}>{item.description}</Text>
      <Text style={styles.cardValue}>
        {item.type === "POURCENTAGE" ? `${item.valeur}%` : `${item.valeur} DT`}
      </Text>
      <Text style={styles.cardDates}>
        {new Date(item.dateDebut).toLocaleDateString("fr-FR")} → {new Date(item.dateFin).toLocaleDateString("fr-FR")}
      </Text>
      <View style={styles.cardActions}>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <MaterialIcons name="delete-outline" size={22} color="#e74c3c" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={promotions}
        keyExtractor={(p) => String(p.id)}
        renderItem={renderPromotion}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListEmptyComponent={<Text style={styles.empty}>Aucune promotion</Text>}
      />
      <TouchableOpacity style={styles.fab} onPress={openCreate}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nouvelle promotion</Text>
            <TextInput style={styles.input} placeholder="Description" value={description} onChangeText={setDescription} />
            <View style={styles.typeSelector}>
              {["POURCENTAGE", "MONTANT_FIXE", "PRODUIT_OFFERT"].map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeBtn, type === t && styles.typeBtnActive]}
                  onPress={() => setType(t)}
                >
                  <Text style={[styles.typeBtnText, type === t && styles.typeBtnTextActive]}>
                    {t === "POURCENTAGE" ? "%" : t === "MONTANT_FIXE" ? "€" : "🎁"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={styles.input} placeholder="Valeur" value={valeur} onChangeText={setValeur} keyboardType="decimal-pad" />
            <TextInput style={styles.input} placeholder="Date début (YYYY-MM-DD)" value={dateDebut} onChangeText={setDateDebut} />
            <TextInput style={styles.input} placeholder="Date fin (YYYY-MM-DD)" value={dateFin} onChangeText={setDateFin} />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Enregistrer</Text>
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
  cardDesc: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  cardValue: { fontSize: 14, color: "#208AEF", fontWeight: "700", marginBottom: 4 },
  cardDates: { fontSize: 13, color: "#666" },
  cardActions: { alignItems: "flex-end", marginTop: 8 },
  deleteBtn: { fontSize: 20 },
  fab: {
    position: "absolute", right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28,
    backgroundColor: "#208AEF", justifyContent: "center", alignItems: "center",
    elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4,
  },
  fabText: { color: "#fff", fontSize: 28 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 24 },
  modalContent: { backgroundColor: "#fff", borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 14, fontSize: 16, marginBottom: 16, backgroundColor: "#f9f9f9" },
  typeSelector: { flexDirection: "row", gap: 8, marginBottom: 16 },
  typeBtn: { flex: 1, padding: 10, borderRadius: 8, backgroundColor: "#f0f0f0", alignItems: "center" },
  typeBtnActive: { backgroundColor: "#208AEF" },
  typeBtnText: { fontWeight: "600", color: "#666" },
  typeBtnTextActive: { color: "#fff" },
  modalButtons: { flexDirection: "row", gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 8, alignItems: "center", backgroundColor: "#eee" },
  cancelBtnText: { fontWeight: "600", color: "#666" },
  saveBtn: { flex: 1, padding: 14, borderRadius: 8, alignItems: "center", backgroundColor: "#208AEF" },
  saveBtnText: { color: "#fff", fontWeight: "600" },
  empty: { textAlign: "center", color: "#999", marginTop: 40, fontSize: 16 },
});
