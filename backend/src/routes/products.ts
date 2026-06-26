import { FastifyInstance } from "fastify";
import { z } from "zod";

const productSchema = z.object({
  nom: z.string().min(1),
  description: z.string().optional(),
  prix: z.number().positive(),
  disponibilite: z.boolean().default(true),
  imageUrl: z.string().optional(),
  categoryId: z.number().int().positive(),
});

export async function productRoutes(app: FastifyInstance) {
  app.get("/", async (request) => {
    const { categorie, search } = request.query as any;
    const where: any = {};
    if (categorie) where.categoryId = parseInt(categorie);
    if (search) where.nom = { contains: search, mode: "insensitive" };
    return app.prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { nom: "asc" },
    });
  });

  app.get("/:id", async (request, reply) => {
    const { id } = request.params as any;
    const product = await app.prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: { category: true, reviews: { include: { client: { select: { nom: true, prenom: true } } } } },
    });
    if (!product) return reply.status(404).send({ message: "Produit non trouvé" });
    return product;
  });

  app.post("/", { preHandler: [app.requireRole("GERANT")] }, async (request, reply) => {
    const data = productSchema.parse(request.body);
    const product = await app.prisma.product.create({ data });
    return reply.status(201).send(product);
  });

  app.put("/:id", { preHandler: [app.requireRole("GERANT")] }, async (request, reply) => {
    const { id } = request.params as any;
    const data = productSchema.partial().parse(request.body);
    const product = await app.prisma.product.update({ where: { id: parseInt(id) }, data });
    return product;
  });

  app.delete("/:id", { preHandler: [app.requireRole("GERANT")] }, async (request, reply) => {
    const { id } = request.params as any;
    await app.prisma.product.delete({ where: { id: parseInt(id) } });
    return reply.status(204).send();
  });
}
