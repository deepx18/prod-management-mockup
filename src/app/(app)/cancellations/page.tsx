"use client";

import { useState } from "react";
import Link from "next/link";
import { SearchInput } from "@/components/SearchInput";
import { SelectFilter } from "@/components/SelectFilter";
import { PageSkeleton } from "@/components/PageSkeleton";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { useData } from "@/hooks/useData";
import { RequireRole } from "@/components/RequireRole";
import * as api from "@/services";
import { formatMoney, formatDate } from "@/lib/format";
import type { Cancellation } from "@/types";

const REASONS = [
  "Concurrence tarifaire",
  "Défaut de paiement",
  "Cessation d'activité",
  "Insatisfaction client",
];

export default function CancellationsPage() {
  return (
    <RequireRole roles={["admin", "supervisor"]}>
      <CancellationsContent />
    </RequireRole>
  );
}

function CancellationsContent() {
  const [reason, setReason] = useState("all");
  const [search, setSearch] = useState("");

  const { data, loading, error, retry } = useData(() => api.listCancellations({ reason }), [reason]);

  if (loading && !data) return <PageSkeleton rows={5} />;
  if (error) return <ErrorState message={error} onRetry={retry} />;

  const rows = (data ?? []).filter((c) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      c.contractRef.toLowerCase().includes(q) ||
      c.client.toLowerCase().includes(q) ||
      c.agentName.toLowerCase().includes(q)
    );
  });

  const totalPremium = rows.reduce((s, c) => s + c.premium, 0);
  const totalClawback = rows.reduce((s, c) => s + c.clawback, 0);

  return (
    <div className="space-y-lg">
      <div>
        <span className="text-label-table-header uppercase tracking-wider text-on-surface-variant">
          Churn &amp; Clawback
        </span>
        <h1 className="text-headline-lg tracking-tight text-on-surface">Résiliations</h1>
        <p className="text-body-compact text-on-surface-variant">
          {rows.length} résiliation{rows.length > 1 ? "s" : ""} · {formatMoney(totalPremium)} de primes perdues ·{" "}
          {formatMoney(totalClawback)} de clawback.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-md rounded-xl bg-surface-lowest p-md shadow-sm">
        <SearchInput value={search} onChange={setSearch} placeholder="N° contrat, client, agent…" />
        <SelectFilter
          value={reason}
          onChange={setReason}
          options={[{ value: "all", label: "Tous les motifs" }, ...REASONS.map((r) => ({ value: r, label: r }))]}
          ariaLabel="Filtrer par motif"
        />
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl bg-surface-lowest shadow-sm">
          <EmptyState
            title="Aucune résiliation"
            message="Aucune résiliation ne correspond aux filtres sélectionnés."
            action={{ label: "Réinitialiser", href: "/cancellations" }}
          />
        </div>
      ) : (
        <section className="overflow-hidden rounded-xl bg-surface-lowest shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-outline-variant text-label-table-header uppercase tracking-wider text-on-surface-variant">
                <th className="py-2.5 pl-lg pr-3">Contrat</th>
                <th className="px-3 py-2.5">Client</th>
                <th className="px-3 py-2.5">Agent</th>
                <th className="px-3 py-2.5">Date résiliation</th>
                <th className="px-3 py-2.5">Motif</th>
                <th className="px-3 py-2.5 text-right">Prime perdue</th>
                <th className="py-2.5 pl-3 pr-lg text-right">Clawback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40 text-body-compact">
              {rows.map((c: Cancellation & { contractRef: string; client: string; agentName: string }) => (
                <tr key={c.contractId} className="hover:bg-surface-low transition-colors">
                  <td className="py-2.5 pl-lg pr-3">
                    <Link href={`/production/${c.contractId}`} className="font-mono font-semibold text-on-surface hover:text-primary hover:underline">
                      {c.contractRef}
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 text-on-surface">{c.client}</td>
                  <td className="px-3 py-2.5 text-on-surface-variant">{c.agentName}</td>
                  <td className="px-3 py-2.5 tabular text-on-surface-variant">{formatDate(c.cancellationDate)}</td>
                  <td className="px-3 py-2.5 text-on-surface">{c.reason}</td>
                  <td className="px-3 py-2.5 text-right font-mono font-semibold tabular">{formatMoney(c.premium)}</td>
                  <td className="py-2.5 pl-3 pr-lg text-right">
                    <span className="rounded bg-error-container px-2 py-0.5 text-label-badge font-semibold text-on-error-container tabular">
                      −{formatMoney(c.clawback)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
