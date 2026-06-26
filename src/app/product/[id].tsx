import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getProduct, createReview, getProductReviews } from "@/services/api";
import { useCart } from "@/store/CartContext";
import { useAuth } from "@/store/AuthContext";
import type { Product, Review } from "@/types";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("5");
  const [commentaire, setCommentaire] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { addItem } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [prod, revs] = await Promise.all([
        getProduct(parseInt(id)),
        getProductReviews(parseInt(id)),
      ]);
      setProduct(prod);
      setReviews(revs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (!user) {
      Alert.alert(
        "Connexion requise",
        "Vous devez créer un compte pour ajouter au panier.",
        [
          { text: "Annuler", style: "cancel" },
          { text: "Se connecter", onPress: () => router.push("/(auth)/login" as any) },
        ]
      );
      return;
    }
    addItem(product);
    Alert.alert("Ajouté", `${product.nom} ajouté au panier`);
  };

  const handleReview = async () => {
    if (!product) return;
    if (!user) {
      router.push("/(auth)/login" as any);
      return;
    }
    setSubmitting(true);
    try {
      await createReview({
        produitId: product.id,
        note: parseInt(note),
        commentaire: commentaire || undefined,
      });
      setCommentaire("");
      setNote("5");
      const revs = await getProductReviews(product.id);
      setReviews(revs);
      Alert.alert("Merci !", "Votre avis a été publié");
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !product) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
    <ScrollView>
      <View style={styles.header}>
        <Text style={styles.name}>{product.nom}</Text>
        {product.description ? (
          <Text style={styles.description}>{product.description}</Text>
        ) : null}
        <Text style={styles.price}>{product.prix.toFixed(2)} DT</Text>
        <Text style={styles.category}>{product.category?.nom}</Text>
        {!product.disponibilite && (
          <Text style={styles.unavailable}>Indisponible</Text>
        )}
      </View>

      <TouchableOpacity
        style={[styles.addBtn, !product.disponibilite && { opacity: 0.5 }]}
        onPress={handleAddToCart}
        disabled={!product.disponibilite}
      >
        <Text style={styles.addBtnText}>Ajouter au panier</Text>
      </TouchableOpacity>

      <View style={styles.reviewSection}>
        <Text style={styles.sectionTitle}>Avis ({reviews.length})</Text>
        {reviews.length === 0 ? (
          <Text style={styles.noReviews}>Aucun avis pour le moment</Text>
        ) : (
          reviews.map((r) => (
            <View key={r.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewAuthor}>
                  {r.client?.prenom} {r.client?.nom}
                </Text>
                <Text style={styles.reviewNote}>
                  {"★".repeat(r.note)}{"☆".repeat(5 - r.note)}
                </Text>
              </View>
              {r.commentaire ? (
                <Text style={styles.reviewComment}>{r.commentaire}</Text>
              ) : null}
              <Text style={styles.reviewDate}>
                {new Date(r.dateAvis).toLocaleDateString("fr-FR")}
              </Text>
            </View>
          ))
        )}

        {user?.role === "CLIENT" ? (
          <View style={styles.addReview}>
            <Text style={styles.sectionTitle}>Donner votre avis</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((n) => (
                <TouchableOpacity key={n} onPress={() => setNote(String(n))}>
                  <Text style={[styles.star, parseInt(note) >= n && styles.starActive]}>
                    ★
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.reviewInput}
              placeholder="Votre commentaire (optionnel)"
              value={commentaire}
              onChangeText={setCommentaire}
              multiline
            />
            <TouchableOpacity
              style={[styles.submitReviewBtn, submitting && { opacity: 0.6 }]}
              onPress={handleReview}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitReviewBtnText}>Publier</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : !user ? (
          <TouchableOpacity
            style={styles.loginReviewBtn}
            onPress={() => router.push("/(auth)/login" as any)}
          >
            <Text style={styles.loginReviewBtnText}>
              Connectez-vous pour laisser un avis
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { padding: 24, alignItems: "center" },
  name: { fontSize: 28, fontWeight: "700", marginBottom: 8 },
  description: { fontSize: 16, color: "#666", textAlign: "center", marginBottom: 16 },
  price: { fontSize: 24, fontWeight: "700", color: "#208AEF", marginBottom: 8 },
  category: { fontSize: 14, color: "#999" },
  unavailable: { color: "#e74c3c", fontWeight: "600", marginTop: 8 },
  addBtn: {
    marginHorizontal: 24,
    backgroundColor: "#208AEF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 24,
  },
  addBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  reviewSection: { padding: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 16 },
  noReviews: { color: "#999", marginBottom: 16 },
  reviewCard: {
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  reviewAuthor: { fontWeight: "600" },
  reviewNote: { color: "#f39c12" },
  reviewComment: { color: "#333", marginBottom: 8 },
  reviewDate: { fontSize: 12, color: "#999" },
  addReview: { marginTop: 24 },
  starsRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  star: { fontSize: 28, color: "#ddd" },
  starActive: { color: "#f39c12" },
  reviewInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
    minHeight: 80,
  },
  submitReviewBtn: {
    backgroundColor: "#208AEF",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  submitReviewBtnText: { color: "#fff", fontWeight: "600" },
  loginReviewBtn: {
    borderWidth: 1,
    borderColor: "#208AEF",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  loginReviewBtnText: { color: "#208AEF", fontWeight: "600" },
});
