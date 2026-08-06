"use client";

import { useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Icon } from "@/components/Icon";
import { Select } from "@/components/Select";

type TopbarProps = {
  userName: string;
};

const EVENTS_SPORT_OPTIONS = [
  { label: "Todos los deportes", value: "all" },
  { label: "Básquetbol", value: "basketball" },
  { label: "Fútbol", value: "soccer" },
  { label: "Flag Football", value: "flag_football" },
  { label: "Voleibol", value: "volleyball" },
];

const EVENTS_TYPE_OPTIONS = [
  { label: "Todos", value: "all" },
  { label: "Torneo", value: "tournament" },
  { label: "Reclutamiento", value: "recruitment" },
  { label: "Entrenamiento", value: "training" },
];

const FICHAS_SPORT_OPTIONS = [
  { label: "Todos los deportes", value: "all" },
  { label: "Básquetbol", value: "basketball" },
  { label: "Fútbol", value: "soccer" },
  { label: "Flag Football", value: "flag_football" },
  { label: "Voleibol", value: "volleyball" },
];

// Pages where the search input actually filters data. Everywhere else it
// stays the existing decorative, unconnected input.
const SEARCH_PLACEHOLDERS: Record<string, string> = {
  "/dashboard": "Buscar por título, ubicación o entrenador",
  "/dashboard/events": "Buscar por título, ubicación o entrenador",
  "/dashboard/applications": "Buscar por evento o nombre",
  "/dashboard/fichas": "Buscar por deporte o posición",
  "/dashboard/favorites": "Buscar en tus favoritos",
  "/dashboard/admin": "Buscar por entrenador o correo",
  "/dashboard/admin/usuarios": "Buscar por nombre o correo",
  "/dashboard/admin/fichas": "Buscar por nombre, correo o evento",
};

export function Topbar({ userName }: TopbarProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
  }

  // Close dropdown when clicking outside
  function handleBlur(e: React.FocusEvent<HTMLDivElement>) {
    if (!menuRef.current?.contains(e.relatedTarget as Node)) {
      setOpen(false);
    }
  }

  const isEvents = pathname === "/dashboard/events";
  const isFichas = pathname === "/dashboard/fichas";
  const hasSportTypeFilters = isEvents || isFichas;
  const isSearchable = pathname in SEARCH_PLACEHOLDERS;
  const currentQ = isSearchable ? (searchParams.get("q") ?? "") : "";
  const showClearButton = currentQ.length > 0;

  function handleClearSearch() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  // When the page also has sport/type <Select> filters, the search input is
  // associated to that same form via the `form` attribute (below) so one
  // submit carries q + sport/type together — it stays physically in its
  // current spot on the left, not nested inside the filters form on the right.
  const searchInput = (
    <>
      <Icon
        name="search"
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-primary/40"
      />
      <Input
        id="dashboard-search"
        name={isSearchable ? "q" : undefined}
        defaultValue={isSearchable ? currentQ : undefined}
        form={isSearchable && hasSportTypeFilters ? "topbar-filters-form" : undefined}
        placeholder={SEARCH_PLACEHOLDERS[pathname] ?? "Eventos, deportes, universidades"}
        className={showClearButton ? "pl-9! pr-9!" : "pl-9!"}
      />
      {showClearButton && (
        <button
          type="button"
          onClick={handleClearSearch}
          aria-label="Limpiar búsqueda"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-primary/40 transition-colors hover:text-brand-primary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interaction rounded-sm"
        >
          <Icon name="close_small" size={16} />
        </button>
      )}
    </>
  );

  return (
    <header className="flex flex-col gap-3 border-b border-brand-border/60 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      {isSearchable && !hasSportTypeFilters ? (
        <form key={pathname} method="GET" action={pathname} className="relative w-full sm:max-w-sm">
          {searchInput}
        </form>
      ) : (
        <div className="relative w-full sm:max-w-sm">
          {searchInput}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
        {hasSportTypeFilters && (
          // key resets the uncontrolled Selects' defaultValue when navigating
          // between filterable pages, since the Topbar itself never unmounts.
          <form
            id="topbar-filters-form"
            key={pathname}
            method="GET"
            action={pathname}
            className="flex flex-wrap items-center gap-3 sm:flex-nowrap"
          >
            <div className="w-full sm:w-48">
              <Select
                id="topbar-filter-sport"
                name="sport"
                defaultValue={searchParams.get("sport") ?? "all"}
                options={isEvents ? EVENTS_SPORT_OPTIONS : FICHAS_SPORT_OPTIONS}
              />
            </div>
            {isEvents && (
              <div className="w-full sm:w-40">
                <Select
                  id="topbar-filter-type"
                  name="type"
                  defaultValue={searchParams.get("type") ?? "all"}
                  options={EVENTS_TYPE_OPTIONS}
                />
              </div>
            )}
            <Button
              type="submit"
              variant="secondary"
              className="w-full bg-interaction/15! text-interaction! ring-interaction/30! hover:bg-interaction/25! py-1.5! sm:w-auto"
            >
              Filtrar
            </Button>
          </form>
        )}

        <div className="relative flex items-center gap-4 self-end sm:self-auto" ref={menuRef} onBlur={handleBlur}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-brand-background focus:outline-none focus-visible:ring-2 focus-visible:ring-interaction"
            aria-haspopup="menu"
            aria-expanded={open}
          >
            <div
              aria-hidden="true"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary text-sm font-bold text-white"
            >
              {userName.slice(0, 2).toUpperCase()}
            </div>
            <p className="text-sm font-medium text-brand-primary">{userName}</p>
            <Icon
              name="arrow"
              size={16}
              className={`text-brand-primary/50 transition-transform ${open ? "-rotate-90" : "rotate-90"}`}
            />
          </button>

          {open && (
            <div
              role="menu"
              className="absolute right-0 top-full z-50 mt-2 min-w-40 rounded-xl border border-brand-border/60 bg-white py-2 shadow-lg"
            >
              <button
                role="menuitem"
                type="button"
                tabIndex={0}
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
              >
                <Icon name="logout" size={16} />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
