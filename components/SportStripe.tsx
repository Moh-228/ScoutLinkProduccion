/**
 * Thin four-color stripe echoing the logo's sport quadrants (basketball,
 * football, volleyball, flag football). Decorative only. Callers set the
 * height, width, rounding and positioning through `className`.
 */
export function SportStripe({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`flex overflow-hidden ${className}`}>
      <span className="flex-1 bg-sport-basketball" />
      <span className="flex-1 bg-sport-football" />
      <span className="flex-1 bg-sport-volleyball" />
      <span className="flex-1 bg-sport-tocho" />
    </div>
  );
}
