import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AccountForm } from "@/components/forms/account-form";
import { DeleteAccountButton } from "@/components/forms/delete-account-button";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { getAccountBalance } from "@/lib/account-balance";
import { walletLabel } from "@/lib/labels";
import { formatCOP } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export default async function CuentasPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const accounts = await prisma.financialAccount.findMany({
    where: { userId: session.user.id },
    orderBy: { name: "asc" },
  });

  const [incomeRows, expenseRows, balances] = await Promise.all([
    prisma.transaction.groupBy({
      by: ["accountId"],
      where: { userId: session.user.id, kind: "INCOME" },
      _sum: { amount: true },
    }),
    prisma.transaction.groupBy({
      by: ["accountId"],
      where: { userId: session.user.id, kind: "EXPENSE" },
      _sum: { amount: true },
    }),
    Promise.all(accounts.map((a) => getAccountBalance(session.user.id, a.id))),
  ]);

  const map = new Map<string, { income: number; expense: number; balance: number }>();
  for (let i = 0; i < accounts.length; i++) {
    map.set(accounts[i].id, { income: 0, expense: 0, balance: balances[i] ?? 0 });
  }
  for (const row of incomeRows) {
    const cur = map.get(row.accountId) ?? { income: 0, expense: 0, balance: 0 };
    cur.income = row._sum.amount ?? 0;
    map.set(row.accountId, cur);
  }
  for (const row of expenseRows) {
    const cur = map.get(row.accountId) ?? { income: 0, expense: 0, balance: 0 };
    cur.expense = row._sum.amount ?? 0;
    map.set(row.accountId, cur);
  }

  return (
    <div className="w-full min-w-0 space-y-8 sm:space-y-10">
      <PageHeader
        title="Cuentas"
        description="Efectivo, bancos y tarjetas. El saldo se calcula con todos los movimientos."
      />

      <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Nueva cuenta</h2>
          <p className="mt-1 text-sm text-zinc-500">Montos en pesos colombianos, sin decimales.</p>
          <div className="mt-6">
            <AccountForm />
          </div>
        </Card>

        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Tus cuentas</h2>
          {accounts.length === 0 ? (
            <p className="text-sm text-zinc-500">Crea al menos una cuenta para registrar ingresos y gastos.</p>
          ) : (
            <ul className="space-y-3">
              {accounts.map((a) => {
                const s = map.get(a.id) ?? { income: 0, expense: 0, balance: 0 };
                const balance = s.balance;
                const pct = s.income > 0 ? Math.round((s.expense / s.income) * 100) : s.expense > 0 ? 100 : 0;
                return (
                  <li key={a.id}>
                    <Card className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-zinc-100">{a.name}</p>
                          <p className="text-xs text-zinc-500">{walletLabel(a.kind)}</p>
                          <p className="mt-3 text-xs leading-relaxed text-zinc-500">
                            Ingresos {formatCOP(s.income)} · Gastos {formatCOP(s.expense)} · Gastado{" "}
                            {pct}% sobre ingresos
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold tabular-nums text-zinc-50">{formatCOP(balance)}</p>
                          <div className="mt-2">
                            <DeleteAccountButton id={a.id} />
                          </div>
                        </div>
                      </div>
                    </Card>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
