import { FastifyInstance } from "fastify";
import { z } from "zod";

const promotionSchema = z.object({
  description: z.string().min(1),
  type: z.enum(["POURCENTAGE", "MONTANT_FIXE", "PRODUIT_OFFERT"]),
  valeur: z.number().positive(),
  dateDebut: z.string(),
  dateFin: z.string(),
});

export async function promotionRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    return app.prisma.promotion.findMany({
      orderBy: { dateDebut: "desc" },
    });
  });

  app.get("/actives", async () => {
    const now = new Date();
    return app.prisma.promotion.findMany({
      where: { dateDebut: { lte: now }, dateFin: { gte: now } },
      orderBy: { dateDebut: "desc" },
    });
  });

  app.post("/", { preHandler: [app.requireRole("GERANT")] }, async (request, reply) => {
    const data = promotionSchema.parse(request.body);
    const promotion = await app.prisma.promotion.create({
      data: {
        ...data,
        dateDebut: new Date(data.dateDebut),
        dateFin: new Date(data.dateFin),
      },
    });
    return reply.status(201).send(promotion);
  });

  app.put("/:id", { preHandler: [app.requireRole("GERANT")] }, async (request, reply) => {
    const { id } = request.params as any;
    const data = promotionSchema.partial().parse(request.body);
    const updateData: any = { ...data };
    if (data.dateDebut) updateData.dateDebut = new Date(data.dateDebut);
    if (data.dateFin) updateData.dateFin = new Date(data.dateFin);
    return app.prisma.promotion.update({ where: { id: parseInt(id) }, data: updateData });
  });

  app.delete("/:id", { preHandler: [app.requireRole("GERANT")] }, async (request, reply) => {
    const { id } = request.params as any;
    await app.prisma.promotion.delete({ where: { id: parseInt(id) } });
    return reply.status(204).send();
  });
}
