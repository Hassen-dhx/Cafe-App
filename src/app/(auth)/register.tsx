import { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/store/AuthContext";
import type { Role } from "@/types";

const ROLE_ROUTE: Record<Role, string> = {
  CLIENT: "/(client)/cart",
  SERVEUR: "/(serveur)/orders",
  GERANT: "/(gerant)/products",
};

export default function RegisterScreen() {
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [telephone, setTelephone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    setError("");
    setLoading(true);
    try {
      const user = await register({ nom, prenom, email, motDePasse, telephone });
      router.replace(ROLE_ROUTE[user.role] as any);
    } catch (e: any) {
      setError(e.message || "Erreur d'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Inscription client</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TextInput style={styles.input} placeholder="Nom" value={nom} onChangeText={setNom} />
          <TextInput style={styles.input} placeholder="Prénom" value={prenom} onChangeText={setPrenom} />
          <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          <TextInput style={styles.input} placeholder="Mot de passe (6+ caractères)" value={motDePasse} onChangeText={setMotDePasse} secureTextEntry />
          <TextInput style={styles.input} placeholder="Téléphone (optionnel)" value={telephone} onChangeText={setTelephone} keyboardType="phone-pad" />

          <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>S'inscrire</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace("/(auth)/login" as any)}>
            <Text style={styles.link}>Déjà un compte ? Se connecter</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  inner: { flex: 1 },
  content: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingVertical: 40 },
  title: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 24 },
  error: { color: "red", textAlign: "center", marginBottom: 16 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 14, fontSize: 16, marginBottom: 16, backgroundColor: "#f9f9f9" },
  button: { backgroundColor: "#208AEF", padding: 16, borderRadius: 8, alignItems: "center", marginTop: 8 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  link: { color: "#208AEF", textAlign: "center", marginTop: 24, fontSize: 16 },
});
