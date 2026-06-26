import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "@/store/AuthContext";

export default function ServeurProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <MaterialIcons name="person" size={36} color="#fff" />
      </View>
      <Text style={styles.name}>
        {user?.prenom} {user?.nom}
      </Text>
      <Text style={styles.email}>{user?.email}</Text>
      <Text style={styles.role}>Serveur</Text>

      <View style={styles.infoSection}>
        <InfoRow label="Matricule" value={user?.matricule || "—"} />
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <MaterialIcons name="logout" size={20} color="#fff" />
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
    backgroundColor: "#e67e22",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  name: { fontSize: 22, fontWeight: "700", marginBottom: 4 },
  email: { fontSize: 16, color: "#666", marginBottom: 4 },
  role: {
    fontSize: 14,
    color: "#e67e22",
    fontWeight: "600",
    backgroundColor: "#fdf2e9",
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
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#e74c3c",
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 8,
  },
  logoutBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});