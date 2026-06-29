export default function NotificationsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="h-8 w-48 rounded-lg bg-white/10" />
          <div className="mt-1 h-4 w-72 rounded bg-white/5" />
        </div>
        <div className="h-9 w-36 rounded-lg bg-white/10" />
      </header>

      {/* Notification list */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="h-5 w-48 rounded bg-white/10" />
              <div className="flex items-center gap-2">
                <div className="h-7 w-20 rounded-lg bg-white/10" />
                <div className="h-5 w-14 rounded-full bg-white/10" />
              </div>
            </div>
            <div className="h-4 w-3/4 rounded bg-white/5" />
            <div className="h-3 w-28 rounded bg-white/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
