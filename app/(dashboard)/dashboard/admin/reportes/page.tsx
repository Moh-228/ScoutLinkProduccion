import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { Pagination } from "@/components/Pagination";
import { getPagination, getTotalPages, parsePage } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import { ReportRow } from "./_components/ReportRow";

type Props = { searchParams: Promise<{ status?: string; page?: string }> };

const TABS = [
  { label: "Pendientes", value: "pending" },
  { label: "Resueltos", value: "resolved" },
  { label: "Descartados", value: "dismissed" },
  { label: "Todos", value: "all" },
];

export default async function AdminReportsPage({ searchParams }: Props) {
  const { status, page: pageRaw } = await searchParams;
  const activeStatus = status && ["pending", "resolved", "dismissed"].includes(status) ? status : "pending";
  const page = parsePage(pageRaw);
  const where = activeStatus === "all" ? {} : { status: activeStatus as never };

  const [totalReports, reports] = await Promise.all([
    prisma.commentReport.count({ where }),
    prisma.commentReport.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        comment: {
          select: {
            id: true,
            content: true,
            eventId: true,
            event: { select: { title: true } },
            author: {
              select: {
                role: true,
                studentProfile: { select: { fullName: true } },
                coachProfile: { select: { displayName: true } },
              },
            },
          },
        },
        reporter: {
          select: {
            role: true,
            studentProfile: { select: { fullName: true } },
            coachProfile: { select: { displayName: true } },
          },
        },
        resolvedBy: {
          select: {
            studentProfile: { select: { fullName: true } },
            coachProfile: { select: { displayName: true } },
          },
        },
      },
      ...getPagination(page),
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Comentarios reportados"
        description="Revisa reportes de comentarios y aplica moderación."
      />

      <nav className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/dashboard/admin/reportes?status=${tab.value}`}
            aria-current={activeStatus === tab.value ? "page" : undefined}
            className={[
              "rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interaction",
              activeStatus === tab.value
                ? "bg-brand-primary text-white"
                : "bg-white text-brand-primary/70 ring-1 ring-brand-border hover:bg-brand-background",
            ].join(" ")}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      <Card className="mx-auto w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Reportes ({totalReports})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {reports.length === 0 ? (
            <EmptyState size="compact" icon="error" title="No hay reportes en esta categoría." />
          ) : (
            reports.map((r) => {
              const reporterName =
                r.reporter.studentProfile?.fullName ?? r.reporter.coachProfile?.displayName ?? "Usuario";
              const commentAuthorName =
                r.comment.author.studentProfile?.fullName ?? r.comment.author.coachProfile?.displayName ?? "Usuario";
              const resolverName =
                r.resolvedBy?.studentProfile?.fullName ?? r.resolvedBy?.coachProfile?.displayName ?? null;
              return (
                <ReportRow
                  key={r.id}
                  reportId={r.id}
                  commentId={r.comment.id}
                  eventId={r.comment.eventId}
                  eventTitle={r.comment.event.title}
                  commentContent={r.comment.content}
                  commentAuthorName={commentAuthorName}
                  reporterName={reporterName}
                  reason={r.reason}
                  status={r.status}
                  createdAt={r.createdAt.toISOString()}
                  resolutionReason={r.resolutionReason}
                  resolverName={resolverName}
                  resolvedAt={r.resolvedAt ? r.resolvedAt.toISOString() : null}
                />
              );
            })
          )}
          <Pagination
            page={page}
            totalPages={getTotalPages(totalReports)}
            basePath="/dashboard/admin/reportes"
            searchParams={{ status: activeStatus }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
