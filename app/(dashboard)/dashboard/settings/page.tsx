import { redirect } from "next/navigation";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card";
import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DeactivateAccountSection } from "./_components/DeactivateAccountSection";
import { InterestedSportsForm } from "./_components/InterestedSportsForm";
import { NotificationPreferencesForm } from "./_components/NotificationPreferencesForm";
import { PrivacyToggle } from "./_components/PrivacyToggle";

export default async function SettingsPage() {
  const session = await verifySession();
  if (!session) redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      role: true,
      contactEmailVisible: true,
      notificationsEnabled: true,
      notificationPreferences: true,
      studentProfile: { select: { interestedSports: true } },
    },
  });

  if (!user) redirect("/auth/login");

  const isStudent = user.role === "student";
  const isCoach = user.role === "coach";
  const preferences = (user.notificationPreferences ?? {}) as Record<string, boolean>;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold text-brand-primary">Configuración</h1>
        <p className="text-brand-primary/70">Privacidad, notificaciones y seguridad de tu cuenta.</p>
      </header>

      <div className="mx-auto w-full max-w-2xl space-y-6">
        {isStudent && (
          <Card>
            <CardHeader>
              <CardTitle>Deportes de interés</CardTitle>
              <CardDescription>
                Personaliza el contenido y las notificaciones que recibes según los deportes que te interesan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InterestedSportsForm initialSports={user.studentProfile?.interestedSports ?? []} />
            </CardContent>
          </Card>
        )}

        {(isStudent || isCoach) && (
          <Card>
            <CardHeader>
              <CardTitle>Privacidad de contacto</CardTitle>
              <CardDescription>
                {isStudent
                  ? "Tu correo institucional solo se muestra cuando un entrenador o administrador selecciona \"Contactar\"."
                  : "Tu correo solo se muestra cuando otro usuario selecciona \"Contactar\"."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PrivacyToggle initialVisible={user.contactEmailVisible} />
            </CardContent>
          </Card>
        )}

        {(isStudent || isCoach) && (
          <Card>
            <CardHeader>
              <CardTitle>Notificaciones</CardTitle>
              <CardDescription>Activa o desactiva avisos de forma general y por tipo.</CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationPreferencesForm
                role={user.role === "coach" ? "coach" : "student"}
                initialEnabled={user.notificationsEnabled}
                initialPreferences={preferences}
              />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Privacidad y datos personales</CardTitle>
            <CardDescription>Consulta cómo tratamos tus datos personales dentro de la plataforma.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/aviso-de-privacidad"
              className="text-sm font-semibold text-brand-secondary hover:text-brand-primary hover:underline"
            >
              Ver aviso de privacidad →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Seguridad</CardTitle>
            <CardDescription>
              Desactiva tu cuenta si necesitas dejar de usar la plataforma temporalmente. Un administrador deberá
              reactivarla para que puedas volver a iniciar sesión.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DeactivateAccountSection />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
