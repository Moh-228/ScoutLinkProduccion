
import Link from "next/link";

import { AuthBrand } from "@/app/(auth)/_components/AuthShell";
import { buttonClassNames } from "@/components/Button";
import { Card, CardContent, CardTitle } from "@/components/Card";
import { Icon, type IconName } from "@/components/Icon";
import { SportStripe } from "@/components/SportStripe";

const OPTIONS: { title: string; href: string; label: string; variant: "primary" | "secondary"; icon: IconName }[] = [
  { title: "Ya tengo cuenta", href: "/auth/login", label: "Entrar", variant: "primary", icon: "login" },
  { title: "Quiero crear cuenta", href: "/auth/register", label: "Crear cuenta", variant: "secondary", icon: "person" },
];

export default function Auth() {
  return (
    <main className="mx-auto w-full max-w-2xl space-y-8">
      <div>
        <AuthBrand />
        <header className="-mt-2 text-center">
          <h1 className="font-display text-3xl font-bold tracking-tight text-brand-primary">Bienvenido a ScoutLink</h1>
          <p className="mt-2 text-brand-primary/70">Elige cómo quieres continuar.</p>
        </header>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {OPTIONS.map((option) => (
          <Card key={option.href} className="relative overflow-hidden pt-7">
            <SportStripe className="absolute inset-x-0 top-0 h-1" />
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-secondary/10 text-brand-secondary">
                <Icon name={option.icon} size={22} />
              </span>
              <CardTitle>{option.title}</CardTitle>
            </div>
            <CardContent>
              <Link href={option.href} className={buttonClassNames(option.variant, "w-full")}>
                {option.label}
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
