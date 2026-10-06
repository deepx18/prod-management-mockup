"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import type { Role } from "@/types";

/**
 * Garde de rôle côté client : les entrées de navigation sont déjà filtrées
 * par rôle dans la sidebar, mais cette garde protège aussi l'accès direct
 * par URL aux pages réservées.
 */
export function RequireRole({
  roles,
  children,
}: {
  roles: Role[];
  children: React.ReactNode;
}) {
  const { session, loading } = useAuth();

  if (loading || !session) return null;

  if (!roles.includes(session.user.role)) {
    return (
      <div className="flex flex-col items-center justify-center py-xl text-center">
        <p className="text-headline-sm text-on-surface">Accès non autorisé</p>
        <p className="mt-1 max-w-sm text-body-compact text-on-surface-variant">
          Votre rôle ne permet pas d&apos;accéder à cette page.
        </p>
        <Link
          href={session.user.role === "agent" ? "/my-space" : "/dashboard"}
          className="mt-md rounded bg-primary px-lg py-1.5 text-body-compact font-medium text-on-primary hover:bg-primary-container transition-colors"
        >
          Retour à votre espace
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
