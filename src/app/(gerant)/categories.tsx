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
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/services/api";
import type { Category } from "@/types";

export default function GerantCategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      await createCategory(newName.trim());
      setNewName("");
      loadCategories();
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!newName.trim()) return;
    try {
      await updateCategory(id, newName.trim());
      setNewName("");
      setEditingId(null);
      loadCategories();
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert("Confirmer", "Supprimer cette catégorie ?", [
      { text: "Non", style: "cancel" },
      {
        text: "Oui",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteCategory(id);
            loadCategories();
          } catch (e: any) {
            Alert.alert("Erreur", e.message);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.createRow}>
        <TextInput
          style={styles.input}
          placeholder="Nom de la catégorie"
          value={newName}
          onChangeText={setNewName}
        />
        <TouchableOpacity
          style={styles.addBtn}
          onPress={editingId ? () => handleUpdate(editingId) : handleCreate}
        >
          <Text style={styles.addBtnText}>{editingId ? "Modifier" : "Ajouter"}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={categories}
        keyExtractor={(c) => String(c.id)}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>{item.nom}</Text>
              <Text style={styles.cardCount}>{item._count?.products || 0} produit(s)</Text>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity
                onPress={() => {
                  setEditingId(item.id);
                  setNewName(item.nom);
                }}
              >
                <MaterialIcons name="edit" size={20} color="#208AEF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <MaterialIcons name="delete-outline" size={20} color="#e74c3c" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  createRow: {
    flexDirection: "row",
    padding: 16,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  addBtn: {
    backgroundColor: "#208AEF",
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: "center",
  },
  addBtnText: { color: "#fff", fontWeight: "600" },
  card: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    alignItems: "center",
  },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: "600" },
  cardCount: { fontSize: 13, color: "#666", marginTop: 4 },
  cardActions: { flexDirection: "row", gap: 12 },
  editBtn: { fontSize: 18 },
  deleteBtn: { fontSize: 18 },
});
