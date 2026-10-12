import { redirect } from "next/navigation";

import { Alert } from "@/components/Alert";
import { Logo } from "@/components/Logo";
import { SidebarNav } from "@/components/SidebarNav";
import { SportStripe } from "@/components/SportStripe";
import { Topbar } from "@/components/Topbar";
import { deleteSession, verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await verifySession();

  if (!session) {
    redirect("/auth/login");
  }

  // Redirect to onboarding if not yet completed (admin skips onboarding)
  if (session.role !== "admin" && session.onboardingCompleted === false) {
    redirect(session.role === "student" ? "/onboarding/student" : "/onboarding/coach");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      email: true,
      role: true,
      isActive: true,
      onboardingCompleted: true,
      studentProfile: { select: { fullName: true } },
      coachProfile: { select: { displayName: true } },
      coachVerifications: {
        select: { sport: true, status: true },
        orderBy: { sport: "asc" },
      },
    },
  });

  if (!user) {
    redirect("/auth/login");
  }

  // Deactivated accounts (self-service or admin-initiated) lose dashboard access immediately.
  if (!user.isActive) {
    await deleteSession();
    redirect("/auth/login");
  }

  // Second check against DB in case JWT is stale (admin skips)
  if (user.role !== "admin" && !user.onboardingCompleted) {
    redirect(user.role === "student" ? "/onboarding/student" : "/onboarding/coach");
  }

  const userName =
    user.role === "admin"
      ? "Administrador"
      : (user.studentProfile?.fullName ?? user.coachProfile?.displayName ?? user.email);

  const pendingVerifications =
    user.role === "coach"
      ? user.coachVerifications.filter((v) => v.status !== "verified")
      : [];

  const verifiedSports =
    user.role === "coach"
      ? user.coachVerifications.filter((v) => v.status === "verified").map((v) => v.sport)
      : [];

  const sportLabels: Record<string, string> = {
    basketball: "Básquetbol",
    soccer: "Fútbol",
    flag_football: "Flag Football",
    volleyball: "Voleibol",
  };

  return (
    <div className="min-h-screen bg-brand-background">
      <header className="relative flex items-center gap-2.5 bg-white px-4 py-3 sm:px-6">
        <Logo size={32} />
        <p className="font-display text-lg font-bold tracking-tight text-brand-primary">ScoutLink</p>
        <SportStripe className="absolute inset-x-0 bottom-0 h-1" />
      </header>
      <div className="lg:grid lg:grid-cols-[100px_1fr]">
        <aside className="border-b border-brand-border/60 bg-white px-2 py-2 lg:border-b-0 lg:border-r lg:px-1.5 lg:py-4">
          <SidebarNav role={user.role} />
        </aside>
        <div className="flex min-h-screen flex-col">
          <Topbar userName={userName} />
          {user.role === "coach" && verifiedSports.length === 0 && (
            <Alert variant="warning" layout="banner">
              <span className="font-semibold">Verificación pendiente.</span> Tu cuenta está en revisión por un administrador. Podrás crear eventos y contactar alumnos una vez verificado en al menos un deporte.
            </Alert>
          )}
          {user.role === "coach" && verifiedSports.length > 0 && pendingVerifications.length > 0 && (
            <Alert variant="info" layout="banner">
              Verificado en: <span className="font-semibold">{verifiedSports.map((s) => sportLabels[s] ?? s).join(", ")}</span>.{" "}
              Revisión pendiente para: {pendingVerifications.map((v) => sportLabels[v.sport] ?? v.sport).join(", ")}.
            </Alert>
          )}
          <main className="flex-1 px-4 pb-6 pt-4 text-brand-primary sm:px-6 sm:pb-8 sm:pt-5">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
