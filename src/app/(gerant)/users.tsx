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
import { MaterialIcons } from "@expo/vector-icons";
import { getUsers, updateUser, deleteUser } from "@/services/api";
import type { User, Role } from "@/types";

const ROLE_LABELS: Record<Role, string> = {
  CLIENT: "Client",
  SERVEUR: "Serveur",
  GERANT: "Gérant",
};

const ROLE_COLORS: Record<Role, string> = {
  CLIENT: "#3498db",
  SERVEUR: "#e67e22",
  GERANT: "#27ae60",
};

export default function GerantUsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = async (user: User) => {
    const roles: Role[] = ["CLIENT", "SERVEUR", "GERANT"];
    const currentIndex = roles.indexOf(user.role);
    const nextRole = roles[(currentIndex + 1) % roles.length];
    try {
      await updateUser(user.id, { role: nextRole } as any);
      loadUsers();
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert("Confirmer", "Supprimer cet utilisateur ?", [
      { text: "Non", style: "cancel" },
      {
        text: "Oui",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteUser(id);
            loadUsers();
          } catch (e: any) {
            Alert.alert("Erreur", e.message);
          }
        },
      },
    ]);
  };

  const renderUser = ({ item }: { item: User }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>
          {item.prenom} {item.nom}
        </Text>
        <Text style={styles.cardEmail}>{item.email}</Text>
        <Text style={styles.cardPhone}>{item.telephone || "—"}</Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.roleBadge, { backgroundColor: ROLE_COLORS[item.role] }]}
          onPress={() => handleRoleToggle(item)}
        >
          <Text style={styles.roleText}>{ROLE_LABELS[item.role]}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <MaterialIcons name="delete-outline" size={22} color="#e74c3c" />
        </TouchableOpacity>
      </View>
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
        data={users}
        keyExtractor={(u) => String(u.id)}
        renderItem={renderUser}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListEmptyComponent={<Text style={styles.empty}>Aucun utilisateur</Text>}
      />
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
  cardEmail: { fontSize: 13, color: "#666" },
  cardPhone: { fontSize: 13, color: "#666" },
  cardActions: { alignItems: "flex-end", gap: 8 },
  roleBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  roleText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  deleteBtn: { fontSize: 20 },
  empty: { textAlign: "center", color: "#999", marginTop: 40, fontSize: 16 },
});
