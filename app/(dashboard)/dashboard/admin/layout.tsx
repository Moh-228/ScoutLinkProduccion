import { redirect } from "next/navigation";
import Link from "next/link";

import { verifySession } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession();

  if (!session || session.role !== "admin") {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
