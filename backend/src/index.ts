import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.js";
import { authRoutes } from "./routes/auth.js";
import { productRoutes } from "./routes/products.js";
import { categoryRoutes } from "./routes/categories.js";
import { orderRoutes } from "./routes/orders.js";
import { reservationRoutes } from "./routes/reservations.js";
import { paymentRoutes } from "./routes/payments.js";
import { reviewRoutes } from "./routes/reviews.js";
import { promotionRoutes } from "./routes/promotions.js";
import { userRoutes } from "./routes/users.js";
import { statsRoutes } from "./routes/stats.js";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const server = Fastify({ logger: true });

server.decorate("prisma", prisma);

server.decorate("authenticate", async (request: any, reply: any) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({ message: "Non authentifié" });
  }
});

server.decorate("requireRole", (...roles: string[]) => {
  return async (request: any, reply: any) => {
    await server.authenticate(request, reply);
    if (!roles.includes(request.user.role)) {
      return reply.status(403).send({ message: "Accès refusé" });
    }
  };
});

await server.register(cors, { origin: true });
await server.register(jwt, { secret: process.env.JWT_SECRET || "fallback-secret" });

await server.register(authRoutes, { prefix: "/api/auth" });
await server.register(productRoutes, { prefix: "/api/products" });
await server.register(categoryRoutes, { prefix: "/api/categories" });
await server.register(orderRoutes, { prefix: "/api/orders" });
await server.register(reservationRoutes, { prefix: "/api/reservations" });
await server.register(paymentRoutes, { prefix: "/api/payments" });
await server.register(reviewRoutes, { prefix: "/api/reviews" });
await server.register(promotionRoutes, { prefix: "/api/promotions" });
await server.register(userRoutes, { prefix: "/api/users" });
await server.register(statsRoutes, { prefix: "/api/stats" });

server.get("/api/health", async () => ({ status: "ok" }));

const start = async () => {
  try {
    const port = parseInt(process.env.PORT || "3000");
    await server.listen({ port, host: "0.0.0.0" });
    console.log(`Server running on port ${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();

export { server, prisma };
