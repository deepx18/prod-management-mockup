"use client";

import Link from "next/link";
import { StatCard } from "@/components/StatCard";
import { PageSkeleton } from "@/components/PageSkeleton";
import { ErrorState } from "@/components/ErrorState";
import { useData } from "@/hooks/useData";
import { useAuth } from "@/hooks/useAuth";
import * as api from "@/services";
import { formatMoney, formatDate } from "@/lib/format";
import type { AgentSummary, Contract } from "@/types";

const PRODUCT_COLORS = ["bg-primary", "bg-secondary", "bg-inverse-surface", "bg-outline", "bg-outline-variant"];

export default function DashboardPage() {
  const { session } = useAuth();
  const { data, loading, error, retry } = useData(() => api.getDashboardStats(), []);

  if (loading) return <PageSkeleton rows={8} />;
  if (error || !data) return <ErrorState message={error ?? "Données indisponibles."} onRetry={retry} />;

  const maxMonthly = Math.max(...data.productionByMonth.map((m) => m.production), 1);

  return (
    <div className="space-y-lg">
      <div>
        <span className="text-label-table-header uppercase tracking-wider text-on-surface-variant">
          Pilotage {session?.user.role === "agent" ? "Agent" : "Exécutif"}
        </span>
        <h1 className="text-headline-lg tracking-tight text-on-surface">Tableau de Bord</h1>
        <p className="text-body-compact text-on-surface-variant">
          Vue consolidée de la production, des primes et des commissions.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-md sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Production Nette"
          value={formatMoney(data.productionTotal)}
          hint={`${data.contractsActive} contrats actifs`}
        />
        <StatCard label="Cotisations Émises" value={formatMoney(data.premiumsTotal)} hint="Cumul 12 mois" />
        <StatCard
          label="Contrats Souscrits"
          value={String(data.contractsTotal)}
          hint={`${data.contractsActive} actifs · ${data.contractsCancelled} résiliés`}
        />
        <StatCard
          label="Résiliations"
          value={String(data.contractsCancelled)}
          tone="error"
          hint="Sur les 12 derniers mois"
        />
        <StatCard label="Commissions Calculées" value={formatMoney(data.commissionsTotal)} hint="Commissions des 12 derniers mois" />
      </div>

      <div className="grid grid-cols-1 gap-lg xl:grid-cols-12">
        {/* Évolution mensuelle */}
        <section className="flex flex-col gap-md rounded-xl bg-surface-lowest p-lg shadow-sm xl:col-span-8">
          <div>
            <h2 className="text-headline-sm text-on-surface">Évolution de la Production (12 mois)</h2>
            <p className="text-body-compact text-on-surface-variant">
              Nombre de contrats souscrits par mois.
            </p>
          </div>
          <div className="flex items-end gap-2" role="img" aria-label="Production mensuelle des 12 derniers mois">
            {data.productionByMonth.map((m) => (
              <div key={m.month + m.premiums} className="flex flex-1 flex-col items-center gap-1">
                {/* Zone de barres à hauteur définie : les % fonctionnent */}
                <div className="flex h-44 w-full items-end justify-center">
                  <div
                    className="w-5 rounded-t bg-primary transition-all"
                    style={{ height: `${Math.max((m.production / maxMonthly) * 100, 3)}%` }}
                    title={`${m.production} contrat(s) · ${formatMoney(m.premiums)}`}
                  />
                </div>
                <span className="text-[10px] text-on-surface-variant">{m.month}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-md border-t border-outline-variant/40 pt-sm text-label-badge text-on-surface-variant">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded bg-primary" /> Contrats souscrits par mois
            </span>
            <Link href="/production" className="ml-auto font-medium text-primary hover:underline">
              Explorer la production →
            </Link>
          </div>
        </section>

        {/* Répartition par branche */}
        <section className="flex flex-col gap-md rounded-xl bg-surface-lowest p-lg shadow-sm xl:col-span-4">
          <div>
            <h2 className="text-headline-sm text-on-surface">Répartition par Branche</h2>
            <p className="text-body-compact text-on-surface-variant">Poids des cotisations (contrats actifs).</p>
          </div>
          <div className="space-y-md">
            {data.productionByProduct.map((p, i) => (
              <div key={p.product} className="space-y-1">
                <div className="flex items-center justify-between text-body-compact">
                  <span className="flex items-center gap-1.5 font-medium text-on-surface">
                    <span className={`h-2.5 w-2.5 rounded-full ${PRODUCT_COLORS[i % PRODUCT_COLORS.length]}`} />
                    {p.product}
                  </span>
                  <span className="font-mono font-bold tabular">{p.share}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-low">
                  <div className={`h-full rounded-full ${PRODUCT_COLORS[i % PRODUCT_COLORS.length]}`} style={{ width: `${p.share}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Palmarès agents */}
      <section className="rounded-xl bg-surface-lowest p-lg shadow-sm">
        <div className="mb-md flex flex-wrap items-center justify-between gap-sm">
          <div>
            <h2 className="text-headline-sm text-on-surface">Palmarès des Conseillers</h2>
            <p className="text-body-compact text-on-surface-variant">
              Top 5 contributeurs par production nette.
            </p>
          </div>
          <Link
            href="/agents"
            className="rounded-lg bg-surface-low px-md py-1.5 text-body-compact text-on-surface hover:bg-surface-container transition-colors"
          >
            Classement complet →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-outline-variant text-label-table-header uppercase tracking-wider text-on-surface-variant">
                <th className="py-2 pl-md pr-3">Conseiller</th>
                <th className="hidden px-3 py-2 md:table-cell">Région</th>
                <th className="px-3 py-2 text-right">Contrats</th>
                <th className="px-3 py-2 text-right">Production</th>
                <th className="px-3 py-2 text-right">Commissions</th>
                <th className="py-2 pl-3 pr-md text-right">Fiche</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40 text-body-compact">
              {data.topAgents.map((a: AgentSummary, i: number) => (
                <tr key={a.id} className="hover:bg-surface-low transition-colors">
                  <td className="py-2.5 pl-md pr-3 font-medium text-on-surface">
                    <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-container text-label-badge font-bold text-[#dce4f5]">
                      {i + 1}
                    </span>
                    {a.name}
                  </td>
                  <td className="hidden px-3 py-2.5 text-on-surface-variant md:table-cell">{a.region}</td>
                  <td className="px-3 py-2.5 text-right font-mono tabular">{a.contracts}</td>
                  <td className="px-3 py-2.5 text-right font-mono font-semibold tabular">{formatMoney(a.production)}</td>
                  <td className="px-3 py-2.5 text-right font-mono tabular">{formatMoney(a.commissions)}</td>
                  <td className="py-2.5 pl-3 pr-md text-right">
                    <Link
                      href={`/agents/${a.id}`}
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
      </section>

      <div className="grid grid-cols-1 gap-lg xl:grid-cols-12">
        {/* Dernières souscriptions */}
        <section className="rounded-xl bg-surface-lowest p-lg shadow-sm xl:col-span-7">
          <div className="mb-md flex items-center justify-between">
            <div>
              <h2 className="text-headline-sm text-on-surface">Dernières Souscriptions</h2>
              <p className="text-body-compact text-on-surface-variant">Polices les plus récemment enregistrées.</p>
            </div>
            <Link href="/production" className="text-body-compact font-medium text-primary hover:underline">
              Voir production →
            </Link>
          </div>
          <ul className="divide-y divide-outline-variant/40">
            {data.recentContracts.map((c: Contract) => (
              <li key={c.id}>
                <Link
                  href={`/production/${c.id}`}
                  className="flex items-center justify-between gap-md py-2.5 hover:bg-surface-low transition-colors"
                >
                  <div className="min-w-0">
                    <span className="block font-mono text-body-compact font-semibold text-on-surface">{c.reference}</span>
                    <span className="block truncate text-body-compact text-on-surface">{c.client}</span>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="block font-mono text-body-compact font-semibold tabular">{formatMoney(c.premium)}</span>
                    <span className="block text-label-badge text-on-surface-variant">{formatDate(c.createdAt)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Alertes résiliations */}
        <section className="rounded-xl bg-surface-lowest p-lg shadow-sm xl:col-span-5">
          <div className="mb-md flex items-center justify-between">
            <div>
              <h2 className="text-headline-sm text-on-surface">Résiliations Récentes</h2>
              <p className="text-body-compact text-on-surface-variant">Dossiers avec reprise de commissions.</p>
            </div>
            <Link href="/cancellations" className="text-body-compact font-medium text-error hover:underline">
              Toutes les résiliations →
            </Link>
          </div>
          <ul className="space-y-sm">
            {data.recentCancellations.map((c) => (
              <li key={c.contractId} className="rounded-lg bg-surface-low p-sm">
                <div className="flex items-center justify-between">
                  <Link href={`/production/${c.contractId}`} className="font-mono text-body-compact font-bold text-on-surface hover:underline">
                    {c.contractRef}
                  </Link>
                  <span className="rounded bg-error-container px-2 py-0.5 text-label-badge font-semibold text-on-error-container tabular">
                    −{formatMoney(c.clawback)}
                  </span>
                </div>
                <div className="text-body-compact font-medium text-on-surface">{c.client}</div>
                <div className="text-label-badge text-on-surface-variant">
                  Motif : <strong>{c.reason}</strong> · {c.agentName}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
