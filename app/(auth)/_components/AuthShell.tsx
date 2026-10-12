import Link from "next/link";
import { type ReactNode } from "react";

import { Card, CardContent, CardDescription, CardHeader } from "@/components/Card";
import { Icon } from "@/components/Icon";
import { Logo } from "@/components/Logo";
import { SportStripe } from "@/components/SportStripe";

export const AUTH_FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interaction focus-visible:ring-offset-2";

/** "Volver a …" link shown above the auth card. */
export function AuthBackLink({ href, label }: { href: string; label: string }) {
  return (
    <div className="mb-6">
      <Link
        href={href}
        className={`group inline-flex items-center gap-1.5 rounded text-sm text-brand-primary/70 transition-colors hover:text-brand-primary ${AUTH_FOCUS_RING}`}
      >
        <Icon
          name="arrow"
          size={16}
          className="transition-transform duration-200 group-hover:-translate-x-0.5 motion-reduce:transform-none"
        />
        {label}
      </Link>
    </div>
  );
}

/** Logo on a white disc + "ScoutLink", linking home. */
export function AuthBrand() {
  return (
    <Link href="/" className={`mx-auto mb-8 flex w-fit flex-col items-center gap-3 rounded-xl ${AUTH_FOCUS_RING}`}>
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-md shadow-brand-primary/10 ring-1 ring-brand-border/50">
        <Logo size={48} />
      </span>
      <span className="font-display text-2xl font-bold tracking-tight text-brand-primary">ScoutLink</span>
    </Link>
  );
}

type AuthShellProps = {
  back?: { href: string; label: string };
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  /** Optional line under the form, separated by a hairline (e.g. "¿Ya tienes cuenta? …"). */
  footer?: ReactNode;
};

/** Extra classes for the full-width submit `Button` (only adds width + shadow; no conflict with its variant classes). */
export const AUTH_SUBMIT_CLASS = "w-full shadow-md shadow-brand-primary/20 hover:shadow-lg hover:shadow-brand-primary/25";

/** Link style for links inside the auth footer line. */
export const AUTH_FOOTER_LINK = `rounded font-semibold text-brand-secondary underline underline-offset-2 transition-colors hover:text-brand-primary ${AUTH_FOCUS_RING}`;

/** Shared presentation for auth forms: back link, brand, and a card with the sport stripe and an `h1`. */
export function AuthShell({ back, title, description, children, footer }: AuthShellProps) {
  return (
    <main className="mx-auto w-full max-w-md">
      {back ? <AuthBackLink href={back.href} label={back.label} /> : null}
      <AuthBrand />
      <Card className="relative overflow-hidden pt-7 sm:px-8 sm:pb-8">
        <SportStripe className="absolute inset-x-0 top-0 h-1.5" />
        <CardHeader>
          <h1 className="font-display text-2xl font-semibold leading-tight tracking-tight text-brand-primary">{title}</h1>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </CardHeader>
        <CardContent>
          {children}
          {footer ? (
            <p className="mt-6 border-t border-brand-border/50 pt-5 text-center text-sm text-brand-primary/80">{footer}</p>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}
