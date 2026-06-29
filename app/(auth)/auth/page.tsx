
import Link from "next/link";

import { buttonClassNames } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";

export default function Auth() {
  return (
    <main className="space-y-6">
      <header className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">Bienvenido a Scoutlink</h1>
        <p className="mt-2 text-slate-600">Elige como quieres continuar.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ya tengo cuenta</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/auth/login" className={buttonClassNames("primary", "w-full")}>Entrar</Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quiero crear cuenta</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/auth/register" className={buttonClassNames("secondary", "w-full")}>Crear cuenta</Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
