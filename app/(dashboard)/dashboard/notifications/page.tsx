import { redirect } from "next/navigation";

import { Badge } from "@/components/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { Pagination } from "@/components/Pagination";
import { verifySession } from "@/lib/auth";
import { getPagination, getTotalPages, parsePage } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import { MarkReadButton, MarkAllReadButton } from "./_components/MarkReadButtons";

function fmt(d: Date) {
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(d),
  );
}

type Props = { searchParams: Promise<{ page?: string }> };

export default async function NotificationsPage({ searchParams }: Props) {
  const session = await verifySession();
  if (!session) redirect("/auth/login");

  const { page: pageRaw } = await searchParams;
  const page = parsePage(pageRaw);

  const [total, unreadCount, notifications] = await Promise.all([
    prisma.notification.count({ where: { userId: session.userId } }),
    prisma.notification.count({ where: { userId: session.userId, readAt: null } }),
    prisma.notification.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      ...getPagination(page),
    }),
  ]);

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-brand-primary">Notificaciones</h1>
          <p className="text-brand-primary/70">Avisos sobre eventos, postulaciones y contacto.</p>
        </div>
        <MarkAllReadButton hasUnread={unreadCount > 0} />
      </header>

      {notifications.length === 0 ? (
        <p className="text-center text-brand-primary/50 py-12">No tienes notificaciones.</p>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const payload = (n.payload ?? {}) as Record<string, string>;
            return (
              <Card key={n.id} className={`mx-auto w-full max-w-2xl ${!n.readAt ? "ring-2 ring-interaction/40" : ""}`}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base">{payload.title ?? n.type}</CardTitle>
                    <div className="flex items-center gap-2">
                      {!n.readAt && <MarkReadButton notificationId={n.id} />}
                      <Badge variant={!n.readAt ? "info" : "neutral"}>
                        {!n.readAt ? "Nueva" : "Leída"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1">
                  {payload.message && (
                    <p className="text-sm text-brand-primary/70">{payload.message}</p>
                  )}
                  <p className="text-xs text-brand-primary/50">{fmt(n.createdAt)}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      <Pagination page={page} totalPages={getTotalPages(total)} basePath="/dashboard/notifications" />
    </div>
  );
}
