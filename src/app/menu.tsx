import { getCategories, getProducts } from "@/services/api";
import { useAuth } from "@/store/AuthContext";
import { useCart } from "@/store/CartContext";
import type { Category, Product } from "@/types";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MenuScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

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

  const filtered = products.filter((p) => {
    if (selectedCat && p.categoryId !== selectedCat) return false;
    if (search && !p.nom.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const handleAddToCart = (product: Product) => {
    if (!isAuthenticated) {
      Alert.alert(
        "Connexion requise",
        "Vous devez créer un compte pour ajouter au panier.",
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
    addItem(product);
    Alert.alert("Ajouté", `${product.nom} ajouté au panier`);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push(`/product/${item.id}` as any)}
    >
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.nom}</Text>
        {item.description ? (
          <Text style={styles.productDesc} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
        <Text style={styles.productPrice}>{item.prix.toFixed(2)} DT</Text>
      </View>
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => handleAddToCart(item)}
      >
        <Text style={styles.addBtnText}>+</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {!isAuthenticated ? (
        <View style={styles.userBar}>
          <Text style={styles.userBarText}>Découvrez notre carte</Text>
          <TouchableOpacity
            style={styles.nouveauxBtn}
            onPress={() => router.push("/(auth)/login" as any)}
          >
            <Text style={styles.nouveauxBtnText}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.userBar}>
          <Text style={styles.userBarText}>Connecté</Text>
          <TouchableOpacity
            style={styles.monCompteBtn}
            onPress={() => router.push("/(client)/profile" as any)}
          >
            <Text style={styles.monCompteBtnText}>Mon compte</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Rechercher un produit..."
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
        />
      </View>
      <View style={styles.categoriesWrapper}>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(c) => String(c.id)}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.catBtn,
                selectedCat === item.id && styles.catBtnActive,
              ]}
              onPress={() =>
                setSelectedCat(selectedCat === item.id ? null : item.id)
              }
            >
              <Text
                style={[
                  styles.catText,
                  selectedCat === item.id && styles.catTextActive,
                ]}
              >
                {item.nom}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(p) => String(p.id)}
        renderItem={renderProduct}
        contentContainerStyle={styles.productList}
        ListEmptyComponent={
          <Text style={styles.empty}>Aucun produit trouvé</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  userBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  userBarText: { fontSize: 14, color: "#666" },
  nouveauxBtn: {
    backgroundColor: "#208AEF",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  nouveauxBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  monCompteBtn: {
    backgroundColor: "#208AEF",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#208AEF",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  monCompteBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  searchContainer: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  searchBar: {
    padding: 14,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    backgroundColor: "#fff",
    fontSize: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoriesWrapper: { paddingBottom: 4 },
  catList: { gap: 10, paddingHorizontal: 20, paddingVertical: 8 },
  catBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#e8e8e8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  catBtnActive: {
    backgroundColor: "#208AEF",
    borderColor: "#208AEF",
  },
  catText: { color: "#444", fontWeight: "700", fontSize: 14 },
  catTextActive: { color: "#fff" },
  productCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  productInfo: { flex: 1 },
  productName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
    color: "#1a1a1a",
  },
  productDesc: { fontSize: 13, color: "#888", marginBottom: 4 },
  productPrice: { fontSize: 17, fontWeight: "800", color: "#208AEF" },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#208AEF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#208AEF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  addBtnText: { color: "#fff", fontSize: 22, fontWeight: "700", marginTop: -2 },
  productList: { padding: 20, gap: 14 },
  empty: { textAlign: "center", color: "#999", marginTop: 40, fontSize: 16 },
});
