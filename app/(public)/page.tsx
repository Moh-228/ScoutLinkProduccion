import Link from "next/link";

import { buttonClassNames } from "@/components/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Icon, type IconName } from "@/components/Icon";
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

const SPORT_ICON: Record<string, IconName> = {
  Fútbol: "sports_soccer",
  Básquetbol: "sports_basketball",
  "Tocho bandera": "sports_tocho",
  Voleibol: "sports_volleyball",
};

const REQUIREMENTS = [
  {
    role: "Deportista",
    items: [
      {
        label: "Comprobante de inscripción",
        description: "Documento oficial que acredita que estás inscrito en la institución.",
        link: null as string | null,
      },
      {
        label: "Seguro médico",
        description:
          "Constancia de seguro médico activo. No es obligatorio para registrarse, pero es necesario para acceder a todas las funcionalidades de la aplicación.",
        link: "https://drive.google.com",
      },
    ],
  },
  {
    role: "Entrenador",
    items: [
      {
        label: "Documento de responsable del deporte",
        description:
          "Documento que acredita tu designación como responsable técnico del deporte en la institución.",
        link: "https://drive.google.com",
      },
    ],
  },
];

const SPORT_ACCENT = SPORT_DOT_CLASS;

const SPORT_KEY_BY_NAME: Record<string, string> = {
  Fútbol: "soccer",
  Básquetbol: "basketball",
  "Tocho bandera": "flag_football",
  Voleibol: "volleyball",
};

const DECOR_SPORTS: { icon: IconName; accent: string; className: string; iconSize: number }[] = [
  { icon: "sports_basketball", accent: "bg-sport-basketball", className: "left-4 top-0 h-32 w-32", iconSize: 48 },
  { icon: "sports_soccer", accent: "bg-sport-football", className: "right-8 top-10 h-24 w-24", iconSize: 32 },
  { icon: "sports_volleyball", accent: "bg-sport-volleyball", className: "left-16 bottom-4 h-28 w-28", iconSize: 40 },
  { icon: "sports_tocho", accent: "bg-sport-tocho", className: "right-2 bottom-0 h-20 w-20", iconSize: 28 },
];

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
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-24 px-4 py-12 sm:px-6 lg:px-8">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-primary text-sm font-bold text-white">
            SL
          </span>
          <p className="text-lg font-bold tracking-tight text-brand-primary">Scoutlink</p>
        </div>
      </div>

      {/* ── Hero ── */}
      <section className="relative -mx-4 overflow-hidden rounded-3xl bg-linear-to-br from-brand-primary via-brand-primary to-brand-secondary px-6 py-14 sm:mx-0 sm:px-12 sm:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-secondary/40 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-sport-volleyball/30 blur-3xl"
        />
        <div className="relative grid items-center gap-10 lg:grid-cols-2">
          <div>
            <Badge variant="info" className="border-white/30 bg-white/15 text-white">
              Reclutamiento deportivo universitario
            </Badge>
            <h1 className="mt-5 max-w-xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Conecta talento estudiantil con oportunidades de reclutamiento universitario.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-white/80">
              Un espacio para que estudiantes deportistas muestren su perfil, postulen a eventos y reciban seguimiento de entrenadores.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/auth/login"
                className="inline-flex w-full items-center justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-brand-primary shadow-lg shadow-black/10 transition-colors hover:bg-brand-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interaction sm:w-auto"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-bold text-white ring-1 ring-white/50 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interaction sm:w-auto"
              >
                Registrarme
              </Link>
            </div>
          </div>

          <div className="relative hidden h-72 lg:block" aria-hidden="true">
            {DECOR_SPORTS.map((s) => (
              <span
                key={s.icon}
                className={`absolute flex items-center justify-center rounded-full text-white shadow-xl ring-4 ring-white/20 ${s.accent} ${s.className}`}
              >
                <Icon name={s.icon} size={s.iconSize} />
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section>
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-secondary">Plataforma</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-brand-primary sm:text-3xl">
          Todo lo que necesitas para tu proceso de reclutamiento
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <Card key={feature.title} className="border-transparent bg-linear-to-br from-white to-brand-background">
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-xl text-white ${
                  ["bg-brand-secondary", "bg-sport-volleyball", "bg-brand-primary"][i % 3]
                }`}
              >
                <Icon name={feature.icon} size={24} />
              </span>
              <CardHeader>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section>
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-secondary">Proceso</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-brand-primary sm:text-3xl">Cómo funciona</h2>
        <div className="relative mt-10 grid gap-8 md:grid-cols-3">
          <div className="absolute left-0 right-0 top-6 hidden h-px bg-brand-border md:block" aria-hidden="true" />
          {HOW_IT_WORKS.map((step, i) => (
            <div key={step.title} className="relative flex flex-col items-start gap-3">
              <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary text-lg font-bold text-white">
                {i + 1}
              </span>
              <p className="text-lg font-semibold text-brand-primary">{step.title.replace(/^\d+\.\s*/, "")}</p>
              <p className="text-sm text-brand-primary/70">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Why ScoutLink ── */}
      <section>
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-secondary">Por qué Scoutlink</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-brand-primary sm:text-3xl">
          Pensado para deportistas y entrenadores
        </h2>

        <div className="mt-6 flex flex-wrap gap-2">
          {SPORTS.map((sport) => (
            <Badge
              key={sport.name}
              variant="neutral"
              className={`gap-1.5 ${SPORT_BADGE_CLASS[SPORT_KEY_BY_NAME[sport.name]] ?? ""}`}
            >
              <Icon name={SPORT_ICON[sport.name] ?? "star"} size={14} />
              {sport.name}
            </Badge>
          ))}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {REQUIREMENTS.map((group) => (
            <Card key={group.role}>
              <CardHeader>
                <CardTitle>Para {group.role.toLowerCase()}s</CardTitle>
                <CardDescription>Documentación sugerida al registrarte.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {group.items.map((item) => (
                  <div key={item.label} className="flex gap-3">
                    <Icon name="check_small" size={20} className="mt-0.5 shrink-0 text-brand-secondary" />
                    <div>
                      <p className="font-medium text-brand-primary">{item.label}</p>
                      <p className="text-sm text-brand-primary/70">{item.description}</p>
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-sm text-brand-secondary underline underline-offset-2 hover:text-brand-primary"
                        >
                          Por ejemplo, utiliza Google Drive
                        </a>
                      )}
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
        <section>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-brand-secondary">En este momento</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-brand-primary sm:text-3xl">Eventos abiertos</h2>
            </div>
            <Link href="/auth/login" className="text-sm font-semibold text-brand-secondary hover:text-brand-primary">
              Ver todos →
            </Link>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {openEvents.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span
                      aria-hidden="true"
                      className={`h-2.5 w-2.5 rounded-full ${SPORT_ACCENT[event.sport] ?? "bg-brand-border"}`}
                    />
                    <Badge variant="info">{TYPE_LABELS[event.type] ?? event.type}</Badge>
                    <Badge variant="neutral" className={SPORT_BADGE_CLASS[event.sport]}>
                      {SPORT_LABELS[event.sport] ?? event.sport}
                    </Badge>
                  </div>
                  <CardTitle>{event.title}</CardTitle>
                  <CardDescription>{event.coach.coachProfile?.displayName ?? "—"}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                  <p className="text-sm">
                    <Link href="/auth/login" className="font-semibold text-brand-secondary hover:text-brand-primary">
                      Iniciar sesión para postularme →
                    </Link>
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* ── Final CTA ── */}
      <section className="rounded-3xl bg-brand-primary px-8 py-12 text-center sm:px-16">
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Empieza tu proceso de reclutamiento hoy
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-white/70">
          Crea tu cuenta, arma tu perfil deportivo y postúlate a las oportunidades que buscas.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/auth/register" className={buttonClassNames("secondary", "w-full sm:w-auto")}>
            Registrarme
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/40 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interaction sm:w-auto"
          >
            Iniciar sesión
          </Link>
        </div>
      </section>

      <footer className="border-t border-brand-border py-8 text-sm text-brand-primary/70">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p>Scoutlink - Prototipo UI 2026</p>
          <Link href="/aviso-de-privacidad" className="font-medium text-brand-secondary hover:text-brand-primary hover:underline">
            Aviso de privacidad
          </Link>
        </div>
      </footer>
    </main>
  );
}
