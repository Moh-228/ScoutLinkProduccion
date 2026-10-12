import { type ReactNode } from "react";

import { Card, CardContent, CardDescription, CardHeader } from "@/components/Card";
import { SportStripe } from "@/components/SportStripe";

type OnboardingCardProps = {
  /** 1-based step number, drives the progress segments. */
  step: number;
  total?: number;
  /** Visible step text, kept verbatim from each page (e.g. "Paso 2 de 3 — Opcional"). */
  label: string;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
};

/** Shared presentation for onboarding steps: sport stripe, step progress, `h1` title and the form body. */
export function OnboardingCard({ step, total = 3, label, title, description, children }: OnboardingCardProps) {
  return (
    <Card className="relative overflow-hidden pt-7 sm:px-8 sm:pb-8">
      <SportStripe className="absolute inset-x-0 top-0 h-1.5" />
      <CardHeader>
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <div aria-hidden="true" className="flex gap-1.5">
            {Array.from({ length: total }, (_, i) => (
              <span
                key={i}
                className={`h-1.5 w-8 rounded-full ${i < step ? "bg-brand-secondary" : "bg-brand-border/60"}`}
              />
            ))}
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-primary/70">{label}</p>
        </div>
        <h1 className="font-display text-2xl font-semibold leading-tight tracking-tight text-brand-primary">{title}</h1>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
