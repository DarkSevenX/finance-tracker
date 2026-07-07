import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { NewCategoryModal } from "@/components/dashboard/modals/new-category-modal";
import { DeleteCategoryButton } from "@/components/forms/delete-category-button";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { bucketLabel } from "@/lib/labels";
import { cn } from "@/lib/cn";
import { listRowClass } from "@/lib/ui-classes";
import { db } from "@/lib/db";
import { Category } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export default async function CategoriasPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const all = await db.select().from(Category)
    .where(eq(Category.userId, session.user.id))
    .orderBy(asc(Category.name));



  function linesFor(kind: "INCOME" | "EXPENSE") {
    const roots = all.filter((c) => c.kind === kind && !c.parentId);
    const out: { id: string; label: string; detail?: string }[] = [];
    for (const r of roots) {
      out.push({
        id: r.id,
        label: r.name,
        // [NOTA AI]: Se removió la visualización del bloque (bucket) por desactivación 50/30/20.
        detail: kind === "INCOME" ? "Ingreso" : "Gasto",
      });
      const children = all.filter((c) => c.parentId === r.id);
      for (const ch of children) {
        out.push({
          id: ch.id,
          label: `↳ ${ch.name}`,
          detail: "Subcategoría",
        });
      }
    }
    return out;
  }

  const rowClass = cn(
    listRowClass,
    "flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between"
  );

  return (
    <div className="w-full min-w-0 space-y-8 sm:space-y-10">
      <PageHeader
        title="Categorías"
        description="Gestiona tus categorías de ingresos y gastos."
        action={<NewCategoryModal />}
      />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <section>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Ingresos</h3>
            <ul className="mt-3 space-y-2">
              {linesFor("INCOME").length === 0 ? (
                <li className="text-sm text-zinc-500">Ninguna aún.</li>
              ) : (
                linesFor("INCOME").map((row) => (
                  <li key={row.id} className={rowClass}>
                    <span className="min-w-0 break-words text-zinc-200">{row.label}</span>
                    <span className="flex shrink-0 flex-wrap items-center justify-end gap-3">
                      <span className="text-xs text-zinc-500">{row.detail}</span>
                      <DeleteCategoryButton id={row.id} />
                    </span>
                  </li>
                ))
              )}
            </ul>
          </section>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Gastos</h3>
            <ul className="mt-3 space-y-2">
              {linesFor("EXPENSE").length === 0 ? (
                <li className="text-sm text-zinc-500">Ninguna aún.</li>
              ) : (
                linesFor("EXPENSE").map((row) => (
                  <li key={row.id} className={rowClass}>
                    <span className="min-w-0 break-words text-zinc-200">{row.label}</span>
                    <span className="flex shrink-0 flex-wrap items-center justify-end gap-3">
                      <span className="text-xs text-zinc-500">{row.detail}</span>
                      <DeleteCategoryButton id={row.id} />
                    </span>
                  </li>
                ))
              )}
            </ul>
          </section>
      </div>
    </div>
  );
}

