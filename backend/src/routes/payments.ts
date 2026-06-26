import { FastifyInstance } from "fastify";
import { z } from "zod";

const paymentSchema = z.object({
  commandeId: z.number().int().positive(),
  montant: z.number().positive(),
  modePaiement: z.enum(["CARTE", "ESPECES", "CHEQUE", "EN_LIGNE"]),
});

export async function paymentRoutes(app: FastifyInstance) {
  app.post("/", { preHandler: [app.requireRole("CLIENT")] }, async (request, reply) => {
    const data = paymentSchema.parse(request.body);
    const userId = (request.user as any).id;

    const order = await app.prisma.order.findUnique({
      where: { id: data.commandeId },
    });
    if (!order || order.clientId !== userId) {
      return reply.status(403).send({ message: "Accès refusé" });
    }

    const payment = await app.prisma.payment.create({
      data: {
        montant: data.montant,
        modePaiement: data.modePaiement,
        commandeId: data.commandeId,
        statut: "EFFECTUE",
      },
    });

    await app.prisma.order.update({
      where: { id: data.commandeId },
      data: { statut: "PAYEE" },
    });

    return reply.status(201).send(payment);
  });

  app.get("/", { preHandler: [app.requireRole("GERANT")] }, async () => {
    return app.prisma.payment.findMany({
      include: { commande: { include: { client: { select: { nom: true, prenom: true } } } } },
      orderBy: { datePaiement: "desc" },
    });
  });
}
