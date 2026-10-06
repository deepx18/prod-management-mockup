"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { SearchInput } from "@/components/SearchInput";
import { SelectFilter } from "@/components/SelectFilter";
import { Pagination } from "@/components/Pagination";
import { PageSkeleton } from "@/components/PageSkeleton";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { useData } from "@/hooks/useData";
import { useAuth } from "@/hooks/useAuth";
import * as api from "@/services";
import { formatMoney, formatDate } from "@/lib/format";
import type { AgentSummary, Contract } from "@/types";

const STATUS_OPTIONS = [
  { value: "all", label: "Tous les statuts" },
  { value: "active", label: "Actifs" },
  { value: "cancelled", label: "Résiliés" },
];

/**
 * Le composant externe lit ?q= (recherche globale du Topbar) ; la vue
 * filtrable est remontée (key) à chaque changement de q, ce qui applique
 * la recherche URL sans effet ni synchronisation manuelle d'état.
 */
export default function ProductionPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  return <ProductionView key={q} initialQuery={q} />;
}

function ProductionView({ initialQuery }: { initialQuery: string }) {
  useAuth(); // session requise par le shell
  const [search, setSearch] = useState(initialQuery);
  const [status, setStatus] = useState("all");
  const [agent, setAgent] = useState("all");
  const [page, setPage] = useState(1);

  const agentsResult = useData(() => api.listAgentSummaries(), []);
  const contractsResult = useData(
    () =>
      api.listContracts({
        search,
        status: status as "all" | "active" | "cancelled",
        agentId: agent === "all" ? undefined : Number(agent),
        page,
        pageSize: 10,
      }),
    [search, status, agent, page],
  );

  const showSkeleton = contractsResult.loading && !contractsResult.data;
  const { data: contractsData } = contractsResult;
  const total = contractsData?.total ?? 0;

  const agentOptions = useMemo(
    () => [
      { value: "all", label: "Tous les agents" },
      ...(agentsResult.data ?? []).map((a: AgentSummary) => ({ value: String(a.id), label: a.name })),
    ],
    [agentsResult.data],
  );

  function handleFilterChange(setter: (v: string) => void) {
    return (v: string) => {
      setter(v);
      setPage(1);
    };
  }

  const isFiltered = search !== "" || status !== "all" || agent !== "all";

  return (
    <div className="space-y-lg">
      <div>
        <span className="text-label-table-header uppercase tracking-wider text-on-surface-variant">
          Souscription &amp; Portefeuille
        </span>
        <h1 className="text-headline-lg tracking-tight text-on-surface">Production</h1>
        <p className="text-body-compact text-on-surface-variant">
          {new Intl.NumberFormat("fr-FR").format(total)} contrat{total > 1 ? "s" : ""} au portefeuille.
        </p>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-md rounded-xl bg-surface-lowest p-md shadow-sm">
        <SearchInput value={search} onChange={handleFilterChange(setSearch)} placeholder="N° contrat, client, agent…" />
        <SelectFilter value={status} onChange={handleFilterChange(setStatus)} options={STATUS_OPTIONS} ariaLabel="Filtrer par statut" />
        <SelectFilter value={agent} onChange={handleFilterChange(setAgent)} options={agentOptions} ariaLabel="Filtrer par agent" />
        {isFiltered ? (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatus("all");
              setAgent("all");
              setPage(1);
            }}
            className="text-body-compact text-secondary hover:text-on-surface hover:underline"
          >
            Réinitialiser
          </button>
        ) : null}
      </div>

      {showSkeleton ? (
        <PageSkeleton rows={6} />
      ) : contractsResult.error ? (
        <ErrorState message={contractsResult.error} onRetry={contractsResult.retry} />
      ) : contractsData && contractsData.data.length === 0 ? (
        <div className="rounded-xl bg-surface-lowest shadow-sm">
          <EmptyState
            title="Aucun contrat trouvé"
            message="Aucun contrat ne correspond aux critères de recherche. Modifiez les filtres ou réinitialisez-les."
            action={{ label: "Réinitialiser les filtres", href: "/production" }}
          />
        </div>
      ) : contractsData ? (
        <section className="rounded-xl bg-surface-lowest shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-outline-variant text-label-table-header uppercase tracking-wider text-on-surface-variant">
                  <th className="py-2.5 pl-lg pr-3">Contrat</th>
                  <th className="px-3 py-2.5">Client</th>
                  <th className="px-3 py-2.5">Agent</th>
                  <th className="px-3 py-2.5">Produit</th>
                  <th className="px-3 py-2.5 text-right">Prime</th>
                  <th className="hidden px-3 py-2.5 text-right lg:table-cell">Commission</th>
                  <th className="px-3 py-2.5">Statut</th>
                  <th className="hidden px-3 py-2.5 md:table-cell">Date début</th>
                  <th className="py-2.5 pl-3 pr-lg" />
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40 text-body-compact">
                {contractsData.data.map((c: Contract) => {
                  const agentName = agentsResult.data?.find((a) => a.id === c.agentId)?.name ?? "—";
                  return (
                    <tr key={c.id} className="hover:bg-surface-low transition-colors">
                      <td className="py-2.5 pl-lg pr-3 font-mono font-semibold text-on-surface">{c.reference}</td>
                      <td className="px-3 py-2.5 text-on-surface">{c.client}</td>
                      <td className="px-3 py-2.5 text-on-surface-variant">{agentName}</td>
                      <td className="px-3 py-2.5 text-on-surface-variant">{c.product}</td>
                      <td className="px-3 py-2.5 text-right font-mono font-semibold tabular">{formatMoney(c.premium)}</td>
                      <td className="hidden px-3 py-2.5 text-right font-mono tabular lg:table-cell">{formatMoney(c.commission)}</td>
                      <td className="px-3 py-2.5">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="hidden px-3 py-2.5 text-on-surface-variant tabular md:table-cell">{formatDate(c.startDate)}</td>
                      <td className="py-2.5 pl-3 pr-lg text-right">
                        <Link
                          href={`/production/${c.id}`}
                          className="rounded bg-surface-container px-2 py-1 text-label-badge font-medium text-on-surface hover:bg-surface-highest transition-colors"
                        >
                          Détails
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-lg pb-md">
            <Pagination page={page} pageSize={10} total={total} onPageChange={setPage} />
          </div>
        </section>
      ) : null}
    </div>
  );
}
