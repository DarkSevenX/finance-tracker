"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Compass,
  Layers,
  Lightbulb,
  PieChart,
  Wallet,
} from "lucide-react";
import {
  appCapabilities,
  budgetingSection,
  conceptsSection,
  conclusionSection,
  rule502030Columns,
  rule502030Intro,
  templateSection,
} from "@/data/landing-education";
import { cn } from "@/lib/cn";

/** Superficie elevada: contraste frente a zinc-950 de la landing */
const surfaceCard =
  "border border-zinc-600/50 bg-zinc-900/90 shadow-lg shadow-black/30 ring-1 ring-inset ring-white/[0.07]";

const surfaceCardSubtle =
  "border border-zinc-600/40 bg-zinc-900/75 shadow-md shadow-black/25 ring-1 ring-inset ring-white/[0.05]";

const accent = {
  emerald: {
    bar: "bg-emerald-400",
    glow: "from-emerald-500/20 to-transparent",
    text: "text-emerald-300",
    border: "border-emerald-500/20",
    bg: "from-emerald-950/40 to-zinc-950/80",
  },
  amber: {
    bar: "bg-amber-400",
    glow: "from-amber-500/20 to-transparent",
    text: "text-amber-200",
    border: "border-amber-500/20",
    bg: "from-amber-950/35 to-zinc-950/80",
  },
  violet: {
    bar: "bg-violet-400",
    glow: "from-violet-500/20 to-transparent",
    text: "text-violet-200",
    border: "border-violet-500/20",
    bg: "from-violet-950/40 to-zinc-950/80",
  },
} as const;

const capabilityIcons = [Wallet, PieChart, Layers] as const;

function RichInline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-zinc-50">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function SplitMeter() {
  return (
    <div
      className="flex h-4 w-full max-w-2xl overflow-hidden rounded-full ring-1 ring-white/10"
      role="img"
      aria-label="Reparto visual: 50 por ciento necesidades, 30 deseos, 20 ahorro"
    >
      <div className="w-[50%] bg-gradient-to-b from-emerald-400 to-emerald-600" />
      <div className="w-[30%] bg-gradient-to-b from-amber-300 to-amber-600" />
      <div className="w-[20%] bg-gradient-to-b from-violet-300 to-violet-600" />
    </div>
  );
}

const view = (reduce: boolean) => ({
  initial: reduce ? false : { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-10% 0px" },
  transition: { duration: reduce ? 0 : 0.6, ease: [0.16, 1, 0.3, 1] as const },
});

export function LandingEducation() {
  const reduce = useReducedMotion() ?? false;

  return (
    <div className="relative mt-8 border-t border-zinc-800/80 pt-16 sm:mt-12 sm:pt-24">
      {/* Ambiente — sin sidebar */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.55]"
        aria-hidden
      >
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-emerald-600/25 blur-[100px]" />
        <div className="absolute right-0 top-[38%] h-80 w-80 rounded-full bg-violet-600/20 blur-[110px]" />
        <div className="absolute bottom-32 left-1/3 h-64 w-64 rounded-full bg-amber-500/15 blur-[90px]" />
      </div>

      {/* Regla 50/30/20 — cabecera editorial + bento */}
      <motion.section className="relative" {...view(reduce)}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div className="max-w-xl lg:max-w-lg">
            <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-emerald-500/90">
              Regla clásica
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-[1.08] tracking-tight text-white sm:text-4xl lg:text-[2.65rem]">
              {rule502030Intro.title}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-zinc-400 sm:text-lg">
              {rule502030Intro.lead}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-start gap-3 lg:items-end">
            <div className="font-mono text-[clamp(2.5rem,8vw,4.5rem)] font-semibold leading-none tracking-tighter text-white/90">
              <span className="text-emerald-400">50</span>
              <span className="mx-1.5 text-zinc-600 sm:mx-2">/</span>
              <span className="text-amber-300">30</span>
              <span className="mx-1.5 text-zinc-600 sm:mx-2">/</span>
              <span className="text-violet-300">20</span>
            </div>
            <SplitMeter />
          </div>
        </div>

        <div className="mt-12 grid gap-4 sm:mt-14 lg:grid-cols-12 lg:gap-4">
          {rule502030Columns.map((col, i) => {
            const a = accent[col.accent];
            const span =
              col.pct === 50
                ? "lg:col-span-7 lg:row-span-2 lg:min-h-[320px]"
                : col.pct === 30
                  ? "lg:col-span-5"
                  : "lg:col-span-5";
            return (
              <motion.article
                key={col.pct}
                initial={reduce ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-6%" }}
                transition={{ delay: reduce ? 0 : 0.08 * i, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  "group relative overflow-hidden rounded-3xl border border-zinc-600/45 bg-gradient-to-br p-6 shadow-lg shadow-black/25 ring-1 ring-inset ring-white/[0.06] sm:p-7",
                  a.bg,
                  span
                )}
              >
                <div
                  className={cn(
                    "pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-gradient-to-br opacity-60 blur-2xl transition-opacity duration-500 group-hover:opacity-90",
                    a.glow
                  )}
                />
                <div className="relative flex h-full flex-col">
                  <div className="flex items-center justify-between gap-3">
                    <span className={cn("font-mono text-4xl font-bold tabular-nums sm:text-5xl", a.text)}>
                      {col.pct}%
                    </span>
                    <span className={cn("rounded-full border px-3 py-1 text-xs font-medium", a.border, a.text)}>
                      {col.title}
                    </span>
                  </div>
                  <ul
                    className={cn(
                      "mt-6 text-sm leading-relaxed text-zinc-300/95",
                      col.pct === 50
                        ? "space-y-2 sm:columns-2 sm:gap-x-8 sm:space-y-0"
                        : "space-y-2.5"
                    )}
                  >
                    {col.items.map((line) => (
                      <li key={line} className={cn(col.pct === 50 && "break-inside-avoid mb-2 sm:mb-3")}>
                        <span className={cn("mr-2 inline-block size-1.5 rounded-full align-middle", a.bar)} />
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.article>
            );
          })}
        </div>

        <p className="mt-10 max-w-2xl text-center text-base leading-relaxed text-zinc-400 sm:text-left sm:text-lg">
          <span className="text-zinc-200">↳</span> {rule502030Intro.footnote}
        </p>
      </motion.section>

      {/* Presupuestar — panel partido, cita destacada */}
      <motion.section className="relative mt-20 sm:mt-28" {...view(reduce)}>
        <div className="overflow-hidden rounded-[2rem] border border-zinc-600/45 bg-zinc-900/50 shadow-xl shadow-black/35 ring-1 ring-inset ring-white/[0.05]">
          <div className="grid lg:grid-cols-[1fr_min(42%,420px)]">
            <div className="relative bg-zinc-950/40 p-8 sm:p-10 lg:p-12 lg:pr-8">
              <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-emerald-500/80 via-emerald-500/20 to-transparent" />
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-zinc-500">Mapa del dinero</p>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-[2rem]">
                {budgetingSection.title}
              </h2>
              <div className="mt-6 space-y-4 text-base leading-relaxed text-zinc-400">
                {budgetingSection.paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </div>
            <div className="relative border-t border-zinc-700/50 bg-zinc-950/70 p-8 sm:p-10 lg:border-l lg:border-t-0">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {budgetingSection.bullets.map((b, i) => (
                  <motion.div
                    key={b.text}
                    initial={reduce ? false : { opacity: 0, scale: 0.97 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: reduce ? 0 : 0.06 * i }}
                    className={cn(
                      "rounded-2xl px-4 py-3.5 text-sm leading-snug text-zinc-200 backdrop-blur-sm",
                      surfaceCard
                    )}
                  >
                    <span className="mr-2" aria-hidden>
                      {b.emoji}
                    </span>
                    {b.text}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-zinc-800/80 bg-gradient-to-r from-emerald-950/20 via-zinc-950/50 to-violet-950/20 px-8 py-8 sm:px-12 sm:py-10">
            <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
              <Compass className="size-12 shrink-0 text-emerald-400/90 sm:size-14" strokeWidth={1.25} aria-hidden />
              <p className="text-lg font-medium leading-snug text-zinc-100 sm:text-xl">
                {budgetingSection.quote}
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Plantilla — chips + tarjetas app */}
      <motion.section className="mt-20 sm:mt-28" {...view(reduce)}>
        <div className="text-center sm:text-left">
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-[2rem]">
            {templateSection.title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-400 sm:mx-0 sm:text-lg">
            {templateSection.lead}
          </p>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-2.5 sm:justify-start sm:gap-3">
          {templateSection.bullets.map((b, i) => (
            <motion.span
              key={b.text}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: reduce ? 0 : 0.04 * i }}
              className={cn(
                "inline-flex max-w-[min(100%,22rem)] items-center gap-2 rounded-2xl px-4 py-2.5 text-left text-sm leading-snug text-zinc-100 backdrop-blur-md sm:max-w-none",
                surfaceCardSubtle
              )}
            >
              <span className="shrink-0 text-base" aria-hidden>
                {b.emoji}
              </span>
              <RichInline text={b.text} />
            </motion.span>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-zinc-500 sm:text-left sm:text-base">{templateSection.closing}</p>

        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {appCapabilities.map((item, i) => {
            const Icon = capabilityIcons[i] ?? Wallet;
            return (
              <motion.div
                key={item.n}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: reduce ? 0 : 0.1 * i }}
                className={cn(
                  "relative overflow-hidden rounded-3xl p-6 transition-colors hover:border-emerald-500/40",
                  surfaceCard,
                  "hover:bg-zinc-900/95"
                )}
              >
                <div className="absolute -right-6 -top-6 size-24 rounded-full bg-emerald-500/10 blur-2xl" />
                <div className="relative flex size-11 items-center justify-center rounded-2xl border border-emerald-500/25 bg-emerald-950/40 text-emerald-400">
                  <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                </div>
                <p className="mt-5 font-mono text-xs text-emerald-600/80">{item.n}</p>
                <p className="mt-1 text-lg font-semibold text-zinc-100">{item.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{item.body}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* Conceptos — carrusel con snap (web móvil) + rejilla en desktop */}
      <motion.section className="mt-20 sm:mt-28" {...view(reduce)}>
        <h2 className="text-center text-2xl font-semibold tracking-tight text-white sm:text-left sm:text-3xl">
          {conceptsSection.title}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-zinc-400 sm:mx-0 sm:text-left sm:text-lg">
          {conceptsSection.lead}
        </p>

        <div className="mt-8 -mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-2 [scrollbar-width:thin] sm:mx-0 sm:grid sm:grid-cols-2 sm:snap-none sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 lg:gap-4">
          {conceptsSection.items.map((c, i) => (
            <motion.div
              key={c.term}
              initial={reduce ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: reduce ? 0 : 0.05 * i }}
              className={cn(
                "w-[min(78vw,17rem)] shrink-0 snap-center rounded-3xl p-5 sm:w-auto sm:snap-none sm:p-6",
                surfaceCard
              )}
            >
              <div className="flex items-baseline justify-between gap-2 border-b border-zinc-700/50 pb-3">
                <p className="text-base font-semibold text-white">{c.term}</p>
                <span className="text-xl opacity-95" aria-hidden>
                  {c.emoji}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">{c.def}</p>
            </motion.div>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-zinc-500 sm:text-left">{conceptsSection.closing}</p>
      </motion.section>

      {/* Conclusión — bloque hero */}
      <motion.section className="mt-20 pb-6 sm:mt-28 sm:pb-10" {...view(reduce)}>
        <div className="relative overflow-hidden rounded-[2rem] border border-zinc-600/50 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black px-6 py-12 shadow-xl shadow-black/40 ring-1 ring-inset ring-white/[0.05] sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(16,185,129,0.18),transparent)]" />
          <div className="relative mx-auto max-w-3xl text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-emerald-500/85">Cierre</p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-4xl">
              {conclusionSection.title}
            </h2>
            <p className="mt-4 text-base text-zinc-400 sm:text-lg">{conclusionSection.lead}</p>
          </div>

          <div className="relative mt-12 grid gap-4 sm:grid-cols-3 sm:gap-3">
            {conclusionSection.freedoms.map((line, i) => (
              <div
                key={line}
                className={cn(
                  "rounded-2xl px-5 py-6 text-center text-sm font-medium leading-snug text-zinc-100 sm:text-[15px]",
                  "border border-zinc-500/40 bg-zinc-900/80 shadow-md shadow-black/30 ring-1 ring-inset ring-white/[0.06]"
                )}
              >
                <span className="mb-3 block font-mono text-2xl text-emerald-500/70" aria-hidden>
                  0{i + 1}
                </span>
                {line}
              </div>
            ))}
          </div>

          <div className="relative mx-auto mt-12 flex max-w-xl flex-col items-center gap-4 rounded-2xl border border-violet-400/35 bg-violet-950/50 px-6 py-8 shadow-lg shadow-black/30 ring-1 ring-inset ring-violet-300/10 sm:flex-row sm:items-start sm:gap-6 sm:px-8">
            <Lightbulb className="size-10 shrink-0 text-violet-300" strokeWidth={1.25} aria-hidden />
            <div className="text-center sm:text-left">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-violet-300/80">
                {conclusionSection.rememberTitle}
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-zinc-300 sm:text-[15px]">
                {conclusionSection.remember.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
