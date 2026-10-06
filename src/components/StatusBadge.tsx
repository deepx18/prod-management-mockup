import type { CommissionStatus, ContractStatus } from "@/types";

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  active: {
    label: "Actif",
    className: "bg-success-container text-on-success-container",
  },
  cancelled: {
    label: "Résilié",
    className: "bg-error-container text-on-error-container",
  },
  "payée": {
    label: "Payée",
    className: "bg-success-container text-on-success-container",
  },
  "en attente": {
    label: "En attente",
    className: "bg-warning-container text-on-warning-container",
  },
  clawback: {
    label: "Clawback",
    className: "bg-error-container text-on-error-container",
  },
};

export function StatusBadge({
  status,
}: {
  status: ContractStatus | CommissionStatus;
}) {
  const cfg = statusConfig[status];
  if (!cfg) return null;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-label-badge font-medium ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}
