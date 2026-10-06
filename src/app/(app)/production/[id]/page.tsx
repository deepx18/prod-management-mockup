"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { PageSkeleton } from "@/components/PageSkeleton";
import { ErrorState } from "@/components/ErrorState";
import { useData } from "@/hooks/useData";
import * as api from "@/services";
import { formatMoney, formatDate } from "@/lib/format";

function DetailRow({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-lg py-2.5">
      <dt className="text-label-table-header uppercase tracking-wider text-on-surface-variant">{label}</dt>
      <dd className={`text-right text-body-default text-on-surface ${mono ? "font-mono tabular" : ""}`}>{value}</dd>
    </div>
  );
}

export default function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const contractId = Number(id);
  const { data, loading, error, retry } = useData(async () => {
    const contract = await api.getContract(contractId);
    if (!contract) return null;
    const agents = await api.listAgents();
    const commissions = await api.listCommissions({ pageSize: 999 });
    const cancellations = await api.listCancellations();
    return {
      contract,
      agent: agents.find((a) => a.id === contract.agentId) ?? null,
      commission: commissions.data.find((c) => c.contractId === contract.id) ?? null,
      cancellation: cancellations.find((c) => c.contractId === contract.id) ?? null,
    };
  }, [contractId]);

  useEffect(() => {
    if (!loading && !error && !data) {
      // Contrat introuvable → retour à la liste
      router.replace("/production");
    }
  }, [loading, error, data, router]);

  if (loading) return <PageSkeleton rows={6} />;
  if (error) return <ErrorState message={error} onRetry={retry} />;
  if (!data) return null;

  const { contract, agent, commission, cancellation } = data;

  return (
    <div className="space-y-lg">
      <nav className="flex items-center gap-xs text-body-compact text-on-surface-variant" aria-label="Fil d'ariane">
        <Link href="/production" className="hover:text-on-surface hover:underline">
          Production
        </Link>
        <span>/</span>
        <span className="font-mono font-semibold text-on-surface">{contract.reference}</span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-md">
        <div>
          <span className="text-label-table-header uppercase tracking-wider text-on-surface-variant">
            {contract.product}
          </span>
          <h1 className="font-mono text-headline-lg tracking-tight text-on-surface">{contract.reference}</h1>
          <p className="text-body-compact text-on-surface-variant">{contract.client}</p>
        </div>
        <StatusBadge status={contract.status} />
      </div>

      <div className="grid grid-cols-1 gap-lg lg:grid-cols-2">
        <section className="rounded-xl bg-surface-lowest p-lg shadow-sm">
          <h2 className="mb-sm text-headline-sm text-on-surface">Informations contractuelles</h2>
          <dl className="divide-y divide-outline-variant/40">
            <DetailRow label="Client" value={contract.client} />
            <DetailRow label="Produit" value={contract.product} />
            <DetailRow
              label="Agent apporteur"
              value={
                agent ? (
                  <Link href={`/agents/${agent.id}`} className="font-medium text-primary hover:underline">
                    {agent.name}
                  </Link>
                ) : (
                  "—"
                )
              }
            />
            <DetailRow label="Prime annuelle" value={formatMoney(contract.premium)} mono />
            <DetailRow label="Commission agent" value={formatMoney(contract.commission)} mono />
          </dl>
        </section>

        <section className="rounded-xl bg-surface-lowest p-lg shadow-sm">
          <h2 className="mb-sm text-headline-sm text-on-surface">Dates &amp; statut</h2>
          <dl className="divide-y divide-outline-variant/40">
            <DetailRow label="Statut" value={<StatusBadge status={contract.status} />} />
            <DetailRow label="Date de début" value={formatDate(contract.startDate)} mono />
            <DetailRow label="Date de fin" value={formatDate(contract.endDate)} mono />
            <DetailRow label="Enregistré le" value={formatDate(contract.createdAt)} mono />
          </dl>
        </section>
      </div>

      {commission ? (
        <section className="rounded-xl bg-surface-lowest p-lg shadow-sm">
          <h2 className="mb-sm text-headline-sm text-on-surface">Commission</h2>
          <dl className="divide-y divide-outline-variant/40">
            <DetailRow label="Statut commission" value={<StatusBadge status={commission.status} />} />
            <DetailRow label="Montant" value={formatMoney(commission.commission)} mono />
            <DetailRow label="Date de calcul" value={formatDate(commission.date)} mono />
          </dl>
        </section>
      ) : null}

      {cancellation ? (
        <section className="rounded-xl border border-error/30 bg-surface-lowest p-lg shadow-sm">
          <h2 className="mb-sm text-headline-sm text-error">Résiliation</h2>
          <dl className="divide-y divide-outline-variant/40">
            <DetailRow label="Date de résiliation" value={formatDate(cancellation.cancellationDate)} mono />
            <DetailRow label="Motif" value={cancellation.reason} />
            <DetailRow label="Prime perdue" value={formatMoney(cancellation.premium)} mono />
            <DetailRow label="Clawback commission" value={formatMoney(cancellation.clawback)} mono />
          </dl>
        </section>
      ) : null}

      <div className="flex items-center justify-between">
        <Link
          href="/production"
          className="rounded border border-outline-variant bg-surface-lowest px-lg py-1.5 text-body-compact text-on-surface hover:bg-surface-low transition-colors"
        >
          ← Retour à la production
        </Link>
      </div>
    </div>
  );
}
