import { redirect } from "next/navigation";

import { verifySession } from "@/lib/auth";

export default async function OnboardingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await verifySession();

  if (!session) {
    redirect("/auth/login");
  }

  if (session.onboardingCompleted === true) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#09090b] px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-2xl">
        <p className="mb-8 text-xl font-bold text-[#1883FF]">Scoutlink</p>
        {children}
      </div>
    </div>
  );
}
