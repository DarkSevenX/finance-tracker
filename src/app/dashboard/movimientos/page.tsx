import { format } from "date-fns";
import { es } from "date-fns/locale";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DeleteTransactionButton } from "@/components/forms/delete-transaction-button";
import { TransactionExpenseForm } from "@/components/forms/transaction-expense-form";
import { TransactionIncomeForm } from "@/components/forms/transaction-income-form";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { categoryLabel, expenseCategoriesForForm, incomeOptions } from "@/lib/category-options";
import { allocationLabel, bucketLabel, walletLabel } from "@/lib/labels";
import { formatCOP } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { tableHeadClass, tableRowClass } from "@/lib/ui-classes";
import type { BudgetBucket } from "@prisma/client";

export default async function MovimientosPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [accounts, categories, transactions] = await Promise.all([
    prisma.financialAccount.findMany({
      where: { userId: session.user.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true, kind: true },
    }),
    prisma.category.findMany({ where: { userId: session.user.id } }),
    prisma.transaction.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
      take: 150,
      include: { category: true, account: true, toAccount: true },
    }),
  ]);

  const incOpts = incomeOptions(categories);
  const expOpts = expenseCategoriesForForm(categories);
  const accOpts = accounts.map((a) => ({ id: a.id, name: `${a.name} (${walletLabel(a.kind)})` }));

  const catList = categories;
  const byId = new Map(catList.map((c) => [c.id, c]));

  function resolveBucket(catId: string): BudgetBucket | null {
    let cur = byId.get(catId);
    const vis = new Set<string>();
    while (cur) {
      if (vis.has(cur.id)) return null;
      vis.add(cur.id);
      if (cur.bucket) return cur.bucket;
      if (!cur.parentId) return null;
      cur = byId.get(cur.parentId);
    }
    return null;
  }

  return (
    <div className="w-full min-w-0 space-y-8 sm:space-y-10">
      <PageHeader
        title="Movimientos"
        description="Registra ingresos y gastos en COP. Puedes repartir ingresos o destinarlos al 100% a un bloque."
      />

      <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Ingreso</h2>
          <div className="mt-6">
            <TransactionIncomeForm accounts={accOpts} categories={incOpts} />
          </div>
        </Card>
        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Gasto</h2>
          <div className="mt-6">
            <TransactionExpenseForm accounts={accOpts} categories={expOpts} />
          </div>
        </Card>
      </div>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Historial</h2>
        <div className="overflow-x-auto rounded-xl border border-zinc-800/90 bg-zinc-900/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] [-webkit-overflow-scrolling:touch]">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead className={tableHeadClass}>
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3">Cuenta</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3 text-right">Monto</th>
                <th className="w-20 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-zinc-500">
                    Aún no hay movimientos.
                  </td>
                </tr>
              ) : (
                transactions.map((t) => {
                  if (t.kind === "TRANSFER") {
                    return (
                      <tr key={t.id} className={tableRowClass}>
                        <td className="px-4 py-3 tabular-nums text-zinc-500">
                          {format(t.date, "d MMM yyyy", { locale: es })}
                        </td>
                        <td className="px-4 py-3 text-sky-400/90">Traspaso</td>
                        <td className="px-4 py-3 text-zinc-200">{t.title}</td>
                        <td className="px-4 py-3 text-zinc-500">
                          {t.account.name}
                          {t.toAccount ? (
                            <>
                              {" "}
                              <span className="text-zinc-600">→</span> {t.toAccount.name}
                            </>
                          ) : null}
                        </td>
                        <td className="max-w-[220px] px-4 py-3 text-xs text-zinc-600">—</td>
                        <td className="px-4 py-3 text-right font-medium tabular-nums text-zinc-300">
                          {formatCOP(t.amount)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <DeleteTransactionButton id={t.id} />
                        </td>
                      </tr>
                    );
                  }
                  const b =
                    t.kind === "EXPENSE" && t.categoryId
                      ? resolveBucket(t.categoryId)
                      : t.kind === "EXPENSE"
                        ? t.expenseBucket ?? "NEEDS"
                        : null;
                  return (
                    <tr key={t.id} className={tableRowClass}>
                      <td className="px-4 py-3 tabular-nums text-zinc-500">
                        {format(t.date, "d MMM yyyy", { locale: es })}
                      </td>
                      <td className="px-4 py-3 text-zinc-400">
                        {t.kind === "INCOME" ? "Ingreso" : "Gasto"}
                      </td>
                      <td className="px-4 py-3 text-zinc-200">{t.title}</td>
                      <td className="px-4 py-3 text-zinc-500">{t.account.name}</td>
                      <td className="max-w-[220px] px-4 py-3 text-xs text-zinc-500">
                        {t.category ? categoryLabel(t.category, byId) : "Sin categoría"}
                        {t.kind === "INCOME" && t.allocationMode
                          ? ` · ${allocationLabel(t.allocationMode)}`
                          : ""}
                        {b ? ` · ${bucketLabel(b)}` : ""}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-medium tabular-nums ${
                          t.kind === "INCOME" ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {t.kind === "INCOME" ? "+" : "−"}
                        {formatCOP(t.amount)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DeleteTransactionButton id={t.id} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
