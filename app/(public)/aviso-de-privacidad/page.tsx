import Link from "next/link";

import { Icon } from "@/components/Icon";

export const metadata = {
  title: "Aviso de privacidad — Scoutlink",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-semibold text-brand-primary">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-brand-primary/80">{children}</div>
    </section>
  );
}

export default function PrivacyNoticePage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-brand-primary/70 transition-colors hover:text-brand-primary"
      >
        <Icon name="arrow" size={16} />
        Volver al inicio
      </Link>

      <header className="mt-6 mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-brand-primary">Aviso de privacidad</h1>
        <p className="mt-2 text-brand-primary/70">
          Última actualización: octubre de 2026. Este aviso describe cómo Scoutlink recaba, usa y protege
          tus datos personales, de conformidad con la Ley Federal de Protección de Datos Personales en
          Posesión de los Particulares.
        </p>
      </header>

      <div className="space-y-8">
        <Section title="1. Responsable del tratamiento">
          <p>
            Scoutlink (en lo sucesivo, &ldquo;la plataforma&rdquo;) es responsable del tratamiento de los
            datos personales que nos proporcionas como estudiante, entrenador o administrador, utilizados
            exclusivamente para los fines descritos en este aviso.
          </p>
        </Section>

        <Section title="2. Datos personales recabados">
          <p>Dependiendo de tu rol, podemos recabar los siguientes datos:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Datos de identificación y contacto: nombre completo, correo institucional, teléfono, escuela y semestre.</li>
            <li>Datos deportivos: fichas generales y especializadas, estatura, peso, nivel de experiencia y habilidades.</li>
            <li>
              Datos sensibles de salud (opcionales): lesiones previas, cirugías, patologías, enfermedades
              crónicas y padecimientos cardíacos, proporcionados voluntariamente para apoyar la seguridad
              del deportista. Estos datos no se utilizan para calcular afinidad ni para ninguna decisión
              automatizada.
            </li>
            <li>Documentos: comprobante de inscripción, seguro médico y documentos de acreditación de entrenadores.</li>
            <li>Datos de uso: postulaciones, comentarios, calificaciones internas de entrenadores y notificaciones.</li>
          </ul>
        </Section>

        <Section title="3. Finalidades del tratamiento">
          <p>Tus datos se utilizan para:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Crear y administrar tu cuenta y perfil dentro de la plataforma.</li>
            <li>Conectar a deportistas con eventos y procesos de reclutamiento publicados por entrenadores.</li>
            <li>Calcular el porcentaje de afinidad entre un perfil deportivo y los requisitos de un evento.</li>
            <li>Permitir que entrenadores den seguimiento, retroalimentación y gestión interna a sus postulantes.</li>
            <li>Enviar notificaciones relacionadas con tus postulaciones, eventos y verificaciones.</li>
            <li>Cumplir obligaciones legales y de seguridad de la institución educativa.</li>
          </ul>
        </Section>

        <Section title="4. Datos sensibles y consentimiento">
          <p>
            Los campos de salud (patologías, enfermedades crónicas y padecimientos cardíacos) se consideran
            datos sensibles. Son completamente opcionales, solo los capturas si así lo decides, y únicamente
            son visibles para entrenadores y administradores con el fin de prevenir riesgos durante la
            práctica deportiva. Al registrarlos, otorgas tu consentimiento expreso para este tratamiento.
          </p>
        </Section>

        <Section title="5. Transferencia de datos">
          <p>
            No compartimos tus datos personales con terceros ajenos a la plataforma, salvo requerimiento de
            autoridad competente o con tu consentimiento expreso.
          </p>
        </Section>

        <Section title="6. Derechos ARCO">
          <p>
            Puedes acceder, rectificar, cancelar u oponerte (derechos ARCO) al tratamiento de tus datos
            personales, así como revocar tu consentimiento, desde la sección de Configuración de tu cuenta o
            poniéndote en contacto con el administrador de la plataforma.
          </p>
        </Section>

        <Section title="7. Seguridad">
          <p>
            Implementamos medidas administrativas y técnicas razonables para proteger tus datos contra daño,
            pérdida, alteración, acceso o tratamiento no autorizado.
          </p>
        </Section>

        <Section title="8. Cambios al aviso de privacidad">
          <p>
            Este aviso puede actualizarse para reflejar cambios en la plataforma o en la normativa aplicable.
            Publicaremos cualquier modificación en esta misma página.
          </p>
        </Section>
      </div>
    </main>
  );
}
