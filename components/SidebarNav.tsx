"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icon, type IconName } from "@/components/Icon";

type SidebarNavProps = {
  role: "student" | "coach" | "admin";
};

type NavItem = {
  label: string;
  href: string;
  icon: IconName;
};

export function SidebarNav({ role }: SidebarNavProps) {
  const pathname = usePathname();

  const items: NavItem[] =
    role === "admin"
      ? [
          { label: "Panel", href: "/dashboard/admin", icon: "admin_panel" },
          { label: "Usuarios", href: "/dashboard/admin/usuarios", icon: "person" },
          { label: "Convocatorias", href: "/dashboard/admin/eventos", icon: "calendar" },
          { label: "Reportes", href: "/dashboard/admin/reportes", icon: "error" },
          { label: "Fichas", href: "/dashboard/admin/fichas", icon: "id_card" },
          { label: "Historial", href: "/dashboard/admin/historial", icon: "hourglass" },
          { label: "Configuración", href: "/dashboard/settings", icon: "settings" },
        ]
      : [
          { label: "Inicio", href: "/dashboard", icon: "home" },
          { label: "Eventos", href: "/dashboard/events", icon: "calendar" },
          { label: "Favoritos", href: "/dashboard/favorites", icon: "star" },
          { label: "Fichas", href: "/dashboard/fichas", icon: "id_card" },
          { label: "Avisos", href: "/dashboard/notifications", icon: "notifications" },
          { label: "Perfil", href: "/dashboard/profile", icon: "person" },
          {
            label: role === "student" ? "Postulaciones" : "Verificaciones",
            href: "/dashboard/applications",
            icon: "person_check",
          },
          { label: "Configuración", href: "/dashboard/settings", icon: "settings" },
        ];

  // Resolve the single best-matching item for the current pathname: an item
  // matches if the pathname equals its href or is nested under it, and among
  // matches the one with the longest (most specific) href wins. This avoids
  // a shorter parent href (e.g. "/dashboard") staying active for every
  // deeper route (e.g. "/dashboard/events") that starts with it.
  const activeItem = items.reduce<NavItem | null>((best, candidate) => {
    const isMatch = pathname === candidate.href || pathname.startsWith(`${candidate.href}/`);
    if (!isMatch) return best;
    if (!best || candidate.href.length > best.href.length) return candidate;
    return best;
  }, null);

  return (
    <nav aria-label="Navegación principal" className="flex flex-row gap-1 lg:flex-col lg:gap-1">
      {items.map((item) => {
        const active = item === activeItem;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={[
              "group flex flex-1 items-center justify-center rounded-lg text-center transition-colors lg:flex-none",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interaction",
            ].join(" ")}
          >
            {/* selection-box: fixed footprint for every item — only this element receives the active background */}
            <span
              className={[
                "flex h-19 w-19 flex-col items-center justify-center gap-1 rounded-xl px-1 transition-colors",
                active
                  ? "bg-interaction/15 text-interaction"
                  : "text-brand-primary/50 group-hover:bg-brand-background group-hover:text-brand-primary",
              ].join(" ")}
            >
              <Icon
                name={item.icon}
                size={20}
                className={active ? "shrink-0 text-interaction" : "shrink-0 text-brand-primary/50 group-hover:text-brand-primary"}
              />
              <span
                className={[
                  "block max-w-full truncate whitespace-nowrap text-[10px] leading-tight tracking-tight",
                  active ? "font-semibold" : "font-medium",
                ].join(" ")}
              >
                {item.label}
              </span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
