"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { signOutAction } from "@/actions/auth";
import { cn } from "@/lib/cn";

const links = [
  { href: "/dashboard", label: "Resumen" },
  { href: "/dashboard/cuentas", label: "Cuentas" },
  { href: "/dashboard/categorias", label: "Categorías" },
  { href: "/dashboard/movimientos", label: "Movimientos" },
];

function Branding() {
  return (
    <div className="px-1">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">Finanzas</p>
      <p className="mt-0.5 text-sm font-semibold text-zinc-100">COP</p>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const close = () => {
      if (mq.matches) setMobileOpen(false);
    };
    mq.addEventListener("change", close);
    return () => mq.removeEventListener("change", close);
  }, []);

  const navLinkClass = (active: boolean) =>
    cn(
      "rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors",
      active ? "bg-zinc-800 text-white" : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200"
    );

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex flex-col gap-1" aria-label="Secciones">
      {links.map((l) => {
        const active =
          pathname === l.href || (l.href !== "/dashboard" && pathname.startsWith(l.href));
        return (
          <Link key={l.href} href={l.href} className={navLinkClass(active)} onClick={onNavigate}>
            {l.label}
          </Link>
        );
      })}
    </nav>
  );

  const SignOutBlock = ({ className }: { className?: string }) => (
    <form action={signOutAction} className={className}>
      <button
        type="submit"
        className="w-full rounded-lg px-3 py-2.5 text-left text-[13px] text-zinc-500 transition-colors hover:bg-zinc-900 hover:text-zinc-300"
      >
        Cerrar sesión
      </button>
    </form>
  );

  return (
    <>
      <div className="flex min-h-[100dvh] flex-col bg-zinc-950 lg:flex-row">
        {/* Barra superior solo en móvil / tablet */}
        <header
          className={cn(
            "sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-zinc-800/90 bg-zinc-950/95 px-4 backdrop-blur-sm",
            "pt-[max(0.25rem,env(safe-area-inset-top))] lg:hidden"
          )}
        >
          <button
            type="button"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600"
            aria-expanded={mobileOpen}
            aria-controls="dashboard-mobile-nav"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" aria-hidden />
            <span className="sr-only">Abrir menú</span>
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-zinc-100">Finanzas COP</p>
            <p className="truncate text-[11px] text-zinc-500">50/30/20</p>
          </div>
        </header>

        {/* Sidebar fijo solo en escritorio */}
        <aside className="hidden w-52 shrink-0 flex-col border-r border-zinc-800/90 bg-zinc-950 px-3 py-8 lg:flex">
          <div className="mb-6">
            <Branding />
          </div>
          <NavLinks />
          <SignOutBlock className="mt-8" />
        </aside>

        <div className="min-h-0 min-w-0 flex-1 lg:min-h-[100dvh]">
          <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">{children}</div>
        </div>
      </div>

      {/* Fuera del flex: overlay + cajón móvil */}
      <div
        className={cn(
          "fixed inset-0 z-[55] bg-black/60 transition-opacity duration-200 lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-hidden={!mobileOpen}
        onClick={() => setMobileOpen(false)}
      />
      <aside
        id="dashboard-mobile-nav"
        className={cn(
          "fixed left-0 top-0 z-[60] flex h-[100dvh] w-[min(18rem,88vw)] flex-col border-r border-zinc-800/90 bg-zinc-950 shadow-xl transition-transform duration-200 ease-out lg:hidden",
          "pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]",
          mobileOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Navegación"
        aria-hidden={!mobileOpen}
      >
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3">
          <Branding />
          <button
            type="button"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" aria-hidden />
            <span className="sr-only">Cerrar menú</span>
          </button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-4">
          <NavLinks onNavigate={() => setMobileOpen(false)} />
          <SignOutBlock className="mt-6 border-t border-zinc-800/80 pt-4" />
        </div>
      </aside>
    </>
  );
}
