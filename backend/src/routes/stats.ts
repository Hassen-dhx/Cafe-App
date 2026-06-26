import { FastifyInstance } from "fastify";

export async function statsRoutes(app: FastifyInstance) {
  app.get("/", { preHandler: [app.requireRole("GERANT")] }, async () => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      totalProducts,
      totalOrders,
      todayOrders,
      monthOrders,
      revenue,
      todayRevenue,
      monthRevenue,
      ordersByStatus,
      topProducts,
    ] = await Promise.all([
      app.prisma.user.count(),
      app.prisma.product.count(),
      app.prisma.order.count(),
      app.prisma.order.count({ where: { dateCommande: { gte: startOfDay } } }),
      app.prisma.order.count({ where: { dateCommande: { gte: startOfMonth } } }),
      app.prisma.order.aggregate({ _sum: { montantTotal: true }, where: { statut: "PAYEE" } }),
      app.prisma.order.aggregate({
        _sum: { montantTotal: true },
        where: { statut: "PAYEE", dateCommande: { gte: startOfDay } },
      }),
      app.prisma.order.aggregate({
        _sum: { montantTotal: true },
        where: { statut: "PAYEE", dateCommande: { gte: startOfMonth } },
      }),
      app.prisma.order.groupBy({
        by: ["statut"],
        _count: { id: true },
      }),
      app.prisma.orderLine.groupBy({
        by: ["produitId"],
        _sum: { quantite: true },
        orderBy: { _sum: { quantite: "desc" } },
        take: 10,
      }),
    ]);

    const topProductIds = topProducts.map((tp) => tp.produitId);
    const topProductDetails = topProductIds.length > 0
      ? await app.prisma.product.findMany({ where: { id: { in: topProductIds } } })
      : [];

    return {
      totalUsers,
      totalProducts,
      totalOrders,
      todayOrders,
      monthOrders,
      revenue: revenue._sum.montantTotal || 0,
      todayRevenue: todayRevenue._sum.montantTotal || 0,
      monthRevenue: monthRevenue._sum.montantTotal || 0,
      ordersByStatus: ordersByStatus.map((o) => ({ statut: o.statut, count: o._count.id })),
      topProducts: topProducts.map((tp) => {
        const product = topProductDetails.find((p) => p.id === tp.produitId);
        return { product: product?.nom || "Inconnu", quantity: tp._sum.quantite };
      }),
    };
  });
}
