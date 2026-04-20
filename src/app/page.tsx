import { Ghost } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { BudgetDonutSlot } from "@/components/landing/budget-donut-slot";
import { GhostField } from "@/components/landing/ghost-field";
import { LandingEducation } from "@/components/landing/landing-education";
import { btnPrimaryClass, btnSecondaryClass } from "@/lib/ui-classes";
import { cn } from "@/lib/cn";

export default async function Home() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-zinc-950">
      <GhostField />
      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pb-24 pt-8 sm:pb-32 sm:pt-10 lg:pb-40 lg:pt-11">
        <header className="shrink-0 border-b border-zinc-800/80 pb-4 sm:pb-5">
          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
            <div className="flex items-center gap-2">
              <Ghost
                className="size-[18px] shrink-0 text-emerald-400/95 sm:size-5"
                aria-hidden
              />
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-emerald-500/90 sm:text-[13px]">
                Boo Money
              </p>
            </div>
            <p className="text-xs leading-snug text-zinc-500 sm:max-w-md sm:text-right sm:text-[13px]">
              Herramienta personal para ver el flujo del mes sin perder el detalle.
            </p>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col justify-center py-8 sm:py-10">
          <div className="grid w-full gap-14 lg:grid-cols-12 lg:items-center lg:gap-12">
            <section className="lg:col-span-7">
              <h1 className="max-w-[22ch] text-[2rem] font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl sm:leading-[1.02] lg:max-w-none lg:text-[3.15rem] xl:text-[3.35rem]">
                Ingresos y gastos en orden, con la regla{" "}
                <span className="text-emerald-400">50/30/20</span> a tu medida.
              </h1>
              <p className="mt-8 max-w-xl text-base leading-relaxed text-zinc-400 sm:mt-10 sm:text-lg sm:leading-relaxed">
                Varias cuentas, categorías y subcategorías, y control por bloques: necesidades, deseos y
                ahorros.
              </p>
              <div className="mt-12 flex flex-wrap gap-3 sm:mt-14">
                <Link
                  href="/register"
                  className={cn(
                    btnPrimaryClass,
                    "border border-emerald-200/25 px-7 py-3 text-[15px] transition-transform hover:-translate-y-0.5"
                  )}
                >
                  Crear cuenta
                </Link>
                <Link
                  href="/login"
                  className={cn(
                    btnSecondaryClass,
                    "border-emerald-900/30 px-7 py-3 text-[15px] transition-transform hover:-translate-y-0.5 hover:border-emerald-700/40 hover:bg-emerald-950/30"
                  )}
                >
                  Iniciar sesión
                </Link>
              </div>
            </section>

            <aside className="lg:col-span-5">
              <BudgetDonutSlot />
            </aside>
          </div>
        </div>

        <LandingEducation />
      </main>
    </div>
  );
}
