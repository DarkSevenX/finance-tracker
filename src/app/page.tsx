import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Card } from "@/components/ui/card";
import { btnPrimaryClass, btnSecondaryClass } from "@/lib/ui-classes";
import { cn } from "@/lib/cn";

export default async function Home() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-zinc-950">
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16 sm:py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Presupuesto personal</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Ingresos y gastos en pesos colombianos, con la regla 50/30/20 a tu medida.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-zinc-500">
          Varias cuentas, categorías y subcategorías, y control por bloques: necesidades, deseos y
          ahorros.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/register" className={cn(btnPrimaryClass, "px-6")}>
            Crear cuenta
          </Link>
          <Link href="/login" className={cn(btnSecondaryClass, "px-6")}>
            Iniciar sesión
          </Link>
        </div>
        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          {[
            { t: "Cuentas", d: "Efectivo, bancos y tarjetas con saldo por cuenta." },
            { t: "50/30/20", d: "Porcentajes editables e ingresos sin reparto si quieres." },
            { t: "Categorías", d: "Subcategorías opcionales para ordenar gastos." },
          ].map((c) => (
            <Card key={c.t} className="p-5">
              <h3 className="text-sm font-medium text-zinc-100">{c.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">{c.d}</p>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
