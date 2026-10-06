"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Barre supérieure : recherche globale fonctionnelle (redirige vers la page
 * Production pré-remplie avec la requête). Volontairement minimaliste.
 */
export function Topbar() {
  const router = useRouter();
  const [q, setQ] = useState("");

  return (
    <header className="fixed inset-x-0 top-0 z-40 h-16 border-b border-outline-variant/40 bg-surface-lowest/90 backdrop-blur-xl lg:left-64">
      <div className="flex h-full items-center justify-between px-xl">
        <form
          className="relative w-full max-w-xl"
          onSubmit={(e) => {
            e.preventDefault();
            if (q.trim()) router.push(`/production?q=${encodeURIComponent(q.trim())}`);
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un contrat, un client…"
            aria-label="Recherche globale"
            className="w-full rounded bg-surface-low py-1.5 pl-9 pr-md text-body-compact text-on-surface placeholder:text-outline focus:bg-surface-container focus:outline-none transition-colors"
          />
        </form>
      </div>
    </header>
  );
}
