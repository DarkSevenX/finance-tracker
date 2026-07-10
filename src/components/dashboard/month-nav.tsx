import Link from "next/link";
const pill =
  "inline-flex items-center rounded-lg border border-zinc-700/80 bg-zinc-900/50 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:border-zinc-600 hover:bg-zinc-800/50 hover:text-zinc-200";

export function MonthNav({ year, month }: { year: number; month: number }) {
  const prev = new Date(year, month - 2, 1);
  const next = new Date(year, month, 1);
  const shortLabel = new Date(year, month - 1, 1).toLocaleDateString("es-CO", {
    month: "short",
  }).replace(".", ""); // Some locales add a period to short months

  return (
    <div className="flex items-center gap-1 rounded-lg border border-zinc-800/80 bg-zinc-900/50 p-1">
      <Link
        href={`/dashboard?y=${prev.getFullYear()}&m=${prev.getMonth() + 1}`}
        className="flex size-7 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </Link>
      <span className="px-2 text-xs font-medium capitalize text-zinc-300">{shortLabel}</span>
      <Link
        href={`/dashboard?y=${next.getFullYear()}&m=${next.getMonth() + 1}`}
        className="flex size-7 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
      </Link>
    </div>
  );
}

