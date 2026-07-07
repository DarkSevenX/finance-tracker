"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOutAction } from "@/actions/auth";
import { cn } from "@/lib/cn";

export function AppShell({ 
  children,
  user
}: { 
  children: React.ReactNode,
  user: any
}) {
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

  const name = user?.name || "Usuario";
  const email = user?.email || "";
  const initials = name.slice(0, 2).toUpperCase();

  const links = [
    {
      href: "/dashboard",
      label: "Resumen",
      svg: (
        <svg xmlns="http://www.w3.org/2000/svg" className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9.5 12 3l9 6.5" />
          <path d="M5 10v10h14V10" />
        </svg>
      )
    },
    {
      href: "/dashboard/cuentas",
      label: "Cuentas",
      svg: (
        <svg xmlns="http://www.w3.org/2000/svg" className="size-4 shrink-0 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="14" x="2" y="5" rx="2" />
          <line x1="2" x2="22" y1="10" y2="10" />
        </svg>
      )
    },
    {
      href: "/dashboard/categorias",
      label: "Categorías",
      svg: (
        <svg xmlns="http://www.w3.org/2000/svg" className="size-4 shrink-0 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      )
    },
    {
      href: "/dashboard/movimientos",
      label: "Movimientos",
      svg: (
        <svg xmlns="http://www.w3.org/2000/svg" className="size-4 shrink-0 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 7 7 17" />
          <path d="M17 17H7V7" />
        </svg>
      )
    }
  ];

  const GhostIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 10h.01" />
      <path d="M15 10h.01" />
      <path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z" />
    </svg>
  );

  const renderNavLinks = () => (
    <nav className="flex flex-1 flex-col gap-0.5" aria-label="Secciones">
      {links.map((l) => {
        const isActive = pathname === l.href || (l.href !== "/dashboard" && pathname.startsWith(l.href));
        if (isActive) {
          return (
            <Link key={l.href} href={l.href} className="group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-white transition-colors" onClick={() => setMobileOpen(false)}>
              <span className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-emerald-400"></span>
              <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-emerald-500/15 to-transparent"></span>
              <div className="relative text-emerald-400 z-10">{l.svg}</div>
              <span className="relative z-10">{l.label}</span>
            </Link>
          );
        }
        return (
          <Link key={l.href} href={l.href} className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-zinc-500 transition-colors hover:bg-zinc-900 hover:text-zinc-200" onClick={() => setMobileOpen(false)}>
            <div className="text-zinc-600 group-hover:text-zinc-400">{l.svg}</div>
            {l.label}
          </Link>
        );
      })}
    </nav>
  );

  const UserBlock = ({ className }: { className?: string }) => (
    <div className={cn("rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-2.5", className)}>
      <div className="flex items-center gap-2.5 px-1.5 py-1">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[11px] font-semibold text-zinc-300">{initials}</div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12.5px] font-medium text-zinc-200">{name}</p>
          <p className="truncate text-[11px] text-zinc-600">{email}</p>
        </div>
      </div>
      <form className="mt-1" action={signOutAction}>
        <button type="submit" className="flex w-full items-center gap-2 rounded-lg px-1.5 py-2 text-left text-[12.5px] text-zinc-500 transition-colors hover:bg-zinc-900 hover:text-zinc-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="size-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" x2="9" y1="12" y2="12" />
          </svg>
          Cerrar sesión
        </button>
      </form>
    </div>
  );

  return (
    <div className="font-sans">
      <div className="flex min-h-[100dvh] flex-col bg-zinc-950 lg:flex-row">
        {/* Barra superior solo en móvil / tablet */}
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-zinc-800/80 bg-zinc-950/95 px-4 pt-[max(0.25rem,env(safe-area-inset-top))] backdrop-blur-sm lg:hidden">
          <button type="button" onClick={() => setMobileOpen(true)} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
            <span className="sr-only">Abrir menú</span>
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div className="relative flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/30">
              <GhostIcon className="size-4 text-emerald-400" />
            </div>
            <p className="truncate text-[15px] font-semibold tracking-tight text-zinc-100">Boo Money</p>
          </div>
        </header>

        {/* Sidebar fijo solo en escritorio */}
        <aside className="sticky top-0 hidden h-[100dvh] w-60 shrink-0 flex-col border-r border-zinc-800/80 bg-zinc-950 lg:flex">
          {/* Marca */}
          <div className="flex items-center gap-3 px-5 pt-8 pb-6">
            <div className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/30">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-md"></div>
              <GhostIcon className="animate-ghost-float relative size-5 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[15px] leading-tight font-semibold tracking-tight text-zinc-100">Boo Money</p>
              <p className="text-[11px] font-medium tracking-wide text-zinc-600">Tus finanzas, sin sustos</p>
            </div>
          </div>

          <div className="mx-5 mb-4 h-px bg-gradient-to-r from-zinc-800 via-zinc-800/60 to-transparent"></div>

          {/* Navegación */}
          <div className="flex flex-1 flex-col gap-0.5 px-3">
            {renderNavLinks()}
          </div>

          {/* Usuario + cerrar sesión */}
          <UserBlock className="mx-3 mt-2 mb-6" />
        </aside>

        {/* Contenido Principal */}
        <div className="min-h-0 min-w-0 flex-1 lg:min-h-[100dvh]">
          <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
            {children}
          </div>
        </div>
      </div>

      {/* Overlay oscuro para móvil */}
      <div 
        onClick={() => setMobileOpen(false)} 
        className={cn(
          "fixed inset-0 z-[55] bg-black/60 transition-opacity duration-200 lg:hidden",
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      ></div>

      {/* Cajón lateral móvil */}
      <aside 
        className={cn(
          "fixed top-0 left-0 z-[60] flex h-[100dvh] w-[min(18rem,88vw)] flex-col border-r border-zinc-800/80 bg-zinc-950 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] shadow-xl transition-transform duration-200 ease-out lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        )} 
        role="dialog" 
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/30">
              <GhostIcon className="size-4 text-emerald-400" />
            </div>
            <p className="text-[15px] font-semibold tracking-tight text-zinc-100">Boo Money</p>
          </div>
          <button type="button" onClick={() => setMobileOpen(false)} className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
            <span className="sr-only">Cerrar menú</span>
          </button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-4">
          <div className="flex flex-col gap-0.5" aria-label="Secciones">
            {renderNavLinks()}
          </div>
          
          <div className="mt-auto">
            <UserBlock className="mt-6" />
          </div>
        </div>
      </aside>
    </div>
  );
}
