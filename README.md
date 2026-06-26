# Application Café

## 1. Client

## Consultation Menu

![Image Alt](https://github.com/Hassen-dhx/Cafe-App/blob/885e0f9bcebf2fb92cceeebe3f536e5bc021dc40/cafe-app%20images/client/3%20panier.png)

## login

![Image Alt](https://github.com/Hassen-dhx/Cafe-App/blob/885e0f9bcebf2fb92cceeebe3f536e5bc021dc40/cafe-app%20images/login.png)

## Mon panier

![Image Alt](https://github.com/Hassen-dhx/Cafe-App/blob/885e0f9bcebf2fb92cceeebe3f536e5bc021dc40/cafe-app%20images/client/mon%20panier.png)

## Mes Commandes

![Image Alt](https://github.com/Hassen-dhx/Cafe-App/blob/885e0f9bcebf2fb92cceeebe3f536e5bc021dc40/cafe-app%20images/client/mes%20commandes.png)

## 2. Serveur

## Commandes en attente

![Image Alt](https://github.com/Hassen-dhx/Cafe-App/blob/885e0f9bcebf2fb92cceeebe3f536e5bc021dc40/cafe-app%20images/serveur/commandes%20en%20attente.png)

## Toues les commandes

![Image Alt](https://github.com/Hassen-dhx/Cafe-App/blob/885e0f9bcebf2fb92cceeebe3f536e5bc021dc40/cafe-app%20images/serveur/toues%20les%20commandes.png)

## 3. Gérant

## Produit

![Image Alt](https://github.com/Hassen-dhx/Cafe-App/blob/885e0f9bcebf2fb92cceeebe3f536e5bc021dc40/cafe-app%20images/gerant/produit.png)

## Categorie

![Image Alt](https://github.com/Hassen-dhx/Cafe-App/blob/885e0f9bcebf2fb92cceeebe3f536e5bc021dc40/cafe-app%20images/gerant/cat%C3%A9gorie.png)

## Statistiques

![Image Alt](https://github.com/Hassen-dhx/Cafe-App/blob/885e0f9bcebf2fb92cceeebe3f536e5bc021dc40/cafe-app%20images/gerant/statistiques.png)

## Produit

![Image Alt](https://github.com/Hassen-dhx/Cafe-App/blob/885e0f9bcebf2fb92cceeebe3f536e5bc021dc40/cafe-app%20images/gerant/utilisateurs.png)

---

## Représentation textuelle UML

# 1. Diagramme de cas d'utilisation

## Acteurs

- Client
- Serveur
- Gérant

## Client

### Authentification

- S'inscrire
- Se connecter

### Consultation

- Consulter le menu (sans authentification)
- Rechercher un produit
- Consulter les détails d'un produit

### Gestion du panier

- Ajouter un produit au panier
- Modifier la quantité d'un produit
- Supprimer un produit du panier
- Vider le panier

### Commandes

- Passer une commande
- Payer la commande
- Suivre l'état de la commande
- Consulter l'historique des commandes

### Réservation

- Réserver une table

### Profil

- Modifier son profil

### Avis

- Donner une évaluation

---

## Serveur

### Authentification

- Se connecter

### Gestion des commandes

- Consulter les commandes en attente
- Accepter une commande
- Préparer une commande
- Marquer une commande comme prête
- Servir une commande
- Mettre à jour le statut d'une commande
- Consulter l'historique des commandes

### Profil

- Consulter son profil

---

## Gérant

### Authentification

- Se connecter

### Gestion des produits

- Ajouter un produit
- Modifier un produit
- Supprimer un produit

### Gestion des catégories

- Ajouter une catégorie
- Modifier une catégorie
- Supprimer une catégorie

### Gestion des utilisateurs

- Consulter les utilisateurs
- Modifier le rôle d'un utilisateur
- Supprimer un utilisateur

### Gestion des serveurs

- Assigner le rôle de serveur

### Gestion des réservations

- Consulter les réservations
- Confirmer une réservation
- Annuler une réservation

### Gestion des promotions

- Ajouter une promotion
- Modifier une promotion
- Supprimer une promotion

### Statistiques

- Consulter les statistiques de vente

---

# 2. Diagramme de classes

## Classe `User`

### Attributs

| Nom        | Type     |
| ---------- | -------- |
| id         | Int      |
| nom        | String   |
| prenom     | String   |
| email      | String   |
| motDePasse | String   |
| telephone  | String?  |
| role       | Role     |
| adresse    | String?  |
| matricule  | String?  |
| createdAt  | DateTime |
| updatedAt  | DateTime |

### Relations

- clientOrders → Order[]
- serveurOrders → Order[]
- reservations → Reservation[]
- reviews → Review[]

---

## Classe `Category`

### Attributs

| Nom | Type   |
| --- | ------ |
| id  | Int    |
| nom | String |

### Relations

- products → Product[]

---

## Classe `Product`

### Attributs

| Nom           | Type    |
| ------------- | ------- |
| id            | Int     |
| nom           | String  |
| description   | String? |
| prix          | Float   |
| disponibilite | Boolean |
| imageUrl      | String? |

### Relations

- category → Category
- orderLines → OrderLine[]
- reviews → Review[]

---

## Classe `Order`

### Attributs

| Nom          | Type        |
| ------------ | ----------- |
| id           | Int         |
| dateCommande | DateTime    |
| statut       | OrderStatus |
| montantTotal | Float       |

### Relations

- client → User
- serveur → User
- orderLines → OrderLine[]
- payment → Payment

---

## Classe `OrderLine`

### Attributs

| Nom          | Type  |
| ------------ | ----- |
| id           | Int   |
| quantite     | Int   |
| prixUnitaire | Float |

### Relations

- commande → Order
- produit → Product

---

## Classe `Payment`

### Attributs

| Nom          | Type          |
| ------------ | ------------- |
| id           | Int           |
| montant      | Float         |
| modePaiement | String        |
| datePaiement | DateTime      |
| statut       | PaymentStatus |

### Relations

- commande → Order

---

## Classe `Reservation`

### Attributs

| Nom             | Type              |
| --------------- | ----------------- |
| id              | Int               |
| date            | DateTime          |
| heure           | String            |
| nombrePersonnes | Int               |
| statut          | ReservationStatus |

### Relations

- client → User

---

## Classe `Review`

### Attributs

| Nom         | Type     |
| ----------- | -------- |
| id          | Int      |
| note        | Int      |
| commentaire | String?  |
| dateAvis    | DateTime |

### Relations

- client → User
- produit → Product

---

## Classe `Promotion`

### Attributs

| Nom         | Type     |
| ----------- | -------- |
| id          | Int      |
| description | String   |
| type        | String   |
| valeur      | Float    |
| dateDebut   | DateTime |
| dateFin     | DateTime |

---

# Énumérations

## Role

- CLIENT
- SERVEUR
- GERANT

## OrderStatus

- EN_ATTENTE
- ACCEPTEE
- EN_PREPARATION
- PRETE
- SERVIE
- PAYEE

## PaymentStatus

- EN_ATTENTE
- EFFECTUE
- ECHOUE
- REMBOURSE

## ReservationStatus

- EN_ATTENTE
- CONFIRMEE
- ANNULEE

---

# Relations entre les classes

```text
                    User
                     │
       ┌─────────────┼─────────────┐
       │             │             │
   Client        Serveur       Gérant
       │
       ├──────────────┐
       │              │
 Reservation       Review
       │              │
       │              └──────────────► Product
       │
       └──────────────► Order ◄────────── Serveur
                            │
              ┌─────────────┼─────────────┐
              │                           │
        OrderLine                    Payment
              │
              ▼
           Product
              │
              ▼
          Category
```

---

# Guide d'initialisation - Application Café

## 📋 Prérequis

[![Node.js Version][node-version-image]][node-url]
[![PostgreSQL Version][postgresql-version-image]][postgresql-url]
[![Expo CLI][expo-cli-image]][expo-cli-url]
[![Git][git-image]][git-url]

---

- **Node.js** ≥ 20
- **PostgreSQL** ≥ 14 (local ou Docker)
- **Expo CLI** : `npm install -g expo-cli`
- **Git**

<!-- Badges references -->

[node-version-image]: https://img.shields.io/badge/node-%3E%3D20-green.svg
[node-url]: https://nodejs.org/
[postgresql-version-image]: https://img.shields.io/badge/postgresql-%3E%3D14-blue.svg
[postgresql-url]: https://www.postgresql.org/
[expo-cli-image]: https://img.shields.io/badge/expo%20cli-global-orange.svg
[expo-cli-url]: https://docs.expo.dev/workflow/expo-cli/
[git-image]: https://img.shields.io/badge/git-latest-lightgrey.svg
[git-url]: https://git-scm.com/

---

## 1. Cloner et installer

```bash
git clone <repo-url> projet-cafe
cd projet-cafe

# Backend
cd backend
npm install
npx prisma generate

# Frontend
cd ../frontend
npm install
```

> Note: Dans ce projet, le frontend est à la racine (`src/`), le backend dans `backend/`.

---

## 2. Configuration de base de données PostgreSQL

### Option A : Docker (recommandé)

```bash
docker run -d \
  --name cafe-postgres \
  -e POSTGRES_USER=cafe \
  -e POSTGRES_PASSWORD=cafe123 \
  -e POSTGRES_DB=cafe \
  -p 5432:5432 \
  postgres:16
```

### Option B : PostgreSQL local

Créez la base et l'utilisateur :

```sql
CREATE DATABASE cafe;
CREATE USER cafe WITH PASSWORD 'cafe123';
GRANT ALL PRIVILEGES ON DATABASE cafe TO cafe;
```

---

## 3. Variables d'environnement

### Backend (`backend/.env`)

```env
DATABASE_URL="postgresql://cafe:cafe123@localhost:5432/cafe?schema=public"
JWT_SECRET="votre-secret-jwt-super-secret-changez-moi"
PORT=3000
NODE_ENV=development
```

### Frontend (`.env` à la racine)

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
# Pour Android émulateur : http://10.0.2.2:3000/api
```

---

## 4. Initialiser la base de données

```bash
cd backend

# Pousser le schéma (crée les tables)
npx prisma db push

# OU avec migrations (production)
npx prisma migrate dev --name init

# Seed données de démo
npm run db:seed
```

Le seed crée :

- Gérant: `gerant@cafe.com` / `password123`
- Serveur: `serveur@cafe.com` / `password123`
- Client: `client@cafe.com` / `password123`
- Catégories + produits exemples

---

## 5. Lancer l'application

### Terminal 1 - Backend

```bash
cd backend
npm run dev
# Server running on port 3000
```

### Terminal 2 - Frontend

```bash
# À la racine du projet
npm start
# ou
npx expo start
```

Choisissez :

- **w** : Web (http://localhost:8081)
- **a** : Android (émulateur ou device)
- **i** : iOS (simulateur macOS uniquement)

---

## 6. Comptes de test

| Rôle    | Email            | Mot de passe |
| ------- | ---------------- | ------------ |
| Gérant  | gerant@cafe.com  | password123  |
| Serveur | serveur@cafe.com | password123  |
| Client  | client@cafe.com  | password123  |

---

## 7. Commandes utiles

### Backend

```bash
cd backend

# Générer Prisma Client après modification schema
npm run db:generate

# Push schéma sans migration
npm run db:push

# Migration avec historique
npm run db:migrate

# Studio Prisma (UI base de données)
npx prisma studio

# Reset DB + reseed
npx prisma migrate reset --force && npm run db:seed
```

### Frontend

```bash
# Nettoyer cache Expo
npx expo start -c

# Build web production
npx expo export -p web

# Lint / Typecheck
npx expo lint
npx tsc --noEmit
```

---

## 8. Dépannage fréquent

### "Failed to fetch" sur web

- Vérifiez que le backend tourne sur `http://localhost:3000`
- CORS configuré dans `backend/src/index.ts` (origin: true + méthodes PATCH/OPTIONS)
- Sur web Expo, l'API doit être accessible depuis `localhost:8081`

### Erreur Prisma "Can't reach database"

- Vérifiez `DATABASE_URL` dans `backend/.env`
- PostgreSQL doit être démarré (`docker ps` ou `systemctl status postgresql`)
- Port 5432 accessible

### Erreur JWT "Invalid signature"

- `JWT_SECRET` identique dans `.env` backend
- Redémarrez le backend après changement

### Android : "Network request failed"

- Utilisez `10.0.2.2` au lieu de `localhost` dans `EXPO_PUBLIC_API_URL`
- `adb reverse tcp:3000 tcp:3000` si device physique

### "Cannot find module @expo/vector-icons"

```bash
npm install @expo/vector-icons
npx expo start -c
```

---

## 9. Structure des dossiers

```
projet-cafe/
├── backend/
│   ├── src/
│   │   ├── index.ts          # Fastify + plugins + routes
│   │   ├── routes/           # Routes par domaine
│   │   ├── generated/prisma/ # Client Prisma généré
│   │   └── seed.ts           # Données de démo
│   ├── prisma/schema.prisma  # Schéma BDD
│   └── package.json
├── src/
│   ├── app/                  # Expo Router (file-based routing)
│   │   ├── (auth)/           # Connexion/Inscription
│   │   ├── (client)/         # Espace client (tabs)
│   │   ├── (serveur)/        # Espace serveur (tabs)
│   │   ├── (gerant)/         # Espace gérant (tabs)
│   │   ├── menu.tsx          # Menu public
│   │   └── product/[id].tsx  # Détail produit
│   ├── services/api.ts       # Client API (fetch + token)
│   ├── store/                # Contextes React (Auth, Cart)
│   ├── types/index.ts        # Types TypeScript partagés
│   └── components/           # Composants réutilisables
├── diagrams.txt              # Documentation UML
├── guide.md                  # Ce fichier
└── package.json
```

---

## 10. Déploiement (aperçu)

### Backend (Docker)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

Build: `npm run build` (compile TypeScript → `dist/`)

### Frontend (EAS Build)

```bash
npm install -g eas-cli
eas login
eas build --platform all
```

### Variables production

- `DATABASE_URL` : PostgreSQL managé (Neon, Supabase, Railway, etc.)
- `JWT_SECRET` : 64+ caractères aléatoires
- `NODE_ENV=production`
- `EXPO_PUBLIC_API_URL` : URL HTTPS backend

---

## 11. Tests rapides

1. **Client** : `client@cafe.com` → Menu → Ajouter au panier → Commander
2. **Serveur** : `serveur@cafe.com` → Commandes → Accepter → Préparer → Servir
3. **Gérant** : `gerant@cafe.com` → Produits → Créer/Modifier/Supprimer

---

## 12. Support

- Logs backend : `backend/src/index.ts` → `Fastify({ logger: true })`
- Logs frontend : Console navigateur (F12) ou `expo start` terminal
- Prisma Studio : `npx prisma studio` (port 5555)
