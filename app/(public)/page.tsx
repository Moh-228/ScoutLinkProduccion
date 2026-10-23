import Link from "next/link";

import { buttonClassNames } from "@/components/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Icon, type IconName } from "@/components/Icon";
import { Logo } from "@/components/Logo";
import { SportCorner } from "@/components/EventCard";
import { SportArtwork, type SportArtworkKey } from "@/components/SportArtwork";
import { SportStripe } from "@/components/SportStripe";
import { BRAND_HERO_GLOW, BRAND_HERO_SURFACE } from "@/lib/brand-surfaces";
import { prisma } from "@/lib/prisma";
import { SPORT_BADGE_CLASS, SPORT_DOT_CLASS } from "@/lib/sport-colors";

const FEATURES: { title: string; description: string; icon: IconName }[] = [
  {
    title: "Perfil deportivo digital",
    description:
      "Crea tu ficha general y fichas especializadas por deporte para que los entrenadores conozcan tu nivel real.",
    icon: "id_card",
  },
  {
    title: "Descubre eventos",
    description:
      "Filtra convocatorias de torneos, entrenamientos y reclutamiento por deporte, formato y fecha.",
    icon: "calendar",
  },
  {
    title: "Postulación con seguimiento",
    description:
      "Postúlate a eventos de reclutamiento y da seguimiento al estado de cada solicitud, con afinidad calculada contra el perfil buscado.",
    icon: "person_check",
  },
];

const HOW_IT_WORKS = [
  {
    title: "1. Crea tu perfil",
    description: "Completa datos académicos y deportivos para destacar ante entrenadores.",
  },
  {
    title: "2. Descubre eventos",
    description: "Filtra oportunidades por deporte, formato y fecha.",
  },
  {
    title: "3. Postulate y da seguimiento",
    description: "Monitorea tus estados y avanza en el proceso de reclutamiento.",
  },
];

// Coach/coordinator perspective — only features that exist today (coach
// onboarding + admin verification, event creation, fichas directory and the
// applications view with affinity and status changes).
const HOW_IT_WORKS_COACH = [
  {
    title: "1. Crea tu perfil de entrenador",
    description: "Registra tu información profesional y sube los documentos que acreditan los deportes a tu cargo para que un administrador te verifique.",
  },
  {
    title: "2. Publica convocatorias",
    description: "Una vez verificado, crea torneos, entrenamientos o eventos de reclutamiento.",
  },
  {
    title: "3. Encuentra talento y da seguimiento",
    description: "Consulta las fichas de deportistas, revisa la afinidad de cada postulación y actualiza su estado.",
  },
];

const HOW_IT_WORKS_TRACKS: { audience: string; icon: IconName; steps: typeof HOW_IT_WORKS; numberClass: string }[] = [
  { audience: "Para deportistas", icon: "person", steps: HOW_IT_WORKS, numberClass: "bg-brand-primary group-hover:bg-brand-secondary" },
  { audience: "Para entrenadores", icon: "verified_user", steps: HOW_IT_WORKS_COACH, numberClass: "bg-brand-secondary group-hover:bg-brand-primary" },
];

const SPORTS = [
  {
    name: "Fútbol",
    description:
      "Deporte de equipo en el que dos conjuntos de 11 jugadores compiten por introducir un balón en la portería rival usando los pies. Combina resistencia, técnica y trabajo colectivo.",
  },
  {
    name: "Básquetbol",
    description:
      "Deporte de equipo donde cinco jugadores por lado intentan anotar encestando un balón en el aro contrario. Requiere velocidad, coordinación y visión de juego.",
  },
  {
    name: "Tocho bandera",
    description:
      "Variante del fútbol americano sin contacto físico directo, donde se detiene al portador del balón arrancándole una bandera en la cadera. Desarrolla agilidad, estrategia y trabajo en equipo.",
  },
  {
    name: "Voleibol",
    description:
      "Deporte de red en el que dos equipos de seis jugadores se alternan para golpear un balón y que caiga en el campo contrario. Exige coordinación, salto y comunicación entre compañeros.",
  },
];

const REQUIREMENTS = [
  {
    role: "deportistas",
    items: [
      {
        label: "Comprobante de inscripción",
        description: "Documento oficial que acredita que estás inscrito en la institución.",
      },
      {
        label: "Seguro médico",
        description:
          "Constancia de seguro médico activo. No es obligatorio para registrarse, pero es necesario para acceder a todas las funcionalidades de la aplicación.",
      },
    ],
  },
  {
    role: "entrenadores",
    items: [
      {
        label: "Documento de responsable del deporte",
        description:
          "Documento que acredita tu designación como responsable técnico del deporte en la institución.",
      },
    ],
  },
];

const SPORT_ACCENT = SPORT_DOT_CLASS;

const SPORT_KEY_BY_NAME: Record<string, SportArtworkKey> = {
  Fútbol: "soccer",
  Básquetbol: "basketball",
  "Tocho bandera": "flag_football",
  Voleibol: "volleyball",
};

// Laid out around the logo in the same order as its quadrants.
// The artwork carries its own colors and sits directly on the hero background.
const DECOR_SPORTS: { sport: SportArtworkKey; className: string; size: number }[] = [
  { sport: "basketball", className: "left-[8%] top-2 h-24 w-24", size: 92 },
  { sport: "soccer", className: "right-[10%] top-6 h-20 w-20", size: 76 },
  { sport: "volleyball", className: "left-[14%] bottom-4 h-20 w-20", size: 76 },
  { sport: "flag_football", className: "right-[6%] bottom-0 h-24 w-24", size: 92 },
];

const FEATURE_ICON_CLASS = ["bg-brand-secondary text-white", "bg-sport-volleyball text-brand-primary", "bg-brand-primary text-white"];

const FOCUS_RING = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interaction focus-visible:ring-offset-2";

function SectionHeading({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div>
      <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-brand-secondary">
        <span aria-hidden="true" className="h-0.5 w-6 rounded-full bg-brand-secondary" />
        {kicker}
      </p>
      <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-balance text-brand-primary sm:text-4xl">
        {title}
      </h2>
    </div>
  );
}

export default async function Home() {
  const openEvents = await prisma.event.findMany({
    where: { status: "open" },
    orderBy: { createdAt: "desc" },
    take: 6,
    include: {
      coach: { select: { coachProfile: { select: { displayName: true } } } },
    },
  });

  const TYPE_LABELS: Record<string, string> = {
    tournament: "Torneo",
    training: "Entrenamiento",
    recruitment: "Reclutamiento",
  };

  const SPORT_LABELS: Record<string, string> = {
    basketball: "Básquetbol",
    soccer: "Fútbol",
    flag_football: "Flag Football",
    volleyball: "Voleibol",
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-4 pb-12 pt-6 sm:gap-24 sm:px-6 lg:px-8">
      {/* ── Header ── */}
      <header className="flex items-center justify-between gap-4">
        <Link href="/" className={`flex items-center gap-2.5 rounded-lg ${FOCUS_RING}`}>
          <Logo size={36} />
          <span className="font-display text-xl font-bold tracking-tight text-brand-primary">ScoutLink</span>
        </Link>

        <nav aria-label="Secciones" className="hidden items-center gap-7 text-sm font-medium md:flex">
          {[
            { label: "Plataforma", href: "#plataforma" },
            { label: "Cómo funciona", href: "#como-funciona" },
            ...(openEvents.length > 0 ? [{ label: "Eventos", href: "#eventos" }] : []),
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`rounded text-brand-primary/70 decoration-brand-secondary decoration-2 underline-offset-8 transition-colors hover:text-brand-primary hover:underline ${FOCUS_RING}`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/auth/login" className={`inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold text-brand-primary transition-colors hover:bg-white sm:px-4 ${FOCUS_RING}`}>
            Iniciar sesión
          </Link>
          {/* Wrapper handles visibility: buttonClassNames already sets `inline-flex`, which would override `hidden`. */}
          <div className="hidden sm:block">
            <Link
              href="/auth/register"
              className={buttonClassNames(
                "primary",
                "shadow-md shadow-brand-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-lg motion-reduce:transform-none",
              )}
            >
              Registrarme
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className={`relative -mx-4 -mt-8 overflow-hidden rounded-3xl px-6 py-14 sm:mx-0 sm:-mt-10 sm:px-12 sm:py-20 ${BRAND_HERO_SURFACE}`}>
        <div
          aria-hidden="true"
          className={BRAND_HERO_GLOW}
        />
        <div className="relative grid items-center gap-10 lg:grid-cols-2">
          <div>
            <Badge variant="info" className="border-white/30 bg-white/15 text-white">
              Reclutamiento deportivo universitario
            </Badge>
            <h1 className="mt-6 max-w-xl font-display text-4xl font-bold leading-[1.08] tracking-tight text-balance text-white sm:text-5xl">
              Conectando talento estudiantil con oportunidades de reclutamiento universitario.
            </h1>
            <SportStripe className="mt-6 h-1.5 w-28 rounded-full" />
            <div className="mt-6 max-w-lg space-y-3 text-base leading-relaxed text-white/80 sm:text-lg">
              <p>
                Un espacio para que estudiantes deportistas muestren su perfil, postulen a eventos y reciban seguimiento de entrenadores.
              </p>
              <p>
                Un espacio para que entrenadores encuentren talento deportivo, publiquen convocatorias y den seguimiento a estudiantes interesados en integrarse a sus equipos.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/auth/login"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-brand-primary shadow-lg shadow-black/15 transition-all hover:-translate-y-0.5 hover:bg-brand-background hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-primary motion-reduce:transform-none sm:w-auto"
              >
                <Icon name="login" size={18} />
                Iniciar sesión
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex w-full items-center justify-center rounded-lg px-5 py-3 text-sm font-bold text-white ring-1 ring-white/50 transition-all hover:-translate-y-0.5 hover:bg-white/10 hover:ring-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white motion-reduce:transform-none sm:w-auto"
              >
                Registrarme
              </Link>
            </div>
          </div>

          <div className="relative hidden h-80 lg:block" aria-hidden="true">
            <span className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
              <Logo size={150} onDark />
            </span>
            {DECOR_SPORTS.map((s) => (
              <span
                key={s.sport}
                className={`absolute flex items-center justify-center drop-shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:scale-105 motion-reduce:transform-none ${s.className}`}
              >
                <SportArtwork sport={s.sport} size={s.size} />
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="plataforma" className="scroll-mt-8">
        <SectionHeading kicker="Plataforma" title="Todo lo que necesitas para tu proceso de reclutamiento" />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <div key={feature.title} className="group transition-transform duration-200 hover:-translate-y-1 motion-reduce:transform-none">
              <Card className="h-full border-transparent bg-linear-to-br from-white to-brand-background">
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-200 group-hover:-rotate-6 group-hover:scale-105 motion-reduce:transform-none ${
                    FEATURE_ICON_CLASS[i % FEATURE_ICON_CLASS.length]
                  }`}
                >
                  <Icon name={feature.icon} size={24} />
                </span>
                <CardHeader>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="como-funciona" className="scroll-mt-8">
        <SectionHeading kicker="Proceso" title="Cómo funciona" />
        <div className="mt-10 space-y-12">
          {HOW_IT_WORKS_TRACKS.map((track) => (
            <div key={track.audience}>
              <h3 className="flex items-center gap-2.5 font-display text-lg font-semibold text-brand-primary">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-secondary/10 text-brand-secondary">
                  <Icon name={track.icon} size={20} />
                </span>
                {track.audience}
              </h3>
              <div className="relative mt-6">
                <div
                  className="absolute left-6 right-6 top-6 hidden border-t-2 border-dashed border-brand-border md:block"
                  aria-hidden="true"
                />
                <ol className="relative grid gap-8 md:grid-cols-3">
                  {track.steps.map((step, i) => (
                    <li key={step.title} className="group flex flex-col items-start gap-3">
                      <span
                        className={`flex h-12 w-12 items-center justify-center rounded-full font-display text-lg font-bold text-white ring-4 ring-brand-background transition-colors duration-200 ${track.numberClass}`}
                      >
                        {i + 1}
                      </span>
                      <p className="font-display text-lg font-semibold text-brand-primary">{step.title.replace(/^\d+\.\s*/, "")}</p>
                      <p className="text-sm leading-relaxed text-brand-primary/70">{step.description}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Why ScoutLink ── */}
      <section>
        <SectionHeading kicker="Por qué ScoutLink" title="Pensado para deportistas y entrenadores" />

        <div className="mt-6 flex flex-wrap gap-x-4 gap-y-3">
          {SPORTS.map((sport) => (
            // Artwork inside the badge on a compact white tile (only behind the SVG) so its
            // colors don't blend into the solid badge. Height stays 28px: py-1 (4px) + 20px
            // tile + py-1, same as the previous py-1.5 + 16px text line; only the width grows.
            <Badge
              key={sport.name}
              variant="neutral"
              className={`gap-1.5 py-1 pl-1 pr-3 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:transform-none ${SPORT_BADGE_CLASS[SPORT_KEY_BY_NAME[sport.name]] ?? ""}`}
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] bg-white">
                <SportArtwork sport={SPORT_KEY_BY_NAME[sport.name]} size={14} />
              </span>
              {sport.name}
            </Badge>
          ))}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {REQUIREMENTS.map((group) => (
            <Card key={group.role}>
              <CardHeader>
                <CardTitle>Para {group.role}</CardTitle>
                <CardDescription>Documentación sugerida al registrarte.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {group.items.map((item) => (
                  <div key={item.label} className="flex gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-secondary/15 text-brand-secondary">
                      <Icon name="check_small" size={20} />
                    </span>
                    <div>
                      <p className="font-medium text-brand-primary">{item.label}</p>
                      <p className="text-sm leading-relaxed text-brand-primary/70">{item.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Eventos abiertos ── */}
      {openEvents.length > 0 && (
        <section id="eventos" className="scroll-mt-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading kicker="En este momento" title="Eventos abiertos" />
            <Link
              href="/auth/login"
              className={`group inline-flex items-center gap-1 rounded text-sm font-semibold text-brand-secondary hover:text-brand-primary ${FOCUS_RING}`}
            >
              Ver todos
              <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transform-none">→</span>
            </Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {openEvents.map((event) => (
              <div key={event.id} className="transition-transform duration-200 hover:-translate-y-1 motion-reduce:transform-none">
                <Card className="relative h-full overflow-hidden pt-6">
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-0 top-0 h-1.5 ${SPORT_ACCENT[event.sport] ?? "bg-brand-border"}`}
                  />
                  <SportCorner sport={event.sport} />
                  <CardHeader className="pr-16">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <Badge variant="info">{TYPE_LABELS[event.type] ?? event.type}</Badge>
                      <Badge variant="neutral" className={SPORT_BADGE_CLASS[event.sport]}>
                        {SPORT_LABELS[event.sport] ?? event.sport}
                      </Badge>
                    </div>
                    <CardTitle>{event.title}</CardTitle>
                    <CardDescription>{event.coach.coachProfile?.displayName ?? "—"}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-4">
                    {(event.startAt || event.locationText) && (
                      <div className="space-y-1.5 text-sm text-brand-primary/70">
                        {event.startAt && (
                          <p className="flex items-center gap-2">
                            <Icon name="calendar" size={16} className="shrink-0 text-brand-primary/40" />
                            {new Date(event.startAt).toLocaleDateString("es-MX", {
                              day: "numeric",
                              month: "short",
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </p>
                        )}
                        {event.locationText && (
                          <p className="flex items-center gap-2">
                            <Icon name="location_on" size={16} className="shrink-0 text-brand-primary/40" />
                            {event.locationText}
                          </p>
                        )}
                      </div>
                    )}
                    {event.shortDescription && (
                      <p className="text-sm text-brand-primary/70 line-clamp-2">{event.shortDescription}</p>
                    )}
                    <p className="mt-auto border-t border-brand-border/50 pt-4 text-sm">
                      <Link
                        href="/auth/login"
                        className={`group inline-flex items-center gap-1 rounded font-semibold text-brand-secondary hover:text-brand-primary ${FOCUS_RING}`}
                      >
                        Iniciar sesión para postularme
                        <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transform-none">→</span>
                      </Link>
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Final CTA ── */}
      <section className="relative overflow-hidden rounded-3xl bg-brand-primary px-8 py-14 text-center sm:px-16">
        <SportStripe className="absolute inset-x-0 top-0 h-1.5" />
        <h2 className="font-display text-2xl font-bold tracking-tight text-balance text-white sm:text-4xl">
          Empieza tu proceso de reclutamiento hoy
        </h2>
        <p className="mx-auto mt-4 max-w-xl leading-relaxed text-white/75">
          Crea tu cuenta, arma tu perfil deportivo y postúlate a las oportunidades que buscas.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/auth/register"
            className="inline-flex w-full items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-brand-primary shadow-lg shadow-black/15 transition-all hover:-translate-y-0.5 hover:bg-brand-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-primary motion-reduce:transform-none sm:w-auto"
          >
            Registrarme
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex w-full items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/40 transition-all hover:-translate-y-0.5 hover:bg-white/10 hover:ring-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white motion-reduce:transform-none sm:w-auto"
          >
            Iniciar sesión
          </Link>
        </div>
      </section>

      <footer className="border-t border-brand-border py-8 text-sm text-brand-primary/70">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2">
            <Logo size={22} />
            <span className="font-display font-semibold text-brand-primary">ScoutLink</span>
            <span aria-hidden="true">·</span>
            Prototipo UI 2026
          </p>
          <Link
            href="/aviso-de-privacidad"
            className={`rounded font-medium text-brand-secondary hover:text-brand-primary hover:underline ${FOCUS_RING}`}
          >
            Aviso de privacidad
          </Link>
        </div>
      </footer>
    </main>
  );
}
