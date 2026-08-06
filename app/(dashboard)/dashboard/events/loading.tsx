export default function EventsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="h-8 w-40 rounded-lg bg-brand-border/40" />
          <div className="mt-1 h-4 w-80 rounded bg-brand-border/20" />
        </div>
        <div className="h-9 w-32 rounded-lg bg-brand-border/40" />
      </header>

      {/* Filter card */}
      <div className="rounded-xl border border-brand-border/40 bg-brand-border/20 p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="h-10 rounded-lg bg-brand-border/40" />
          <div className="h-10 rounded-lg bg-brand-border/40" />
          <div className="h-10 rounded-lg bg-brand-border/40" />
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-brand-border/40 bg-brand-border/20 p-4 space-y-3">
            <div className="flex gap-2">
              <div className="h-5 w-24 rounded-full bg-brand-border/40" />
              <div className="h-5 w-16 rounded-full bg-brand-border/40" />
            </div>
            <div className="h-5 w-48 rounded bg-brand-border/40" />
            <div className="h-4 w-36 rounded bg-brand-border/20" />
            <div className="h-4 w-52 rounded bg-brand-border/20" />
            <div className="flex gap-2 pt-1">
              <div className="h-8 w-24 rounded-lg bg-brand-border/40" />
              <div className="h-8 w-8 rounded-lg bg-brand-border/40" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
