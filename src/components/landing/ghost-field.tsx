"use client";

import { Ghost } from "lucide-react";
import { cn } from "@/lib/cn";

const GHOSTS = [
  { pos: "left-[4%] top-[8%]", size: "size-7", anim: "animate-ghost-drift-a", delay: "0s" },
  { pos: "right-[8%] top-[12%]", size: "size-6", anim: "animate-ghost-drift-b", delay: "-4s" },
  { pos: "left-[12%] top-[42%]", size: "size-5", anim: "animate-ghost-drift-c", delay: "-2s" },
  { pos: "right-[14%] top-[38%]", size: "size-8", anim: "animate-ghost-drift-a", delay: "-11s" },
  { pos: "left-[22%] bottom-[18%]", size: "size-6", anim: "animate-ghost-drift-b", delay: "-7s" },
  { pos: "right-[22%] bottom-[24%]", size: "size-7", anim: "animate-ghost-drift-c", delay: "-9s" },
  { pos: "left-1/2 top-[20%] -translate-x-1/2", size: "size-5", anim: "animate-ghost-drift-a", delay: "-14s" },
  { pos: "right-[4%] bottom-[8%]", size: "size-6", anim: "animate-ghost-drift-b", delay: "-3s" },
  { pos: "left-[6%] bottom-[12%]", size: "size-5", anim: "animate-ghost-drift-c", delay: "-18s" },
  { pos: "right-[28%] top-[55%]", size: "size-4", anim: "animate-ghost-drift-a", delay: "-20s" },
] as const;

/** Capa decorativa: fantasmas muy suaves, sin capturar clics. */
export function GhostField() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {GHOSTS.map((g, i) => (
        <span key={i} className={cn("absolute", g.pos)}>
          <Ghost
            className={cn(
              "block text-emerald-500/[0.07] motion-reduce:animate-none motion-reduce:opacity-[0.04]",
              g.size,
              g.anim
            )}
            style={{ animationDelay: g.delay }}
          />
        </span>
      ))}
    </div>
  );
}
