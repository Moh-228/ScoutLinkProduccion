
import Link from "next/link";

import { buttonClassNames } from "@/components/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { prisma } from "@/lib/prisma";

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

const REQUIREMENTS = [
  {
    role: "Deportista",
    items: [
      {
        label: "Comprobante de inscripción",
        description: "Documento oficial que acredita que estás inscrito en la institución.",
        link: null,
      },
      {
        label: "Seguro médico",
        description: "Constancia de seguro médico activo. No es obligatorio para registrarse, pero es necesario para acceder a todas las funcionalidades de la aplicación.",
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
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-12 sm:px-6 lg:px-8">
      <section className="rounded-3xl bg-[#18181b] p-8 shadow-sm ring-1 ring-slate-200 sm:p-12">
        <p className="text-xl font-bold uppercase tracking-[0.3em] text-[#1883FF]">Scoutlink</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Conecta talento estudiantil con oportunidades de reclutamiento universitario.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-white">
          Un espacio para que estudiantes deportistas muestren su perfil, postulen a eventos y reciban seguimiento de entrenadores.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/auth/login" className={buttonClassNames("primary", "w-full sm:w-auto")}>
            Iniciar sesión
          </Link>
          <Link href="/auth/register" className={buttonClassNames("secondary", "w-full sm:w-auto")}>
            Registrarme
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold tracking-tight text-white">Cómo funciona</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {HOW_IT_WORKS.map((step) => (
            <Card key={step.title}>
              <CardHeader>
                <CardTitle>{step.title}</CardTitle>
                <CardDescription>{step.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold tracking-tight text-white">Deportes</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SPORTS.map((sport) => (
            <Card key={sport.name}>
              <CardHeader>
                <CardTitle>{sport.name}</CardTitle>
                <CardDescription>{sport.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold tracking-tight text-white">Qué necesitas</h2>
        <p className="mt-2 text-slate-400">
          Dependiendo de tu rol, deberás contar con la siguiente documentación al momento de registrarte. Dicha documentacion debera accederse mediante un enlace externo, por ejemplo, utilizando Google Drive.
        </p>
        <div className="mt-5 grid gap-6 md:grid-cols-2">
          {REQUIREMENTS.map((group) => (
            <Card key={group.role}>
              <CardHeader>
                <CardTitle>{group.role}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {group.items.map((item) => (
                  <div key={item.label} className="flex flex-col gap-1">
                    <p className="font-medium text-white">{item.label}</p>
                    <p className="text-sm text-slate-400">{item.description}</p>
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-sm text-[#1883FF] underline underline-offset-2 hover:text-blue-400"
                      >
                        Por ejemplo, utiliza Google Drive
                      </a>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {openEvents.length > 0 && (
        <section>
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight text-white">Eventos abiertos</h2>
            <Link href="/auth/login" className="text-sm font-semibold text-[#1883ff] hover:underline">
              Ver todos →
            </Link>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {openEvents.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <div className="flex flex-wrap gap-2 mb-1">
                    <Badge variant="info">{TYPE_LABELS[event.type] ?? event.type}</Badge>
                    <Badge variant="neutral">{SPORT_LABELS[event.sport] ?? event.sport}</Badge>
                  </div>
                  <CardTitle>{event.title}</CardTitle>
                  <CardDescription>
                    {event.coach.coachProfile?.displayName ?? "—"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {event.shortDescription && (
                    <p className="text-sm text-white/60 line-clamp-2">{event.shortDescription}</p>
                  )}
                  <p className="mt-3 text-sm">
                    <Link href="/auth/login" className="font-semibold text-[#1883ff] hover:underline">
                      Iniciar sesión para postularme →
                    </Link>
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <footer className="border-t border-slate-200 py-8 text-sm text-white">
        <p>Scoutlink - Prototipo UI 2026</p>
      </footer>
    </main>
  );
}