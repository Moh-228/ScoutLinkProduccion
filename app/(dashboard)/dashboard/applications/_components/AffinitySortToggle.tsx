"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function AffinitySortToggle({ active }: { active: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const toggle = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (active) {
      params.delete("sort");
    } else {
      params.set("sort", "affinity");
    }
    router.push(`${pathname}?${params.toString()}`);
  }, [active, router, pathname, searchParams]);

  return (
    <button
      onClick={toggle}
      className={[
        "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interaction",
        active
          ? "border-interaction bg-interaction/10 text-interaction"
          : "border-brand-border bg-white text-brand-primary/70 hover:border-brand-primary/40 hover:text-brand-primary",
      ].join(" ")}
    >
      <svg
        aria-hidden="true"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
      </svg>
      {active ? "Ordenado por afinidad" : "Ordenar por afinidad"}
    </button>
  );
}
