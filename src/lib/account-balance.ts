import { db } from "@/lib/db";
import { Transaction } from "@/lib/db/schema";
import { eq, and, sum } from "drizzle-orm";

/** Saldo de cuenta: ingresos − gastos − traspasos salientes + traspasos entrantes. */
export async function getAccountBalance(userId: string, accountId: string): Promise<number> {
  const [inc, exp, tout, tin] = await Promise.all([
    db.select({ value: sum(Transaction.amount) })
      .from(Transaction)
      .where(and(eq(Transaction.userId, userId), eq(Transaction.accountId, accountId), eq(Transaction.kind, "INCOME"))),
    db.select({ value: sum(Transaction.amount) })
      .from(Transaction)
      .where(and(eq(Transaction.userId, userId), eq(Transaction.accountId, accountId), eq(Transaction.kind, "EXPENSE"))),
    db.select({ value: sum(Transaction.amount) })
      .from(Transaction)
      .where(and(eq(Transaction.userId, userId), eq(Transaction.accountId, accountId), eq(Transaction.kind, "TRANSFER"))),
    db.select({ value: sum(Transaction.amount) })
      .from(Transaction)
      .where(and(eq(Transaction.userId, userId), eq(Transaction.toAccountId, accountId), eq(Transaction.kind, "TRANSFER"))),
  ]);
  
  return (
    (Number(inc[0]?.value) || 0) -
    (Number(exp[0]?.value) || 0) -
    (Number(tout[0]?.value) || 0) +
    (Number(tin[0]?.value) || 0)
  );
}

