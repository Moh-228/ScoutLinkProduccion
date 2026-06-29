export default function EventsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="h-8 w-40 rounded-lg bg-white/10" />
          <div className="mt-1 h-4 w-80 rounded bg-white/5" />
        </div>
        <div className="h-9 w-32 rounded-lg bg-white/10" />
      </header>

      {/* Filter card */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="h-10 rounded-lg bg-white/10" />
          <div className="h-10 rounded-lg bg-white/10" />
          <div className="h-10 rounded-lg bg-white/10" />
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
            <div className="flex gap-2">
              <div className="h-5 w-24 rounded-full bg-white/10" />
              <div className="h-5 w-16 rounded-full bg-white/10" />
            </div>
            <div className="h-5 w-48 rounded bg-white/10" />
            <div className="h-4 w-36 rounded bg-white/5" />
            <div className="h-4 w-52 rounded bg-white/5" />
            <div className="flex gap-2 pt-1">
              <div className="h-8 w-24 rounded-lg bg-white/10" />
              <div className="h-8 w-8 rounded-lg bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
