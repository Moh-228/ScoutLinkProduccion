export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  postulado: "Postulado",
  preseleccionado: "Preseleccionado",
  aceptado: "Invitado",
  rechazado: "Descartado",
};

export const EVENT_TYPE_LABELS: Record<string, string> = {
  training: "Entrenamiento",
  tournament: "Torneo",
  recruitment: "Reclutamiento",
};

export const EVENT_SPORT_LABELS: Record<string, string> = {
  basketball: "Básquetbol",
  soccer: "Fútbol",
  flag_football: "Flag Football",
  volleyball: "Voleibol",
};

function csvEscape(value: string) {
  // A leading = + - @ would be run as a formula by Excel.
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

/** CSV download response (UTF-8 with BOM so Excel shows accents correctly). */
export function csvResponse(header: string[], rows: (string | number | null | undefined)[][], filename: string) {
  const body = [header, ...rows].map((row) => row.map((v) => csvEscape(String(v ?? ""))).join(",")).join("\r\n");
  return new Response(`﻿${body}`, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

export function slug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

export function isoDate(d: Date | null | undefined) {
  return d ? d.toISOString() : "";
}
