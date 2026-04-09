import Link from "next/link";
const pill =
  "inline-flex items-center rounded-lg border border-zinc-700/80 bg-zinc-900/50 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:border-zinc-600 hover:bg-zinc-800/50 hover:text-zinc-200";

export function MonthNav({ year, month }: { year: number; month: number }) {
  const prev = new Date(year, month - 2, 1);
  const next = new Date(year, month, 1);
  const label = new Date(year, month - 1, 1).toLocaleDateString("es-CO", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex w-full max-w-full flex-wrap items-center justify-center gap-2 sm:w-auto sm:justify-start sm:gap-3">
      <Link
        href={`/dashboard?y=${prev.getFullYear()}&m=${prev.getMonth() + 1}`}
        className={pill}
      >
        ← Anterior
      </Link>
      <span className="max-w-[calc(100%-8rem)] shrink-0 truncate px-1 text-center text-xs font-medium capitalize text-zinc-200 sm:max-w-none sm:whitespace-normal sm:text-sm">
        {label}
      </span>
      <Link
        href={`/dashboard?y=${next.getFullYear()}&m=${next.getMonth() + 1}`}
        className={pill}
      >
        Siguiente →
      </Link>
    </div>
  );
}
