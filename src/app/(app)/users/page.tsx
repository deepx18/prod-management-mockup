"use client";

import { PageSkeleton } from "@/components/PageSkeleton";
import { RequireRole } from "@/components/RequireRole";
import { ErrorState } from "@/components/ErrorState";
import { useData } from "@/hooks/useData";
import { useAuth } from "@/hooks/useAuth";
import * as api from "@/services";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrateur",
  supervisor: "Superviseur",
  agent: "Conseiller",
};

const ROLE_BADGE: Record<string, string> = {
  admin: "bg-primary-container text-[#dce4f5]",
  supervisor: "bg-secondary-container text-on-secondary-container",
  agent: "bg-surface-container text-on-surface",
};

export default function UsersPage() {
  return (
    <RequireRole roles={["admin"]}>
      <UsersContent />
    </RequireRole>
  );
}

function UsersContent() {
  const { session } = useAuth();
  const { data, loading, error, retry } = useData(() => api.listUsers(), []);

  if (loading) return <PageSkeleton rows={5} />;
  if (error || !data) return <ErrorState message={error ?? "Données indisponibles."} onRetry={retry} />;

  return (
    <div className="space-y-lg">
      <div>
        <span className="text-label-table-header uppercase tracking-wider text-on-surface-variant">Administration</span>
        <h1 className="text-headline-lg tracking-tight text-on-surface">Utilisateurs &amp; Rôles</h1>
        <p className="text-body-compact text-on-surface-variant">
          {data.length} comptes — consultation seule (la gestion sera activée avec le backend).
        </p>
      </div>

      <section className="overflow-hidden rounded-xl bg-surface-lowest shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-outline-variant text-label-table-header uppercase tracking-wider text-on-surface-variant">
              <th className="py-2.5 pl-lg pr-3">Nom</th>
              <th className="px-3 py-2.5">Email</th>
              <th className="px-3 py-2.5">Rôle</th>
              <th className="py-2.5 pl-3 pr-lg">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/40 text-body-compact">
            {data.map((u) => (
              <tr key={u.id} className="hover:bg-surface-low transition-colors">
                <td className="py-2.5 pl-lg pr-3 font-medium text-on-surface">
                  {u.name}
                  {session?.user.id === u.id ? (
                    <span className="ml-2 rounded bg-surface-container px-1.5 py-0.5 text-label-badge text-on-surface-variant">
                      vous
                    </span>
                  ) : null}
                </td>
                <td className="px-3 py-2.5 font-mono text-on-surface-variant">{u.email}</td>
                <td className="px-3 py-2.5">
                  <span className={`inline-flex rounded px-2 py-0.5 text-label-badge font-medium ${ROLE_BADGE[u.role]}`}>
                    {ROLE_LABELS[u.role]}
                  </span>
                </td>
                <td className="py-2.5 pl-3 pr-lg">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-label-badge font-medium ${
                      u.active ? "bg-success-container text-on-success-container" : "bg-surface-container text-on-surface-variant"
                    }`}
                  >
                    {u.active ? "Actif" : "Suspendu"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <p className="text-label-badge text-on-surface-variant">
        Note : la création, l&apos;édition et la suspension des comptes seront implémentées côté backend
        (POST/PUT /api/users). La vue reste volontairement en lecture seule d&apos;ici là.
      </p>
    </div>
  );
}
