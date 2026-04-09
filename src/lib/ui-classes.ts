import { cn } from "@/lib/cn";

/** Campos de formulario — un solo estilo en toda la app */
export const fieldClass = cn(
  "w-full rounded-lg border border-zinc-700/80 bg-zinc-900/50 px-3 py-2.5 text-sm text-zinc-100",
  "placeholder:text-zinc-600",
  "focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500/40",
  "disabled:cursor-not-allowed disabled:opacity-50"
);

export const labelClass = "mb-1.5 block text-xs font-medium text-zinc-500";

/** Botón principal (alto contraste sobre oscuro) */
export const btnPrimaryClass = cn(
  "inline-flex items-center justify-center rounded-lg bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-950",
  "transition-colors hover:bg-white",
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
  "disabled:pointer-events-none disabled:opacity-45"
);

/** Botón secundario / borde */
export const btnSecondaryClass = cn(
  "inline-flex items-center justify-center rounded-lg border border-zinc-600/90 bg-zinc-900/40 px-4 py-2.5 text-sm font-medium text-zinc-200",
  "transition-colors hover:border-zinc-500 hover:bg-zinc-800/60",
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
  "disabled:pointer-events-none disabled:opacity-45"
);

/** Contenedor de tabla */
export const tableWrapClass =
  "overflow-hidden rounded-xl border border-zinc-800/90 bg-zinc-900/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]";

export const tableHeadClass =
  "border-b border-zinc-800/90 bg-zinc-900/50 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500";

export const tableRowClass =
  "border-b border-zinc-800/50 transition-colors last:border-0 hover:bg-zinc-900/40";

/** Fila de lista (categorías, etc.) */
export const listRowClass =
  "flex items-center justify-between rounded-lg border border-zinc-800/90 bg-zinc-900/25 px-4 py-3 text-sm transition-colors hover:bg-zinc-900/45";
