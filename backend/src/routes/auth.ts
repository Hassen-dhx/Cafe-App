import { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  nom: z.string().min(1),
  prenom: z.string().min(1),
  email: z.string().email(),
  motDePasse: z.string().min(6),
  telephone: z.string().optional(),
  adresse: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  motDePasse: z.string().min(1),
});

export async function authRoutes(app: FastifyInstance) {
  app.post("/register", async (request, reply) => {
    const data = registerSchema.parse(request.body);
    const existing = await app.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return reply.status(400).send({ message: "Email déjà utilisé" });
    }
    const hashedPassword = await bcrypt.hash(data.motDePasse, 10);
    const user = await app.prisma.user.create({
      data: {
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        motDePasse: hashedPassword,
        telephone: data.telephone,
        role: "CLIENT",
        adresse: data.adresse,
      },
      select: { id: true, nom: true, prenom: true, email: true, role: true },
    });
    const token = app.jwt.sign({ id: user.id, role: user.role });
    return { user, token };
  });

  app.post("/login", async (request, reply) => {
    const data = loginSchema.parse(request.body);
    const user = await app.prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      return reply.status(401).send({ message: "Email ou mot de passe incorrect" });
    }
    const valid = await bcrypt.compare(data.motDePasse, user.motDePasse);
    if (!valid) {
      return reply.status(401).send({ message: "Email ou mot de passe incorrect" });
    }
    const token = app.jwt.sign({ id: user.id, role: user.role });
    const { motDePasse, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  });

  app.get("/me", { preHandler: [app.authenticate] }, async (request) => {
    const user = await app.prisma.user.findUnique({
      where: { id: (request.user as any).id },
      select: { id: true, nom: true, prenom: true, email: true, telephone: true, role: true, adresse: true, matricule: true },
    });
    return user;
  });
}
