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
  Switch,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { getProducts, getCategories, createProduct, updateProduct, deleteProduct } from "@/services/api";
import type { Product, Category } from "@/types";

export default function GerantProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [prix, setPrix] = useState("");
  const [categoryId, setCategoryId] = useState<number>(0);
  const [disponibilite, setDisponibilite] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
      setProducts(prods);
      setCategories(cats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingProduct(null);
    setNom("");
    setDescription("");
    setPrix("");
    setCategoryId(categories[0]?.id || 0);
    setDisponibilite(true);
    setModalVisible(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setNom(product.nom);
    setDescription(product.description || "");
    setPrix(String(product.prix));
    setCategoryId(product.categoryId);
    setDisponibilite(product.disponibilite);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!nom || !prix || !categoryId) {
      Alert.alert("Erreur", "Veuillez remplir les champs obligatoires");
      return;
    }
    try {
      const data = { nom, description, prix: parseFloat(prix), categoryId, disponibilite };
      if (editingProduct) {
        await updateProduct(editingProduct.id, data);
      } else {
        await createProduct(data as any);
      }
      setModalVisible(false);
      loadData();
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert("Confirmer", "Supprimer ce produit ?", [
      { text: "Non", style: "cancel" },
      {
        text: "Oui",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteProduct(id);
            loadData();
          } catch (e: any) {
            Alert.alert("Erreur", e.message);
          }
        },
      },
    ]);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity style={styles.card} onPress={() => openEdit(item)}>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{item.nom}</Text>
        <Text style={styles.cardCategory}>{item.category?.nom}</Text>
        <Text style={styles.cardPrice}>{item.prix.toFixed(2)} DT</Text>
      </View>
      <View style={styles.cardActions}>
        {!item.disponibilite && <Text style={styles.disabledTag}>Indisponible</Text>}
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <MaterialIcons name="delete-outline" size={22} color="#e74c3c" />
        </TouchableOpacity>
      </View>
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
        data={products}
        keyExtractor={(p) => String(p.id)}
        renderItem={renderProduct}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListEmptyComponent={<Text style={styles.empty}>Aucun produit</Text>}
      />
      <TouchableOpacity style={styles.fab} onPress={openCreate}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingProduct ? "Modifier" : "Nouveau"} produit
            </Text>
            <TextInput style={styles.input} placeholder="Nom *" value={nom} onChangeText={setNom} />
            <TextInput style={styles.input} placeholder="Description" value={description} onChangeText={setDescription} multiline />
            <TextInput style={styles.input} placeholder="Prix *" value={prix} onChangeText={setPrix} keyboardType="decimal-pad" />
            <View style={styles.catSelector}>
              {categories.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.catBtn, categoryId === c.id && styles.catBtnActive]}
                  onPress={() => setCategoryId(c.id)}
                >
                  <Text style={[styles.catText, categoryId === c.id && styles.catTextActive]}>{c.nom}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.switchRow}>
              <Text>Disponible</Text>
              <Switch value={disponibilite} onValueChange={setDisponibilite} />
            </View>
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
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    alignItems: "center",
  },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  cardCategory: { fontSize: 13, color: "#666" },
  cardPrice: { fontSize: 16, fontWeight: "700", color: "#208AEF", marginTop: 4 },
  cardActions: { alignItems: "flex-end", gap: 8 },
  disabledTag: { fontSize: 11, color: "#e74c3c", fontWeight: "600" },
  deleteBtn: { fontSize: 20 },
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
  modalContent: { backgroundColor: "#fff", borderRadius: 16, padding: 24 },
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
  catSelector: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  catBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, backgroundColor: "#f0f0f0" },
  catBtnActive: { backgroundColor: "#208AEF" },
  catText: { color: "#666", fontWeight: "600" },
  catTextActive: { color: "#fff" },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalButtons: { flexDirection: "row", gap: 12 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 8, alignItems: "center", backgroundColor: "#eee" },
  cancelBtnText: { fontWeight: "600", color: "#666" },
  saveBtn: { flex: 1, padding: 14, borderRadius: 8, alignItems: "center", backgroundColor: "#208AEF" },
  saveBtnText: { color: "#fff", fontWeight: "600" },
  empty: { textAlign: "center", color: "#999", marginTop: 40, fontSize: 16 },
});
