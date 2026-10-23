"use client";

import { useEffect, useId, useRef, useState } from "react";

/**
 * Read confirmation for the privacy notice. Purely visual: there is no
 * acceptance action or stored consent in the app, so nothing is submitted or
 * persisted — the checkbox only unlocks once the reader reaches the end of the
 * notice, and resets on every visit.
 *
 * The end is detected with an IntersectionObserver on a sentinel placed right
 * after the notice content, so it tracks the real end of the content (not just
 * window scroll) and is satisfied immediately when the whole notice already fits.
 */
export function ReadConfirmation() {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [reachedEnd, setReachedEnd] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const checkboxId = useId();
  const hintId = useId();

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setReachedEnd(true);
        observer.disconnect();
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="mt-10">
      {/* End-of-content marker */}
      <div ref={sentinelRef} aria-hidden="true" className="h-px" />
      <div
        className={`rounded-2xl border p-4 transition-colors sm:p-5 ${
          reachedEnd ? "border-brand-border bg-white" : "border-dashed border-brand-border bg-white/60"
        }`}
      >
        <div className="flex items-start gap-3">
          <input
            id={checkboxId}
            type="checkbox"
            checked={confirmed}
            disabled={!reachedEnd}
            onChange={(e) => setConfirmed(e.target.checked)}
            aria-describedby={hintId}
            className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-brand-border accent-interaction focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interaction focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <label
            htmlFor={checkboxId}
            className={`text-sm font-medium ${reachedEnd ? "cursor-pointer text-brand-primary" : "cursor-not-allowed text-brand-primary/70"}`}
          >
            Confirmo que he leído el aviso de privacidad.
          </label>
        </div>
        <p id={hintId} aria-live="polite" className="mt-2 pl-8 text-xs text-brand-primary/70">
          {reachedEnd
            ? "Has llegado al final del aviso."
            : "Desplázate hasta el final del aviso para poder confirmar su lectura."}
        </p>
      </div>
    </div>
  );
}
