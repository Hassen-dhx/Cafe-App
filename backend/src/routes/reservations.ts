import { FastifyInstance } from "fastify";
import { z } from "zod";

const reservationSchema = z.object({
  date: z.string(),
  heure: z.string(),
  nombrePersonnes: z.number().int().positive(),
});

export async function reservationRoutes(app: FastifyInstance) {
  app.post("/", { preHandler: [app.requireRole("CLIENT")] }, async (request, reply) => {
    const data = reservationSchema.parse(request.body);
    const userId = (request.user as any).id;
    const reservation = await app.prisma.reservation.create({
      data: {
        date: new Date(data.date),
        heure: data.heure,
        nombrePersonnes: data.nombrePersonnes,
        clientId: userId,
      },
    });
    return reply.status(201).send(reservation);
  });

  app.get("/", { preHandler: [app.authenticate] }, async (request) => {
    const user = request.user as any;
    const where: any = {};
    if (user.role === "CLIENT") where.clientId = user.id;
    return app.prisma.reservation.findMany({
      where,
      include: { client: { select: { id: true, nom: true, prenom: true } } },
      orderBy: { date: "desc" },
    });
  });

  app.patch("/:id", { preHandler: [app.requireRole("GERANT")] }, async (request, reply) => {
    const { id } = request.params as any;
    const { statut } = request.body as any;
    return app.prisma.reservation.update({
      where: { id: parseInt(id) },
      data: { statut },
    });
  });

  app.delete("/:id", { preHandler: [app.requireRole("CLIENT", "GERANT")] }, async (request, reply) => {
    const { id } = request.params as any;
    const user = request.user as any;
    const where: any = { id: parseInt(id) };
    if (user.role === "CLIENT") where.clientId = user.id;
    await app.prisma.reservation.delete({ where });
    return reply.status(204).send();
  });
}
