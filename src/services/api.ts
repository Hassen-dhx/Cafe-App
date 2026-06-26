import type { User, Product, Category, Order, Reservation, Review, Promotion, Payment, Stats, RegisterData } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const API_URL = Platform.select({
  android: "http://10.0.2.2:3000/api",
  default: "http://localhost:3000/api",
})!;

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export async function saveToken(token: string) {
  try {
    await AsyncStorage.setItem("token", token);
  } catch (e) {
    console.error("Failed to save token", e);
  }
}

export async function getToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem("token");
  } catch (e) {
    return null;
  }
}

export async function removeToken() {
  try {
    await AsyncStorage.removeItem("token");
  } catch (e) {
    console.error("Failed to remove token", e);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (res.status === 204) return undefined as T;
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Erreur serveur");
  }
  return data;
}

// Auth
export function login(email: string, motDePasse: string) {
  return request<{ user: User; token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, motDePasse }),
  });
}

export function register(data: RegisterData) {
  return request<{ user: User; token: string }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getMe() {
  return request<User>("/auth/me");
}

// Products
export function getProducts(params?: { categorie?: number; search?: string }) {
  const query = new URLSearchParams();
  if (params?.categorie) query.set("categorie", String(params.categorie));
  if (params?.search) query.set("search", params.search);
  const qs = query.toString();
  return request<Product[]>(`/products${qs ? `?${qs}` : ""}`);
}

export function getProduct(id: number) {
  return request<Product>(`/products/${id}`);
}

export function createProduct(data: Partial<Product> & { categoryId: number }) {
  return request<Product>("/products", { method: "POST", body: JSON.stringify(data) });
}

export function updateProduct(id: number, data: Partial<Product>) {
  return request<Product>(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export function deleteProduct(id: number) {
  return request<void>(`/products/${id}`, { method: "DELETE" });
}

// Categories
export function getCategories() {
  return request<Category[]>("/categories");
}

export function createCategory(nom: string) {
  return request<Category>("/categories", { method: "POST", body: JSON.stringify({ nom }) });
}

export function updateCategory(id: number, nom: string) {
  return request<Category>(`/categories/${id}`, { method: "PUT", body: JSON.stringify({ nom }) });
}

export function deleteCategory(id: number) {
  return request<void>(`/categories/${id}`, { method: "DELETE" });
}

// Orders
export function createOrder(lignes: { produitId: number; quantite: number }[]) {
  return request<Order>("/orders", { method: "POST", body: JSON.stringify({ lignes }) });
}

export function getOrders() {
  return request<Order[]>("/orders");
}

export function getPendingOrders() {
  return request<Order[]>("/orders/en-attente");
}

export function getOrder(id: number) {
  return request<Order>(`/orders/${id}`);
}

export function updateOrderStatus(id: number, statut: string) {
  return request<Order>(`/orders/${id}/statut`, {
    method: "PATCH",
    body: JSON.stringify({ statut }),
  });
}

// Reservations
export function createReservation(data: { date: string; heure: string; nombrePersonnes: number }) {
  return request<Reservation>("/reservations", { method: "POST", body: JSON.stringify(data) });
}

export function getReservations() {
  return request<Reservation[]>("/reservations");
}

export function updateReservation(id: number, statut: string) {
  return request<Reservation>(`/reservations/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ statut }),
  });
}

export function deleteReservation(id: number) {
  return request<void>(`/reservations/${id}`, { method: "DELETE" });
}

// Payments
export function createPayment(data: { commandeId: number; montant: number; modePaiement: string }) {
  return request<Payment>("/payments", { method: "POST", body: JSON.stringify(data) });
}

// Reviews
export function createReview(data: { produitId: number; note: number; commentaire?: string }) {
  return request<Review>("/reviews", { method: "POST", body: JSON.stringify(data) });
}

export function getProductReviews(produitId: number) {
  return request<Review[]>(`/reviews/produit/${produitId}`);
}

// Promotions
export function getPromotions() {
  return request<Promotion[]>("/promotions");
}

export function getActivePromotions() {
  return request<Promotion[]>("/promotions/actives");
}

export function createPromotion(data: Partial<Promotion>) {
  return request<Promotion>("/promotions", { method: "POST", body: JSON.stringify(data) });
}

export function updatePromotion(id: number, data: Partial<Promotion>) {
  return request<Promotion>(`/promotions/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export function deletePromotion(id: number) {
  return request<void>(`/promotions/${id}`, { method: "DELETE" });
}

// Users (manager only)
export function getUsers() {
  return request<User[]>("/users");
}

export function updateUser(id: number, data: Partial<User>) {
  return request<User>(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export function deleteUser(id: number) {
  return request<void>(`/users/${id}`, { method: "DELETE" });
}

// Stats
export function getStats() {
  return request<Stats>("/stats");
}
