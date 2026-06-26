import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/store/AuthContext";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
        </Text>
      </View>
      <Text style={styles.name}>
        {user?.prenom} {user?.nom}
      </Text>
      <Text style={styles.email}>{user?.email}</Text>
      <Text style={styles.role}>
        {user?.role === "CLIENT" ? "Client" : user?.role === "SERVEUR" ? "Serveur" : "Gérant"}
      </Text>

      <View style={styles.infoSection}>
        <InfoRow label="Téléphone" value={user?.telephone || "—"} />
        <InfoRow label="Adresse" value={user?.adresse || "—"} />
        {user?.matricule ? <InfoRow label="Matricule" value={user.matricule} /> : null}
      </View>

      <TouchableOpacity
        style={styles.menuBtn}
        onPress={() => router.push("/menu" as any)}
      >
        <Text style={styles.menuBtnText}>Voir le menu</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutBtnText}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", alignItems: "center", paddingTop: 60 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#208AEF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: { color: "#fff", fontSize: 28, fontWeight: "700" },
  name: { fontSize: 22, fontWeight: "700", marginBottom: 4 },
  email: { fontSize: 16, color: "#666", marginBottom: 4 },
  role: {
    fontSize: 14,
    color: "#208AEF",
    fontWeight: "600",
    backgroundColor: "#e8f4ff",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoSection: {
    alignSelf: "stretch",
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 40,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  infoLabel: { fontSize: 15, color: "#666" },
  infoValue: { fontSize: 15, fontWeight: "600" },
  menuBtn: {
    backgroundColor: "#208AEF",
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  menuBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  logoutBtn: {
    backgroundColor: "#e74c3c",
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 8,
  },
  logoutBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
