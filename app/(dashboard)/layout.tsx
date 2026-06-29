import { redirect } from "next/navigation";

import { SidebarNav } from "@/components/SidebarNav";
import { Topbar } from "@/components/Topbar";
import { verifySession } from "@/lib/auth";
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
    <div className="min-h-screen bg-[#09090b] lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-white bg-[#09090b] px-4 py-5 lg:border-b-0 lg:border-r lg:px-5">
        <p className="mb-6 text-xl font-bold text-[#1883FF]">Scoutlink</p>
        <SidebarNav role={user.role} />
      </aside>
      <div className="flex min-h-screen flex-col">
        <Topbar userName={userName} />
        {user.role === "coach" && verifiedSports.length === 0 && (
          <div className="border-b border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200 sm:px-6">
            <span className="font-semibold">Verificación pendiente.</span> Tu cuenta está en revisión por un administrador. Podrás crear eventos y contactar alumnos una vez verificado en al menos un deporte.
          </div>
        )}
        {user.role === "coach" && verifiedSports.length > 0 && pendingVerifications.length > 0 && (
          <div className="border-b border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-200 sm:px-6">
            Verificado en: <span className="font-semibold">{verifiedSports.map((s) => sportLabels[s] ?? s).join(", ")}</span>.{" "}
            Revisión pendiente para: {pendingVerifications.map((v) => sportLabels[v.sport] ?? v.sport).join(", ")}.
          </div>
        )}
        <main className="flex-1 p-4 text-white sm:p-6 [&_.rounded-2xl]:!border-white/10 [&_.rounded-2xl]:!bg-[#111114] [&_.rounded-2xl]:!ring-white/10 [&_a]:!text-white [&_h1]:!text-white [&_h2]:!text-white [&_h3]:!text-white [&_p]:!text-white [&_input]:!bg-white [&_input]:!text-[#1883FF] [&_select]:!bg-white">
          {children}
        </main>
      </div>
    </div>
  );
}
