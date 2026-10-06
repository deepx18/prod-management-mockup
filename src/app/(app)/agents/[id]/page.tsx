"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { PageSkeleton } from "@/components/PageSkeleton";
import { ErrorState } from "@/components/ErrorState";
import { useData } from "@/hooks/useData";
import * as api from "@/services";
import { formatMoney, formatDate } from "@/lib/format";
import type { AgentDetail } from "@/types";

export default function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const agentId = Number(id);

  const { data, loading, error, retry } = useData(() => api.getAgentDetail(agentId), [agentId]);

  useEffect(() => {
    if (!loading && !error && !data) {
      router.replace("/agents");
    }
  }, [loading, error, data, router]);

  if (loading) return <PageSkeleton rows={6} />;
  if (error) return <ErrorState message={error} onRetry={retry} />;
  if (!data) return null;

  const { agent, stats, contracts, commissions, cancellations } = data as AgentDetail;

  return (
    <div className="space-y-lg">
      <nav className="flex items-center gap-xs text-body-compact text-on-surface-variant" aria-label="Fil d'ariane">
        <Link href="/agents" className="hover:text-on-surface hover:underline">
          Conseillers / Agents
        </Link>
        <span>/</span>
        <span className="font-medium text-on-surface">{agent.name}</span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-md">
        <div>
          <span className="text-label-table-header uppercase tracking-wider text-on-surface-variant">
            {agent.region} · {agent.productSpecialty}
          </span>
          <h1 className="text-headline-lg tracking-tight text-on-surface">{agent.name}</h1>
          <p className="text-body-compact text-on-surface-variant">
            {agent.active ? "Agent actif" : "Agent inactif"} · ID AG-{String(agent.id).padStart(4, "0")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-md sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Contrats" value={String(stats.contracts)} />
        <StatCard label="Production Nette" value={formatMoney(stats.production)} />
        <StatCard label="Commissions" value={formatMoney(stats.commissions)} />
        <StatCard label="Résiliations" value={String(stats.cancellations)} tone="error" />
      </div>

      <section className="rounded-xl bg-surface-lowest p-lg shadow-sm">
        <h2 className="mb-md text-headline-sm text-on-surface">Portefeuille de contrats</h2>
        {contracts.length === 0 ? (
          <p className="text-body-compact text-on-surface-variant">Aucun contrat enregistré pour cet agent.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-outline-variant text-label-table-header uppercase tracking-wider text-on-surface-variant">
                  <th className="py-2 pl-md pr-3">Contrat</th>
                  <th className="px-3 py-2">Client</th>
                  <th className="px-3 py-2">Produit</th>
                  <th className="px-3 py-2 text-right">Prime</th>
                  <th className="hidden px-3 py-2 text-right md:table-cell">Commission</th>
                  <th className="px-3 py-2">Statut</th>
                  <th className="hidden px-3 py-2 md:table-cell">Début</th>
                  <th className="py-2 pl-3 pr-md" />
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40 text-body-compact">
                {contracts.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-low transition-colors">
                    <td className="py-2.5 pl-md pr-3 font-mono font-semibold text-on-surface">{c.reference}</td>
                    <td className="px-3 py-2.5 text-on-surface">{c.client}</td>
                    <td className="px-3 py-2.5 text-on-surface-variant">{c.product}</td>
                    <td className="px-3 py-2.5 text-right font-mono font-semibold tabular">{formatMoney(c.premium)}</td>
                    <td className="hidden px-3 py-2.5 text-right font-mono tabular md:table-cell">{formatMoney(c.commission)}</td>
                    <td className="px-3 py-2.5">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="hidden px-3 py-2.5 tabular md:table-cell">{formatDate(c.startDate)}</td>
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

      <div className="grid grid-cols-1 gap-lg lg:grid-cols-2">
        <section className="rounded-xl bg-surface-lowest p-lg shadow-sm">
          <h2 className="mb-md text-headline-sm text-on-surface">Commissions</h2>
          {commissions.length === 0 ? (
            <p className="text-body-compact text-on-surface-variant">Aucune commission enregistrée.</p>
          ) : (
            <ul className="divide-y divide-outline-variant/40">
              {commissions.map((c) => (
                <li key={c.id} className="flex items-center justify-between py-2 text-body-compact">
                  <div>
                    <span className="font-mono font-semibold text-on-surface">
                      {contracts.find((ct) => ct.id === c.contractId)?.reference ?? `Contrat #${c.contractId}`}
                    </span>
                    <span className="ml-2 text-on-surface-variant">{formatDate(c.date)}</span>
                  </div>
                  <div className="flex items-center gap-sm">
                    <span className="font-mono font-semibold tabular">{formatMoney(c.commission)}</span>
                    <StatusBadge status={c.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl bg-surface-lowest p-lg shadow-sm">
          <h2 className="mb-md text-headline-sm text-on-surface">Résiliations</h2>
          {cancellations.length === 0 ? (
            <p className="text-body-compact text-on-surface-variant">Aucune résiliation enregistrée.</p>
          ) : (
            <ul className="divide-y divide-outline-variant/40">
              {cancellations.map((c) => (
                <li key={c.contractId} className="flex items-center justify-between py-2 text-body-compact">
                  <div>
                    <Link href={`/production/${c.contractId}`} className="font-mono font-semibold text-on-surface hover:underline">
                      {contracts.find((ct) => ct.id === c.contractId)?.reference ?? `Contrat #${c.contractId}`}
                    </Link>
                    <span className="ml-2 text-on-surface-variant">{c.reason}</span>
                  </div>
                  <span className="rounded bg-error-container px-2 py-0.5 text-label-badge font-semibold text-on-error-container tabular">
                    −{formatMoney(c.clawback)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <Link
        href="/agents"
        className="inline-block rounded border border-outline-variant bg-surface-lowest px-lg py-1.5 text-body-compact text-on-surface hover:bg-surface-low transition-colors"
      >
        ← Retour aux agents
      </Link>
    </div>
  );
}
