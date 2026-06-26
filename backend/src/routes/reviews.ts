import { FastifyInstance } from "fastify";
import { z } from "zod";

const reviewSchema = z.object({
  produitId: z.number().int().positive(),
  note: z.number().int().min(1).max(5),
  commentaire: z.string().optional(),
});

export async function reviewRoutes(app: FastifyInstance) {
  app.post("/", { preHandler: [app.requireRole("CLIENT")] }, async (request, reply) => {
    const data = reviewSchema.parse(request.body);
    const userId = (request.user as any).id;

    const existing = await app.prisma.review.findUnique({
      where: { clientId_produitId: { clientId: userId, produitId: data.produitId } },
    });
    if (existing) {
      return reply.status(400).send({ message: "Vous avez déjà évalué ce produit" });
    }

    const review = await app.prisma.review.create({
      data: { ...data, clientId: userId },
      include: { client: { select: { nom: true, prenom: true } } },
    });
    return reply.status(201).send(review);
  });

  app.get("/produit/:produitId", async (request) => {
    const { produitId } = request.params as any;
    return app.prisma.review.findMany({
      where: { produitId: parseInt(produitId) },
      include: { client: { select: { id: true, nom: true, prenom: true } } },
      orderBy: { dateAvis: "desc" },
    });
  });
}
