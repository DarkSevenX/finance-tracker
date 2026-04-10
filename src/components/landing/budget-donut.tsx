"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

/** Dona 50/30/20 con animación al montar (respeta prefers-reduced-motion). */
export function BudgetDonut() {
  const r = 40;
  const c = 2 * Math.PI * r;
  const segs = [
    { pct: 50, label: "Necesidades", strokeClass: "stroke-emerald-400", dotClass: "bg-emerald-400" },
    { pct: 30, label: "Deseos", strokeClass: "stroke-amber-400", dotClass: "bg-amber-400" },
    { pct: 20, label: "Ahorro", strokeClass: "stroke-violet-400", dotClass: "bg-violet-400" },
  ] as const;

  let cumulative = 0;
  const arcs = segs.map((s) => {
    const len = (s.pct / 100) * c;
    const dash = `${len} ${c - len}`;
    const offset = -cumulative;
    cumulative += len;
    return { ...s, dash, offset };
  });

  const reduce = useReducedMotion();
  /** Curva suave: acelera al inicio del trazo y frena al llegar al final de cada porción. */
  const strokeEase = [0.22, 0.61, 0.36, 1] as const;
  const uiEase = [0.22, 1, 0.36, 1] as const;
  /** Cada arco termina con desaceleración; luego una pausa breve antes del siguiente (“parada” en cada punto). */
  const drawDuration = reduce ? 0 : 0.78;
  const pauseBetweenArcs = reduce ? 0 : 0.26;
  const delayForArc = (index: number) => index * (drawDuration + pauseBetweenArcs);
  const fadeDur = reduce ? 0 : 0.45;
  const arcsEndTime =
    reduce ? 0 : delayForArc(arcs.length - 1) + drawDuration;

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl border border-emerald-950/40 bg-zinc-900/55 p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
      aria-hidden
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: fadeDur, ease: uiEase }}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-emerald-500/80">Regla 50/30/20</p>

      <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-center sm:gap-8">
        <div className="relative shrink-0">
          <svg
            viewBox="0 0 100 100"
            className="h-44 w-44 sm:h-48 sm:w-48"
            role="img"
            aria-label="Distribución ilustrativa: 50% necesidades, 30% deseos, 20% ahorro"
          >
            <title>Distribución ilustrativa 50%, 30%, 20%</title>
            <g transform="rotate(-90 50 50)">
              {arcs.map((a, i) => (
                <motion.circle
                  key={a.label}
                  cx={50}
                  cy={50}
                  r={r}
                  fill="none"
                  strokeWidth={14}
                  strokeLinecap="round"
                  className={cn(a.strokeClass)}
                  initial={
                    reduce
                      ? { strokeDasharray: a.dash, strokeDashoffset: a.offset }
                      : { strokeDasharray: `0 ${c}`, strokeDashoffset: a.offset }
                  }
                  animate={{ strokeDasharray: a.dash, strokeDashoffset: a.offset }}
                  transition={{
                    duration: drawDuration,
                    delay: delayForArc(i),
                    ease: strokeEase,
                  }}
                />
              ))}
            </g>
            <circle
              cx={50}
              cy={50}
              r={32}
              fill="none"
              stroke="rgba(24,24,27,0.85)"
              strokeWidth={1}
              className="pointer-events-none"
            />
            <motion.text
              x={50}
              y={46}
              textAnchor="middle"
              className="fill-zinc-200 font-mono text-[7px] font-medium tracking-tight"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: reduce ? 0 : arcsEndTime + 0.08,
                duration: reduce ? 0 : 0.45,
                ease: uiEase,
              }}
            >
              50 · 30 · 20
            </motion.text>
            <motion.text
              x={50}
              y={58}
              textAnchor="middle"
              className="fill-zinc-500 font-mono text-[5.5px]"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: reduce ? 0 : arcsEndTime + 0.14,
                duration: reduce ? 0 : 0.32,
                ease: uiEase,
              }}
            >
              %
            </motion.text>
          </svg>
        </div>

        <motion.ul
          className="w-full max-w-[220px] space-y-2.5 text-sm sm:max-w-none"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: reduce ? 0 : drawDuration + pauseBetweenArcs,
                delayChildren: reduce ? 0 : delayForArc(0) + 0.05,
              },
            },
          }}
        >
          {segs.map((s) => (
            <motion.li
              key={s.label}
              className="flex items-center justify-between gap-3"
              variants={{
                hidden: { opacity: 0, x: reduce ? 0 : 10 },
                show: {
                  opacity: 1,
                  x: 0,
                  transition: { duration: reduce ? 0 : 0.45, ease: strokeEase },
                },
              }}
            >
              <span className="flex items-center gap-2 text-zinc-400">
                <span className={cn("size-2 shrink-0 rounded-full", s.dotClass)} />
                <span>{s.label}</span>
              </span>
              <span className="font-mono tabular-nums text-zinc-300">{s.pct}%</span>
            </motion.li>
          ))}
        </motion.ul>
      </div>

      <motion.p
        className="mt-5 text-[11px] leading-relaxed text-zinc-500"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduce ? 0 : 0.55, duration: reduce ? 0 : 0.4 }}
      >
        Ilustración del reparto; en la app ajustas porcentajes y mes.
      </motion.p>
    </motion.div>
  );
}
