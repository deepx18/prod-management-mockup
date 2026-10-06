"use client";

import { useMemo } from "react";
import Link from "next/link";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { PageSkeleton } from "@/components/PageSkeleton";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { useData } from "@/hooks/useData";
import { useAuth } from "@/hooks/useAuth";
import * as api from "@/services";
import { formatMoney, formatDateTime } from "@/lib/format";
import type { AgentDetail } from "@/types";

/**
 * Espace personnel de l'agent : ses contrats, sa production, ses commissions.
 * La fiche agent est associée à l'utilisateur par nom complet (données démo).
 */
export default function MySpacePage() {
  const { session } = useAuth();
  const agentsResult = useData(() => api.listAgents(), []);

  // Association utilisateur ↔ fiche agent (démo) : même nom complet.
  const agentId = useMemo(() => {
    if (!session || !agentsResult.data) return null;
    return (
      agentsResult.data.find((a) => a.name === session.user.name)?.id ??
      null
    );
  }, [session, agentsResult.data]);

  const detail = useData(
    () => (agentId ? api.getAgentDetail(agentId) : Promise.resolve(null)),
    [agentId],
  );

  if (!session) return null;
  if (agentsResult.loading && !agentsResult.data) return <PageSkeleton rows={6} />;
  if (agentsResult.error) return <ErrorState message={agentsResult.error} onRetry={agentsResult.retry} />;
  if (detail.loading && !detail.data) return <PageSkeleton rows={6} />;
  if (detail.error) return <ErrorState message={detail.error} onRetry={detail.retry} />;

  if (!agentId || !detail.data) {
    return (
      <EmptyState
        title="Aucune fiche agent associée"
        message="Votre compte utilisateur n'est pas relié à une fiche de conseiller. Contactez un administrateur."
      />
    );
  }

  const d = detail.data as AgentDetail;
  const recentActivity: { date: string; label: string; tone: "neutral" | "error" }[] = [];
  for (const c of d.contracts) {
    recentActivity.push({
      date: c.createdAt,
      label: `Souscription ${c.reference} — ${c.client}`,
      tone: "neutral",
    });
  }
  for (const c of d.cancellations) {
    const ref = d.contracts.find((ct) => ct.id === c.contractId)?.reference ?? `#${c.contractId}`;
    recentActivity.push({
      date: c.cancellationDate,
      label: `Résiliation ${ref} — ${c.reason}`,
      tone: "error",
    });
  }
  recentActivity.sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-lg">
      <div>
        <span className="text-label-table-header uppercase tracking-wider text-on-surface-variant">Mon activité</span>
        <h1 className="text-headline-lg tracking-tight text-on-surface">
          Bonjour {session.user.name.split(" ")[0]}
        </h1>
        <p className="text-body-compact text-on-surface-variant">
          {d.agent.region} · {d.agent.productSpecialty}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-md sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Mes contrats" value={String(d.stats.contracts)} />
        <StatCard label="Ma production nette" value={formatMoney(d.stats.production)} />
        <StatCard label="Mes commissions" value={formatMoney(d.stats.commissions)} />
        <StatCard label="Mes résiliations" value={String(d.stats.cancellations)} tone="error" />
      </div>

      <section className="rounded-xl bg-surface-lowest p-lg shadow-sm">
        <div className="mb-md flex items-center justify-between">
          <h2 className="text-headline-sm text-on-surface">Mes contrats</h2>
          <Link href="/production" className="text-body-compact font-medium text-primary hover:underline">
            Voir toute la production →
          </Link>
        </div>
        {d.contracts.length === 0 ? (
          <p className="text-body-compact text-on-surface-variant">Aucun contrat pour le moment.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-outline-variant text-label-table-header uppercase tracking-wider text-on-surface-variant">
                  <th className="py-2 pl-md pr-3">Contrat</th>
                  <th className="px-3 py-2">Client</th>
                  <th className="px-3 py-2 text-right">Prime</th>
                  <th className="hidden px-3 py-2 text-right md:table-cell">Commission</th>
                  <th className="px-3 py-2">Statut</th>
                  <th className="py-2 pl-3 pr-md" />
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40 text-body-compact">
                {d.contracts.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-low transition-colors">
                    <td className="py-2.5 pl-md pr-3 font-mono font-semibold text-on-surface">{c.reference}</td>
                    <td className="px-3 py-2.5 text-on-surface">{c.client}</td>
                    <td className="px-3 py-2.5 text-right font-mono font-semibold tabular">{formatMoney(c.premium)}</td>
                    <td className="hidden px-3 py-2.5 text-right font-mono tabular md:table-cell">{formatMoney(c.commission)}</td>
                    <td className="px-3 py-2.5">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-2.5 pl-3 pr-md text-right">
                      <Link
                        href={`/production/${c.id}`}
                        className="rounded bg-surface-container px-2 py-1 text-label-badge font-medium text-on-surface hover:bg-surface-highest transition-colors"
                      >
                        Détails
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-xl bg-surface-lowest p-lg shadow-sm">
        <h2 className="mb-md text-headline-sm text-on-surface">Activité récente</h2>
        {recentActivity.length === 0 ? (
          <p className="text-body-compact text-on-surface-variant">Aucune activité récente.</p>
        ) : (
          <ul className="divide-y divide-outline-variant/40">
            {recentActivity.slice(0, 6).map((item) => (
              <li key={item.label} className="flex items-center justify-between gap-md py-2.5 text-body-compact">
                <span className={item.tone === "error" ? "text-error" : "text-on-surface"}>{item.label}</span>
                <span className="shrink-0 tabular text-on-surface-variant">{formatDateTime(item.date)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
