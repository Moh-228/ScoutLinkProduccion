export default function FichasLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <header>
        <div className="h-8 w-56 rounded-lg bg-white/10" />
        <div className="mt-1 h-4 w-72 rounded bg-white/5" />
      </header>

      {/* Filter card */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="h-10 rounded-lg bg-white/10" />
          <div className="h-10 rounded-lg bg-white/10" />
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-5 w-32 rounded bg-white/10" />
              <div className="h-5 w-20 rounded-full bg-white/10" />
            </div>
            <div className="h-4 w-24 rounded bg-white/5" />
            <div className="space-y-1.5">
              <div className="h-3 w-28 rounded bg-white/5" />
              <div className="h-3 w-20 rounded bg-white/5" />
              <div className="h-3 w-24 rounded bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
