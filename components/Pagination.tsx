import Link from "next/link";

type PaginationProps = {
  /** Current page (1-based). */
  page: number;
  totalPages: number;
  /** Path (without query string) the pagination links point to. */
  basePath: string;
  /** Current search params, used to preserve filters/tabs when changing pages. */
  searchParams?: Record<string, string | undefined>;
  /** Name of the query param that holds the page number, in case a view has several paginated lists. */
  paramName?: string;
};

function buildHref(basePath: string, searchParams: Record<string, string | undefined>, paramName: string, page: number) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value) params.set(key, value);
  }
  params.set(paramName, String(page));
  return `${basePath}?${params.toString()}`;
}

export function Pagination({ page, totalPages, basePath, searchParams = {}, paramName = "page" }: PaginationProps) {
  if (totalPages <= 1) return null;

  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <nav className="flex items-center justify-center gap-3 pt-2" aria-label="Paginación">
      <Link
        href={buildHref(basePath, searchParams, paramName, page - 1)}
        aria-disabled={!canPrev}
        className={[
          "flex h-8 w-8 items-center justify-center rounded-lg ring-1 ring-brand-border transition-colors",
          canPrev ? "bg-white text-brand-primary hover:bg-brand-background" : "pointer-events-none bg-brand-background text-brand-primary/30",
        ].join(" ")}
      >
        ‹
      </Link>
      <span className="text-sm text-brand-primary/70">
        Página {page} de {totalPages}
      </span>
      <Link
        href={buildHref(basePath, searchParams, paramName, page + 1)}
        aria-disabled={!canNext}
        className={[
          "flex h-8 w-8 items-center justify-center rounded-lg ring-1 ring-brand-border transition-colors",
          canNext ? "bg-white text-brand-primary hover:bg-brand-background" : "pointer-events-none bg-brand-background text-brand-primary/30",
        ].join(" ")}
      >
        ›
      </Link>
    </nav>
  );
}
