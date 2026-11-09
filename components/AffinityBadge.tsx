/**
 * Compliance percentage for a recruitment event. Colors are status tints
 * (not sport colors), with text contrast kept for WCAG AA.
 */
export function AffinityBadge({ pct, label = "Afinidad" }: { pct: number; label?: string }) {
  const color =
    pct >= 70 ? "text-emerald-800 border-emerald-300 bg-emerald-100"
    : pct >= 40 ? "text-amber-800 border-amber-300 bg-amber-100"
    : "text-brand-primary/80 border-brand-border bg-brand-background";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${color}`}
      title={`${label}: ${pct}%`}
    >
      <span className="font-normal">{label}</span>
      <span className="font-display font-extrabold">{pct}%</span>
    </span>
  );
}
