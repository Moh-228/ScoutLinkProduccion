"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/Input";

type TopbarProps = {
  userName: string;
};

export function Topbar({ userName }: TopbarProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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

  return (
    <header className="flex flex-col gap-3 border-b border-white/10 bg-[#09090b] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="w-full sm:max-w-sm">
        <Input id="dashboard-search" label="Buscar" placeholder="Eventos, deportes, universidades" />
      </div>
      <div className="relative flex items-center gap-3 self-end sm:self-auto" ref={menuRef} onBlur={handleBlur}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-3 rounded-md px-2 py-1 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
          aria-haspopup="menu"
          aria-expanded={open}
        >
          <div
            aria-hidden="true"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-700 text-sm font-bold text-white"
          >
            {userName.slice(0, 2).toUpperCase()}
          </div>
          <p className="text-sm font-medium text-white">{userName}</p>
          <svg
            aria-hidden="true"
            className={`h-4 w-4 text-white/60 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 top-full z-50 mt-1 min-w-[10rem] rounded-md border border-white/10 bg-[#18181b] py-1 shadow-lg"
          >
            <button
              role="menuitem"
              type="button"
              tabIndex={0}
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-white/5"
            >
              <svg
                aria-hidden="true"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
              </svg>
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
