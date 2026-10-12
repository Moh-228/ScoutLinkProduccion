export default function NotificationsLoading() {
  return (
    <div className="space-y-6 motion-safe:animate-pulse">
      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="h-8 w-48 rounded-lg bg-brand-border/40" />
          <div className="mt-1 h-4 w-72 rounded bg-brand-border/20" />
        </div>
        <div className="h-9 w-36 rounded-lg bg-brand-border/40" />
      </header>

      {/* Notification list */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-brand-border/40 bg-brand-border/20 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="h-5 w-48 rounded bg-brand-border/40" />
              <div className="flex items-center gap-2">
                <div className="h-7 w-20 rounded-lg bg-brand-border/40" />
                <div className="h-5 w-14 rounded-full bg-brand-border/40" />
              </div>
            </div>
            <div className="h-4 w-3/4 rounded bg-brand-border/20" />
            <div className="h-3 w-28 rounded bg-brand-border/20" />
          </div>
        ))}
      </div>
    </div>
  );
}
