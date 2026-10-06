"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@/types";

interface NavItem {
  label: string;
  href: string;
  icon: string;
  roles: Role[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Tableau de Bord", href: "/dashboard", icon: "M3 12l9-9 9 9M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10", roles: ["admin", "supervisor", "agent"] },
  { label: "Production", href: "/production", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", roles: ["admin", "supervisor", "agent"] },
  { label: "Conseillers / Agents", href: "/agents", icon: "M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6-4a3 3 0 11-3-3", roles: ["admin", "supervisor", "agent"] },
  { label: "Commissions & Primes", href: "/commissions", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 12v-2m9-4a9 9 0 11-18 0 9 9 0 0118 0z", roles: ["admin", "supervisor"] },
  { label: "Résiliations", href: "/cancellations", icon: "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6", roles: ["admin", "supervisor"] },
  { label: "Mon Espace Agent", href: "/my-space", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", roles: ["agent"] },
  { label: "Utilisateurs & Rôles", href: "/users", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z", roles: ["admin"] },
];

function NavIcon({ path }: { path: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 shrink-0"
      aria-hidden
    >
      <path d={path} />
    </svg>
  );
}

export function Sidebar({ role, name, onLogout }: { role: Role; name: string; onLogout: () => void }) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((i) => i.roles.includes(role));
  const roleLabel = role === "admin" ? "Admin Général" : role === "supervisor" ? "Superviseur" : "Conseiller";

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col bg-surface-low shadow-[0_1px_8px_rgba(0,0,0,0.04)] lg:flex">
      <div className="flex h-16 items-center gap-sm px-lg bg-surface-container">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-on-primary">
          <span className="text-[15px] font-bold">A</span>
        </div>
        <div className="flex min-w-0 flex-col leading-none">
          <span className="text-headline-sm text-on-surface truncate">AssurCore</span>
          <span className="text-label-table-header uppercase tracking-wider text-on-surface-variant">
            Enterprise Core
          </span>
        </div>
      </div>

      <div className="px-md py-sm">
        <span className="px-sm text-label-table-header uppercase tracking-wider text-on-surface-variant">
          Opérations &amp; Pilotage
        </span>
      </div>

      <nav className="flex-1 space-y-xs overflow-y-auto px-sm">
        {items.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-md px-md py-sm rounded-lg transition-colors ${
                active
                  ? "bg-primary-container text-[#dce4f5]"
                  : "text-on-surface-variant hover:bg-surface-high hover:text-on-surface"
              }`}
            >
              <NavIcon path={item.icon} />
              <span className="text-body-medium truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="space-y-xs bg-surface-container p-md">
        <div className="flex items-center justify-between">
          <span className="font-mono text-code-financial text-on-surface-variant">Prod v2.4</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-container px-sm py-0.5 text-label-badge text-on-secondary-container">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Actif
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-body-compact font-medium text-on-surface">{name}</span>
            <span className="text-label-badge text-on-surface-variant">{roleLabel}</span>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="shrink-0 rounded px-sm py-xs text-body-compact text-error hover:bg-error-container transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </aside>
  );
}
