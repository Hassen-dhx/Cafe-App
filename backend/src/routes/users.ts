import { FastifyInstance } from "fastify";
import { z } from "zod";
import bcrypt from "bcryptjs";

export async function userRoutes(app: FastifyInstance) {
  app.get("/", { preHandler: [app.requireRole("GERANT")] }, async () => {
    return app.prisma.user.findMany({
      select: { id: true, nom: true, prenom: true, email: true, telephone: true, role: true, adresse: true, matricule: true },
      orderBy: { nom: "asc" },
    });
  });

  app.put("/:id", { preHandler: [app.requireRole("GERANT")] }, async (request, reply) => {
    const { id } = request.params as any;
    const data = z.object({
      nom: z.string().optional(),
      prenom: z.string().optional(),
      email: z.string().email().optional(),
      telephone: z.string().optional(),
      role: z.enum(["CLIENT", "SERVEUR", "GERANT"]).optional(),
      adresse: z.string().optional(),
      matricule: z.string().optional(),
    }).parse(request.body);

    return app.prisma.user.update({
      where: { id: parseInt(id) },
      data,
      select: { id: true, nom: true, prenom: true, email: true, telephone: true, role: true, adresse: true, matricule: true },
    });
  });

  app.delete("/:id", { preHandler: [app.requireRole("GERANT")] }, async (request, reply) => {
    const { id } = request.params as any;
    await app.prisma.user.delete({ where: { id: parseInt(id) } });
    return reply.status(204).send();
  });
}
