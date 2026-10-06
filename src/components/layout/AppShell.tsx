"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { PageSkeleton } from "@/components/PageSkeleton";

/**
 * Shell unique pour tous les rôles : la sidebar filtre les entrées selon le
 * rôle (voir Sidebar.tsx). Guard de session côté client.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { session, loading, logout } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <PageSkeleton rows={3} />
      </div>
    );
  }

  if (!session) {
    if (typeof window !== "undefined") router.replace("/login");
    return null;
  }

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar role={session.user.role} name={session.user.name} onLogout={handleLogout} />

      {/* Barre mobile */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-outline-variant/40 bg-surface-lowest px-md lg:hidden">
        <span className="text-headline-sm text-on-surface">AssurCore</span>
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="rounded px-md py-1 text-body-compact text-on-surface-variant hover:bg-surface-low transition-colors"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? "Fermer" : "Menu"}
        </button>
      </div>
      {mobileOpen ? (
        <div className="border-b border-outline-variant/40 bg-surface-lowest px-md py-sm lg:hidden">
          <button
            type="button"
            onClick={handleLogout}
            className="rounded px-sm py-xs text-body-compact text-error hover:bg-error-container transition-colors"
          >
            Déconnexion
          </button>
        </div>
      ) : null}

      <div className="hidden lg:block">
        <Topbar />
      </div>

      <div className="lg:pl-64 lg:pt-16">
        <main className="px-md py-lg lg:px-xl lg:py-xl">{children}</main>
      </div>
    </div>
  );
}
