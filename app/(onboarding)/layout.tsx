import { redirect } from "next/navigation";

import { Logo } from "@/components/Logo";
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
    <div className="min-h-screen bg-brand-background px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-8 flex items-center gap-2.5">
          <Logo size={36} />
          <p className="font-display text-xl font-bold tracking-tight text-brand-primary">ScoutLink</p>
        </div>
        {children}
      </div>
    </div>
  );
}
