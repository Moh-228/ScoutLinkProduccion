"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type SidebarNavProps = {
  role: "student" | "coach" | "admin";
};

type NavItem = {
  label: string;
  href: string;
};

export function SidebarNav({ role }: SidebarNavProps) {
  const pathname = usePathname();

  const items: NavItem[] =
    role === "admin"
      ? [
          { label: "Panel Admin", href: "/dashboard/admin" },
          { label: "Usuarios", href: "/dashboard/admin/usuarios" },
          { label: "Fichas", href: "/dashboard/admin/fichas" },
        ]
      : [
          { label: "Inicio", href: "/dashboard" },
          { label: "Eventos", href: "/dashboard/events" },
          { label: "Favoritos", href: "/dashboard/favorites" },
          { label: "Fichas", href: "/dashboard/fichas" },
          { label: "Notificaciones", href: "/dashboard/notifications" },
          { label: "Mi perfil", href: "/dashboard/profile" },
          {
            label: role === "student" ? "Mis postulaciones" : "Verificaciones",
            href: "/dashboard/applications",
          },
        ];

  return (
    <nav aria-label="Navegación principal" className="space-y-1">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={[
              "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-[#1883FF] text-white" : "text-white hover:bg-white/10",
            ].join(" ")}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
