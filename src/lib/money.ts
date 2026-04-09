const cop = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function formatCOP(amount: number): string {
  return cop.format(Math.round(amount));
}

export function parseCOPInput(raw: string): number {
  const n = Number(String(raw).replace(/\D/g, ""));
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n);
}
