export default function FavoritesLoading() {
  return (
    <div className="space-y-8 motion-safe:animate-pulse">
      {/* Header */}
      <header>
        <div className="h-8 w-40 rounded-lg bg-brand-border/40" />
        <div className="mt-1 h-4 w-72 rounded bg-brand-border/20" />
      </header>

      {/* Events section */}
      <section className="space-y-4">
        <div className="h-5 w-24 rounded bg-brand-border/40" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-brand-border/40 bg-brand-border/20 p-4 space-y-3">
              <div className="flex gap-2">
                <div className="h-5 w-24 rounded-full bg-brand-border/40" />
                <div className="h-5 w-16 rounded-full bg-brand-border/40" />
              </div>
              <div className="h-5 w-48 rounded bg-brand-border/40" />
              <div className="h-4 w-32 rounded bg-brand-border/20" />
              <div className="h-4 w-20 rounded bg-brand-border/20" />
            </div>
          ))}
        </div>
      </section>

      {/* Fichas section */}
      <section className="space-y-4">
        <div className="h-5 w-40 rounded bg-brand-border/40" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-brand-border/40 bg-brand-border/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-5 w-32 rounded bg-brand-border/40" />
                <div className="h-5 w-20 rounded-full bg-brand-border/40" />
              </div>
              <div className="h-4 w-24 rounded bg-brand-border/20" />
              <div className="space-y-1.5">
                <div className="h-3 w-28 rounded bg-brand-border/20" />
                <div className="h-3 w-20 rounded bg-brand-border/20" />
              </div>
              <div className="h-4 w-20 rounded bg-brand-border/20" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
