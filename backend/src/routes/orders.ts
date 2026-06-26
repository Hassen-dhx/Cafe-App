import { FastifyInstance } from "fastify";
import { z } from "zod";

const createOrderSchema = z.object({
  lignes: z.array(z.object({
    produitId: z.number().int().positive(),
    quantite: z.number().int().positive().default(1),
  })).min(1),
});

export async function orderRoutes(app: FastifyInstance) {
  app.post("/", { preHandler: [app.requireRole("CLIENT")] }, async (request, reply) => {
    const data = createOrderSchema.parse(request.body);
    const userId = (request.user as any).id;

    const products = await app.prisma.product.findMany({
      where: { id: { in: data.lignes.map((l) => l.produitId) } },
    });

    const orderLines = data.lignes.map((l) => {
      const product = products.find((p) => p.id === l.produitId)!;
      return {
        produitId: l.produitId,
        quantite: l.quantite,
        prixUnitaire: product.prix,
      };
    });

    const montantTotal = orderLines.reduce((sum, l) => sum + l.prixUnitaire * l.quantite, 0);

    const order = await app.prisma.order.create({
      data: {
        clientId: userId,
        montantTotal,
        orderLines: { create: orderLines },
      },
      include: { orderLines: { include: { produit: true } } },
    });

    return reply.status(201).send(order);
  });

  app.get("/", { preHandler: [app.authenticate] }, async (request) => {
    const user = request.user as any;
    const where: any = {};

    if (user.role === "CLIENT") where.clientId = user.id;
    if (user.role === "SERVEUR") where.serveurId = user.id;

    return app.prisma.order.findMany({
      where,
      include: {
        orderLines: { include: { produit: true } },
        client: { select: { id: true, nom: true, prenom: true } },
        serveur: { select: { id: true, nom: true, prenom: true } },
        payment: true,
      },
      orderBy: { dateCommande: "desc" },
    });
  });

  app.get("/en-attente", { preHandler: [app.requireRole("SERVEUR", "GERANT")] }, async () => {
    return app.prisma.order.findMany({
      where: { statut: "EN_ATTENTE" },
      include: {
        orderLines: { include: { produit: true } },
        client: { select: { id: true, nom: true, prenom: true } },
      },
      orderBy: { dateCommande: "asc" },
    });
  });

  app.get("/:id", { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as any;
    const order = await app.prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        orderLines: { include: { produit: true } },
        client: { select: { id: true, nom: true, prenom: true } },
        serveur: { select: { id: true, nom: true, prenom: true } },
        payment: true,
      },
    });
    if (!order) return reply.status(404).send({ message: "Commande non trouvée" });
    return order;
  });

  app.patch("/:id/statut", { preHandler: [app.requireRole("SERVEUR", "GERANT")] }, async (request, reply) => {
    const { id } = request.params as any;
    const { statut } = request.body as any;
    const userId = (request.user as any).id;

    const updateData: any = { statut };
    if (statut === "ACCEPTEE") updateData.serveurId = userId;

    const order = await app.prisma.order.update({
      where: { id: parseInt(id) },
      data: updateData,
    });
    return order;
  });
}
