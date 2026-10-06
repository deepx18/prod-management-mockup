"use client";

import { useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { SearchInput } from "@/components/SearchInput";
import { SelectFilter } from "@/components/SelectFilter";
import { Pagination } from "@/components/Pagination";
import { PageSkeleton } from "@/components/PageSkeleton";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { useData } from "@/hooks/useData";
import { RequireRole } from "@/components/RequireRole";
import * as api from "@/services";
import { formatMoney, formatDate } from "@/lib/format";
import type { Commission, Contract } from "@/types";

const STATUS_OPTIONS = [
  { value: "all", label: "Tous les statuts" },
  { value: "payée", label: "Payées" },
  { value: "en attente", label: "En attente" },
  { value: "clawback", label: "Clawback" },
];

export default function CommissionsPage() {
  return (
    <RequireRole roles={["admin", "supervisor"]}>
      <CommissionsContent />
    </RequireRole>
  );
}

function CommissionsContent() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const contractsResult = useData(() => api.listContracts({ pageSize: 999 }), []);
  const agentsResult = useData(() => api.listAgents(), []);
  const commissionsResult = useData(
    () => api.listCommissions({ search, status, page, pageSize: 10 }),
    [search, status, page],
  );

  const contracts = contractsResult.data?.data ?? [];
  const agents = agentsResult.data ?? [];
  const commissions = commissionsResult.data;

  function handleFilterChange(setter: (v: string) => void) {
    return (v: string) => {
      setter(v);
      setPage(1);
    };
  }

  const total = commissions?.total ?? 0;

  return (
    <div className="space-y-lg">
      <div>
        <span className="text-label-table-header uppercase tracking-wider text-on-surface-variant">
          Liquidation &amp; Primes
        </span>
        <h1 className="text-headline-lg tracking-tight text-on-surface">Commissions &amp; Primes</h1>
        <p className="text-body-compact text-on-surface-variant">
          {total} ligne{total > 1 ? "s" : ""} de commission — règles simples de calcul (5 % à 8,75 % de la prime).
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-md rounded-xl bg-surface-lowest p-md shadow-sm">
        <SearchInput value={search} onChange={handleFilterChange(setSearch)} placeholder="N° contrat, client, agent…" />
        <SelectFilter value={status} onChange={handleFilterChange(setStatus)} options={STATUS_OPTIONS} ariaLabel="Filtrer par statut" />
      </div>

      {commissionsResult.loading && !commissions ? (
        <PageSkeleton rows={6} />
      ) : commissionsResult.error ? (
        <ErrorState message={commissionsResult.error} onRetry={commissionsResult.retry} />
      ) : commissions && commissions.data.length === 0 ? (
        <div className="rounded-xl bg-surface-lowest shadow-sm">
          <EmptyState
            title="Aucune commission trouvée"
            message="Aucune ligne de commission ne correspond aux filtres."
            action={{ label: "Réinitialiser les filtres", href: "/commissions" }}
          />
        </div>
      ) : commissions ? (
        <section className="rounded-xl bg-surface-lowest shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-outline-variant text-label-table-header uppercase tracking-wider text-on-surface-variant">
                  <th className="py-2.5 pl-lg pr-3">Agent</th>
                  <th className="px-3 py-2.5">Contrat</th>
                  <th className="px-3 py-2.5 text-right">Prime</th>
                  <th className="px-3 py-2.5 text-right">Commission</th>
                  <th className="px-3 py-2.5">Statut</th>
                  <th className="px-3 py-2.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40 text-body-compact">
                {commissions.data.map((c: Commission) => {
                  const contract = contracts.find((ct: Contract) => ct.id === c.contractId);
                  const agentName = agents.find((a) => a.id === c.agentId)?.name ?? "—";
                  return (
                    <tr key={c.id} className="hover:bg-surface-low transition-colors">
                      <td className="py-2.5 pl-lg pr-3">
                        <Link href={`/agents/${c.agentId}`} className="font-medium text-on-surface hover:text-primary hover:underline">
                          {agentName}
                        </Link>
                      </td>
                      <td className="px-3 py-2.5">
                        <Link href={`/production/${c.contractId}`} className="font-mono font-semibold text-on-surface hover:text-primary hover:underline">
                          {contract?.reference ?? `#${c.contractId}`}
                        </Link>
                        <span className="block text-label-badge text-on-surface-variant">{contract?.client}</span>
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono tabular">{formatMoney(c.premium)}</td>
                      <td className="px-3 py-2.5 text-right font-mono font-semibold tabular">{formatMoney(c.commission)}</td>
                      <td className="px-3 py-2.5">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-3 py-2.5 tabular text-on-surface-variant">{formatDate(c.date)}</td>
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
