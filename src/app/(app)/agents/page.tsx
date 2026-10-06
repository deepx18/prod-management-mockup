"use client";

import { useState } from "react";
import Link from "next/link";
import { SearchInput } from "@/components/SearchInput";
import { SelectFilter } from "@/components/SelectFilter";
import { PageSkeleton } from "@/components/PageSkeleton";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { useData } from "@/hooks/useData";
import * as api from "@/services";
import { formatMoney } from "@/lib/format";
import type { AgentSummary } from "@/types";

export default function AgentsPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const { data, loading, error, retry } = useData(() => api.listAgentSummaries(), []);

  if (loading) return <PageSkeleton rows={6} />;
  if (error || !data) return <ErrorState message={error ?? "Données indisponibles."} onRetry={retry} />;

  const q = search.trim().toLowerCase();
  const filtered = data
    .filter((a) => (activeFilter === "all" ? true : activeFilter === "active" ? a.active : !a.active))
    .filter((a) => a.name.toLowerCase().includes(q) || a.region.toLowerCase().includes(q));

  return (
    <div className="space-y-lg">
      <div>
        <span className="text-label-table-header uppercase tracking-wider text-on-surface-variant">
          Réseau &amp; Apporteurs
        </span>
        <h1 className="text-headline-lg tracking-tight text-on-surface">Conseillers / Agents</h1>
        <p className="text-body-compact text-on-surface-variant">
          {filtered.length} agent{filtered.length > 1 ? "s" : ""} au réseau.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-md rounded-xl bg-surface-lowest p-md shadow-sm">
        <SearchInput value={search} onChange={setSearch} placeholder="Nom, région…" />
        <SelectFilter
          value={activeFilter}
          onChange={setActiveFilter}
          options={[
            { value: "all", label: "Tous" },
            { value: "active", label: "Actifs" },
            { value: "inactive", label: "Inactifs" },
          ]}
          ariaLabel="Filtrer par statut de l'agent"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl bg-surface-lowest shadow-sm">
          <EmptyState
            title="Aucun agent trouvé"
            message="Aucun agent ne correspond à la recherche."
            action={{ label: "Réinitialiser", href: "/agents" }}
          />
        </div>
      ) : (
        <section className="overflow-hidden rounded-xl bg-surface-lowest shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-outline-variant text-label-table-header uppercase tracking-wider text-on-surface-variant">
                <th className="py-2.5 pl-lg pr-3">Agent</th>
                <th className="px-3 py-2.5">Région</th>
                <th className="hidden px-3 py-2.5 md:table-cell">Spécialité</th>
                <th className="px-3 py-2.5 text-right">Contrats</th>
                <th className="px-3 py-2.5 text-right">Production</th>
                <th className="px-3 py-2.5 text-right">Commissions</th>
                <th className="px-3 py-2.5">Statut</th>
                <th className="py-2.5 pl-3 pr-lg text-right">Fiche</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40 text-body-compact">
              {filtered.map((a: AgentSummary) => (
                <tr key={a.id} className="hover:bg-surface-low transition-colors">
                  <td className="py-2.5 pl-lg pr-3">
                    <Link href={`/agents/${a.id}`} className="font-medium text-on-surface hover:text-primary hover:underline">
                      {a.name}
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 text-on-surface-variant">{a.region}</td>
                  <td className="hidden px-3 py-2.5 text-on-surface-variant md:table-cell">{a.productSpecialty}</td>
                  <td className="px-3 py-2.5 text-right font-mono tabular">{a.contracts}</td>
                  <td className="px-3 py-2.5 text-right font-mono font-semibold tabular">{formatMoney(a.production)}</td>
                  <td className="px-3 py-2.5 text-right font-mono tabular">{formatMoney(a.commissions)}</td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-label-badge font-medium ${
                        a.active ? "bg-success-container text-on-success-container" : "bg-surface-container text-on-surface-variant"
                      }`}
                    >
                      {a.active ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className="py-2.5 pl-3 pr-lg text-right">
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
        </section>
      )}
    </div>
  );
}
