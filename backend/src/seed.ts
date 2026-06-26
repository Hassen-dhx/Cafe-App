import "dotenv/config";
import { PrismaClient } from "./generated/prisma/client.js";
import { Role } from "./generated/prisma/enums.js";
import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  const gerant = await prisma.user.upsert({
    where: { email: "gerant@cafe.com" },
    update: {},
    create: {
      nom: "Dupont",
      prenom: "Jean",
      email: "gerant@cafe.com",
      motDePasse: hashedPassword,
      telephone: "0123456789",
      role: Role.GERANT,
    },
  });

  const serveur = await prisma.user.upsert({
    where: { email: "serveur@cafe.com" },
    update: {},
    create: {
      nom: "Martin",
      prenom: "Sophie",
      email: "serveur@cafe.com",
      motDePasse: hashedPassword,
      telephone: "0123456790",
      role: Role.SERVEUR,
      matricule: "S001",
    },
  });

  const client = await prisma.user.upsert({
    where: { email: "client@cafe.com" },
    update: {},
    create: {
      nom: "Durand",
      prenom: "Pierre",
      email: "client@cafe.com",
      motDePasse: hashedPassword,
      telephone: "0123456791",
      role: Role.CLIENT,
      adresse: "12 Rue de Paris",
    },
  });

  const boissons = await prisma.category.upsert({
    where: { nom: "Boissons" },
    update: {},
    create: { nom: "Boissons" },
  });

  const plats = await prisma.category.upsert({
    where: { nom: "Plats" },
    update: {},
    create: { nom: "Plats" },
  });

  const desserts = await prisma.category.upsert({
    where: { nom: "Desserts" },
    update: {},
    create: { nom: "Desserts" },
  });

  const products = [
    { nom: "Café Expresso", description: "Café serré italien", prix: 2.5, categoryId: boissons.id },
    { nom: "Cappuccino", description: "Café avec lait mousseux", prix: 3.5, categoryId: boissons.id },
    { nom: "Thé à la menthe", description: "Thé vert frais à la menthe", prix: 3.0, categoryId: boissons.id },
    { nom: "Jus d'orange", description: "Jus d'orange frais pressé", prix: 4.0, categoryId: boissons.id },
    { nom: "Croissant", description: "Croissant au beurre", prix: 2.0, categoryId: plats.id },
    { nom: "Sandwich jambon-beurre", description: "Sandwich traditionnel", prix: 5.5, categoryId: plats.id },
    { nom: "Salade Caesar", description: "Salade avec poulet et parmesan", prix: 8.0, categoryId: plats.id },
    { nom: "Quiche Lorraine", description: "Quiche aux lardons", prix: 6.5, categoryId: plats.id },
    { nom: "Tarte aux pommes", description: "Tarte maison", prix: 4.5, categoryId: desserts.id },
    { nom: "Mousse au chocolat", description: "Mousse onctueuse", prix: 5.0, categoryId: desserts.id },
  ];

  for (const p of products) {
    await prisma.product.create({ data: p });
  }

  console.log("Seed completed successfully");
  console.log(`  Gérant: gerant@cafe.com / password123`);
  console.log(`  Serveur: serveur@cafe.com / password123`);
  console.log(`  Client: client@cafe.com / password123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
