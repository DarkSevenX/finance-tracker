import { prisma } from "@/lib/prisma";

/** Saldo de cuenta: ingresos − gastos − traspasos salientes + traspasos entrantes. */
export async function getAccountBalance(userId: string, accountId: string): Promise<number> {
  const [inc, exp, tout, tin] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId, accountId, kind: "INCOME" },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, accountId, kind: "EXPENSE" },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, accountId, kind: "TRANSFER" },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, toAccountId: accountId, kind: "TRANSFER" },
      _sum: { amount: true },
    }),
  ]);
  return (
    (inc._sum.amount ?? 0) -
    (exp._sum.amount ?? 0) -
    (tout._sum.amount ?? 0) +
    (tin._sum.amount ?? 0)
  );
}
