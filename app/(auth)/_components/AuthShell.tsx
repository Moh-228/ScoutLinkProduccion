import Link from "next/link";
import { type ReactNode } from "react";

import { Card, CardContent, CardDescription, CardHeader } from "@/components/Card";
import { Icon } from "@/components/Icon";
import { Logo } from "@/components/Logo";
import { SportArtwork } from "@/components/SportArtwork";
import { SportStripe } from "@/components/SportStripe";
import { BRAND_HERO_GLOW, BRAND_HERO_SURFACE } from "@/lib/brand-surfaces";

export const AUTH_FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interaction focus-visible:ring-offset-2";

/** Focus ring for links placed on the dark brand surface (white ring, offset matches the surface). */
const AUTH_FOCUS_RING_ON_BRAND =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-primary";

/** Same message as the landing hero headline, reused (not new copy) for the identity panel. */
const BRAND_MESSAGE = "Conectando talento estudiantil con oportunidades de reclutamiento universitario.";

/** "light" = default page background; "brand" = on the landing hero's color block. */
type AuthTone = "light" | "brand";

/**
 * Padded, centered frame for auth pages that use the regular (light) layout.
 * It used to live in app/(auth)/layout.tsx; it moved here so the split
 * login/register layout can span the full viewport.
 */
export function AuthPageFrame({ children }: { children: ReactNode }) {
  return (
    <div className="px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-3xl">{children}</div>
    </div>
  );
}

/** "Volver a …" link shown above the auth content. */
export function AuthBackLink({ href, label, tone = "light" }: { href: string; label: string; tone?: AuthTone }) {
  const colors =
    tone === "brand"
      ? `text-white/80 hover:text-white ${AUTH_FOCUS_RING_ON_BRAND}`
      : `text-brand-primary/70 hover:text-brand-primary ${AUTH_FOCUS_RING}`;
  return (
    <Link href={href} className={`group inline-flex items-center gap-1.5 rounded text-sm transition-colors ${colors}`}>
      <Icon
        name="arrow"
        size={16}
        className="transition-transform duration-200 group-hover:-translate-x-0.5 motion-reduce:transform-none"
      />
      {label}
    </Link>
  );
}

/** Logo + "ScoutLink", linking home. On the brand tone the logo uses its `onDark` treatment. */
export function AuthBrand({ tone = "light" }: { tone?: AuthTone }) {
  return (
    <Link
      href="/"
      className={`mx-auto mb-8 flex w-fit flex-col items-center gap-3 rounded-xl ${tone === "brand" ? AUTH_FOCUS_RING_ON_BRAND : AUTH_FOCUS_RING}`}
    >
      <Logo size={64} onDark={tone === "brand"} />
      <span
        className={`font-display text-2xl font-bold tracking-tight ${tone === "brand" ? "text-white" : "text-brand-primary"}`}
      >
        ScoutLink
      </span>
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
  /**
   * "brand" = split layout (login/register): ScoutLink identity panel on the
   * landing hero's color block (BRAND_HERO_SURFACE) + white form panel.
   * "light" (default) = single centered card on the page background.
   */
  surface?: AuthTone;
  /** Brand panel only: drops the kicker and enlarges the logo, name, message and stripe. */
  large?: boolean;
};

/** Extra classes for the full-width submit `Button` (only adds width + shadow; no conflict with its variant classes). */
export const AUTH_SUBMIT_CLASS = "w-full shadow-md shadow-brand-primary/20 hover:shadow-lg hover:shadow-brand-primary/25";

/** Link style for links inside the auth footer line. */
export const AUTH_FOOTER_LINK = `rounded font-semibold text-brand-secondary underline underline-offset-2 transition-colors hover:text-brand-primary ${AUTH_FOCUS_RING}`;

function AuthHeading({ title, description }: { title: ReactNode; description?: ReactNode }) {
  return (
    <>
      <h1 className="font-display text-2xl font-semibold leading-tight tracking-tight text-brand-primary">{title}</h1>
      {description ? <CardDescription>{description}</CardDescription> : null}
    </>
  );
}

function AuthFooter({ children }: { children: ReactNode }) {
  return <p className="mt-6 border-t border-brand-border/50 pt-5 text-center text-sm text-brand-primary/80">{children}</p>;
}

// Same composition as the landing hero's visual (app/(public)/page.tsx): the
// logo in the centre with the four sport artworks around it, in the order of
// the logo's quadrants, with a soft drop shadow. Scaled for the auth panel.
const PANEL_DECOR: { sport: "basketball" | "soccer" | "volleyball" | "flag_football"; className: string; size: number }[] = [
  { sport: "basketball", className: "left-[6%] top-0", size: 80 },
  { sport: "soccer", className: "right-[8%] top-4", size: 66 },
  { sport: "volleyball", className: "left-[12%] bottom-2", size: 66 },
  { sport: "flag_football", className: "right-[4%] bottom-0", size: 80 },
];

/** The four sports for the compact mobile row (artwork + accessible name). */
const PANEL_SPORTS: { sport: "soccer" | "basketball" | "volleyball" | "flag_football"; label: string }[] = [
  { sport: "soccer", label: "Fútbol" },
  { sport: "basketball", label: "Básquetbol" },
  { sport: "volleyball", label: "Voleibol" },
  { sport: "flag_football", label: "Tocho bandera" },
];

/** Shared presentation for auth forms. */
export function AuthShell({ back, title, description, children, footer, surface = "light", large = false }: AuthShellProps) {
  if (surface === "brand") {
    // Login/register as a continuation of the landing page: page background with a
    // rounded hero-style identity block (same gradient, kicker, logo + sports visual,
    // display type) next to a white section-style surface holding the form.
    return (
      <div className="px-4 py-4 sm:px-6 sm:py-6 lg:p-0">
        <div className="mx-auto grid w-full max-w-6xl gap-4 sm:gap-6 lg:min-h-screen lg:max-w-none lg:grid-cols-2 lg:gap-0">
          {/* Identity block (hero style); on desktop it fills the whole left half */}
          <aside className={`relative overflow-hidden rounded-3xl px-5 py-5 lg:rounded-none sm:px-8 sm:py-7 lg:flex lg:flex-col lg:px-12 lg:py-10 ${BRAND_HERO_SURFACE}`}>
            <div aria-hidden="true" className={BRAND_HERO_GLOW} />

            {back ? (
              <div className="relative">
                <AuthBackLink href={back.href} label={back.label} tone="brand" />
              </div>
            ) : null}

            {/* Phones: compact brand row + compact sports row */}
            <div className="relative mt-4 flex items-center justify-between gap-3 lg:hidden">
              <Link href="/" className={`inline-flex items-center gap-3 rounded-xl ${AUTH_FOCUS_RING_ON_BRAND}`}>
                <Logo size={40} onDark />
                <span className="font-display text-2xl font-bold tracking-tight text-white">ScoutLink</span>
              </Link>
              <ul className="flex items-center gap-1.5" aria-label="Deportes en ScoutLink">
                {PANEL_SPORTS.map((s) => (
                  <li key={s.sport} className="drop-shadow-md">
                    <SportArtwork sport={s.sport} size={24} title={s.label} />
                  </li>
                ))}
              </ul>
            </div>

            {/* Desktop: kicker → logo + sports visual → name, message, stripe */}
            <div className="relative hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center">
              {large ? null : (
                <span className="inline-flex w-fit items-center rounded-full border border-white/30 bg-white/15 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                  Reclutamiento deportivo universitario
                </span>
              )}

              <div
                className={`relative mx-auto w-full ${large ? "mt-6 h-96 max-w-lg" : "mt-8 h-64 max-w-md"}`}
                aria-hidden="true"
              >
                <span className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
                  <Logo size={large ? 176 : 124} onDark />
                </span>
                {PANEL_DECOR.map((s) => (
                  <span key={s.sport} className={`absolute flex items-center justify-center drop-shadow-lg ${s.className}`}>
                    <SportArtwork sport={s.sport} size={large ? Math.round(s.size * 1.4) : s.size} />
                  </span>
                ))}
              </div>

              <Link href="/" className={`${large ? "mt-6" : "mt-8"} w-fit rounded-xl ${AUTH_FOCUS_RING_ON_BRAND}`}>
                <span className={`font-display font-bold tracking-tight text-white ${large ? "text-6xl" : "text-5xl"}`}>ScoutLink</span>
              </Link>
              <p className={`mt-3 max-w-md leading-relaxed text-white/80 ${large ? "text-2xl" : "text-lg"}`}>{BRAND_MESSAGE}</p>
              <SportStripe className={`mt-6 rounded-full ${large ? "h-2.5 w-48" : "h-1.5 w-28"}`} />
            </div>
          </aside>

          {/* Form surface (section style: white, rounded, hairline border, top sport stripe),
              centred in the right half on desktop */}
          <div className="lg:flex lg:items-center lg:justify-center lg:p-10">
            <main className="relative flex overflow-hidden rounded-3xl border border-brand-border/50 bg-white shadow-sm shadow-brand-primary/5 lg:w-full lg:max-w-[34rem]">
              <SportStripe className="absolute inset-x-0 top-0 h-1.5" />
              <div className="mx-auto flex w-full max-w-md flex-col justify-center px-5 py-8 sm:px-8 sm:py-10 lg:max-w-lg lg:px-12">
                <div className="space-y-1.5">
                  <h1 className="font-display text-2xl font-bold leading-tight tracking-tight text-brand-primary sm:text-3xl">{title}</h1>
                  {description ? <CardDescription>{description}</CardDescription> : null}
                </div>
                <div className="mt-7">{children}</div>
                {footer ? <AuthFooter>{footer}</AuthFooter> : null}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthPageFrame>
      <main className="relative mx-auto w-full max-w-md">
        {back ? (
          <div className="mb-6">
            <AuthBackLink href={back.href} label={back.label} />
          </div>
        ) : null}
        <AuthBrand />
        <Card className="relative overflow-hidden pt-7 sm:px-8 sm:pb-8">
          <SportStripe className="absolute inset-x-0 top-0 h-1.5" />
          <CardHeader>
            <AuthHeading title={title} description={description} />
          </CardHeader>
          <CardContent>
            {children}
            {footer ? <AuthFooter>{footer}</AuthFooter> : null}
          </CardContent>
        </Card>
      </main>
    </AuthPageFrame>
  );
}
