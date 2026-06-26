import { FastifyInstance } from "fastify";
import { z } from "zod";

const categorySchema = z.object({ nom: z.string().min(1) });

export async function categoryRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    return app.prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { nom: "asc" },
    });
  });

  app.post("/", { preHandler: [app.requireRole("GERANT")] }, async (request, reply) => {
    const data = categorySchema.parse(request.body);
    const category = await app.prisma.category.create({ data });
    return reply.status(201).send(category);
  });

  app.put("/:id", { preHandler: [app.requireRole("GERANT")] }, async (request, reply) => {
    const { id } = request.params as any;
    const data = categorySchema.parse(request.body);
    return app.prisma.category.update({ where: { id: parseInt(id) }, data });
  });

  app.delete("/:id", { preHandler: [app.requireRole("GERANT")] }, async (request, reply) => {
    const { id } = request.params as any;
    await app.prisma.category.delete({ where: { id: parseInt(id) } });
    return reply.status(204).send();
  });
}
