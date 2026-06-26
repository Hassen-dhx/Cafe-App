export type Role = "CLIENT" | "SERVEUR" | "GERANT";

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  role: Role;
  adresse?: string;
  matricule?: string;
}

export interface Category {
  id: number;
  nom: string;
  _count?: { products: number };
}

export interface Product {
  id: number;
  nom: string;
  description?: string;
  prix: number;
  disponibilite: boolean;
  imageUrl?: string;
  categoryId: number;
  category?: Category;
  reviews?: Review[];
}

export interface OrderLine {
  id: number;
  quantite: number;
  prixUnitaire: number;
  produit: Product;
}

export interface Order {
  id: number;
  dateCommande: string;
  statut: OrderStatus;
  montantTotal: number;
  client?: User;
  serveur?: User;
  orderLines: OrderLine[];
  payment?: Payment;
}

export type OrderStatus =
  | "EN_ATTENTE"
  | "ACCEPTEE"
  | "EN_PREPARATION"
  | "PRETE"
  | "SERVIE"
  | "PAYEE";

export interface Payment {
  id: number;
  montant: number;
  modePaiement: string;
  datePaiement: string;
  statut: string;
}

export interface Reservation {
  id: number;
  date: string;
  heure: string;
  nombrePersonnes: number;
  statut: string;
  client?: User;
}

export interface Review {
  id: number;
  note: number;
  commentaire?: string;
  dateAvis: string;
  client?: User;
}

export interface Promotion {
  id: number;
  description: string;
  type: string;
  valeur: number;
  dateDebut: string;
  dateFin: string;
}

export interface Stats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  todayOrders: number;
  monthOrders: number;
  revenue: number;
  todayRevenue: number;
  monthRevenue: number;
  ordersByStatus: { statut: string; count: number }[];
  topProducts: { product: string; quantity: number }[];
}

export interface RegisterData {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  telephone?: string;
  adresse?: string;
}
