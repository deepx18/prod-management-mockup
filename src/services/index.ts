import type {
  Agent,
  AgentDetail,
  AgentSummary,
  Cancellation,
  Commission,
  Contract,
  ContractStatus,
  DashboardStats,
  Session,
  User,
} from "@/types";
import * as mock from "@/data/mock";

/**
 * Couche d'accès aux données.
 *
 * Aujourd'hui : lecture directe du jeu de démonstration (src/data/mock.ts).
 * Demain : remplacer le corps de chaque fonction par un appel HTTP vers le
 * backend Laravel (GET /api/contracts, GET /api/dashboard, ...) en gardant
 * les mêmes signatures — aucune page ni composant ne change.
 */

export interface ContractFilters {
  search?: string;
  status?: "all" | ContractStatus;
  agentId?: number;
  page?: number;
  pageSize?: number;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms));

/* ------------------------------------------------------------------ auth */

export async function getSession(): Promise<Session | null> {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem("assurcore.session");
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: Session): void {
  window.sessionStorage.setItem("assurcore.session", JSON.stringify(session));
}

export function clearSession(): void {
  window.sessionStorage.removeItem("assurcore.session");
}

/** Démo : identifiants affichés sur la page de connexion. */
export async function login(email: string, password: string): Promise<Session> {
  await delay(200);
  const user = mock.users.find((u) => u.active && u.email === email.trim().toLowerCase());
  if (!user || password !== "demo1234") {
    throw new Error("Identifiants incorrects.");
  }
  return { user };
}

export async function listUsers(): Promise<User[]> {
  await delay();
  return mock.users;
}

/* -------------------------------------------------------------- contracts */

export async function listContracts(filters: ContractFilters = {}): Promise<Paginated<Contract>> {
  await delay();
  const { search = "", status = "all", agentId, page = 1, pageSize = 10 } = filters;
  const q = search.trim().toLowerCase();
  let rows = mock.contracts;
  if (status !== "all") rows = rows.filter((c) => c.status === status);
  if (agentId) rows = rows.filter((c) => c.agentId === agentId);
  if (q) {
    rows = rows.filter(
      (c) =>
        c.reference.toLowerCase().includes(q) ||
        c.client.toLowerCase().includes(q) ||
        mock.agents.find((a) => a.id === c.agentId)?.name.toLowerCase().includes(q),
    );
  }
  const total = rows.length;
  const start = (page - 1) * pageSize;
  return { data: rows.slice(start, start + pageSize), total, page, pageSize };
}

export async function getContract(id: number): Promise<Contract | null> {
  await delay();
  return mock.contracts.find((c) => c.id === id) ?? null;
}

/* ----------------------------------------------------------------- agents */

export async function listAgents(): Promise<Agent[]> {
  await delay();
  return mock.agents;
}

function summarize(a: Agent): AgentSummary {
  const rows = mock.contracts.filter((c) => c.agentId === a.id);
  return {
    ...a,
    contracts: rows.length,
    production: rows.filter((c) => c.status === "active").reduce((s, c) => s + c.premium, 0),
    commissions: rows.reduce((s, c) => s + c.commission, 0),
  };
}

export async function listAgentSummaries(): Promise<AgentSummary[]> {
  await delay();
  return mock.agents.map(summarize).sort((a, b) => b.production - a.production);
}

export async function getAgentDetail(id: number): Promise<AgentDetail | null> {
  await delay();
  const agent = mock.agents.find((a) => a.id === id);
  if (!agent) return null;
  const contracts = mock.contracts.filter((c) => c.agentId === id);
  const commissions = mock.commissions.filter((c) => c.agentId === id);
  const cancellations = mock.cancellations.filter((c) =>
    contracts.some((ct) => ct.id === c.contractId),
  );
  return {
    agent,
    contracts,
    commissions,
    cancellations,
    stats: {
      contracts: contracts.length,
      production: contracts.filter((c) => c.status === "active").reduce((s, c) => s + c.premium, 0),
      commissions: commissions.reduce((s, c) => s + c.commission, 0),
      cancellations: cancellations.length,
    },
  };
}

/* ------------------------------------------------------------ commissions */

export async function listCommissions(
  filters: { search?: string; status?: string; page?: number; pageSize?: number } = {},
): Promise<Paginated<Commission>> {
  await delay();
  const { search = "", status = "all", page = 1, pageSize = 10 } = filters;
  const q = search.trim().toLowerCase();
  let rows = mock.commissions;
  if (status !== "all") rows = rows.filter((c) => c.status === status);
  if (q) {
    rows = rows.filter((c) => {
      const contract = mock.contracts.find((ct) => ct.id === c.contractId);
      const agent = mock.agents.find((a) => a.id === c.agentId);
      return (
        (contract?.reference.toLowerCase().includes(q) ?? false) ||
        (contract?.client.toLowerCase().includes(q) ?? false) ||
        (agent?.name.toLowerCase().includes(q) ?? false)
      );
    });
  }
  const total = rows.length;
  const start = (page - 1) * pageSize;
  return { data: rows.slice(start, start + pageSize), total, page, pageSize };
}

/* ---------------------------------------------------------- cancellations */

export async function listCancellations(
  filters: { reason?: string } = {},
): Promise<(Cancellation & { contractRef: string; client: string; agentName: string })[]> {
  await delay();
  let rows = mock.cancellations.map((c) => {
    const contract = mock.contracts.find((ct) => ct.id === c.contractId);
    return {
      ...c,
      contractRef: contract?.reference ?? "—",
      client: contract?.client ?? "—",
      agentName:
        mock.agents.find((a) => a.id === contract?.agentId)?.name ?? "—",
    };
  });
  if (filters.reason && filters.reason !== "all") {
    rows = rows.filter((c) => c.reason === filters.reason);
  }
  return rows;
}

/* -------------------------------------------------------------- dashboard */

export async function getDashboardStats(): Promise<DashboardStats> {
  await delay();
  const active = mock.contracts.filter((c) => c.status === "active");
  const cancelled = mock.contracts.filter((c) => c.status === "cancelled");

  const months: { month: string; production: number; premiums: number }[] = [];
  for (let m = 0; m < 12; m++) {
    const start = new Date(Date.UTC(2025, 9 + m, 1));
    const end = new Date(Date.UTC(2025, 10 + m, 1));
    const label = start.toLocaleDateString("fr-FR", { month: "short", timeZone: "UTC" });
    const inMonth = mock.contracts.filter((c) => {
      const d = new Date(c.createdAt);
      return d >= start && d < end;
    });
    months.push({
      month: label,
      production: inMonth.filter((c) => c.status === "active").length,
      premiums: inMonth.reduce((s, c) => s + c.premium, 0),
    });
  }

  const byProduct = new Map<string, number>();
  for (const c of active) byProduct.set(c.product, (byProduct.get(c.product) ?? 0) + c.premium);
  const totalProd = [...byProduct.values()].reduce((s, v) => s + v, 0);
  const productionByProduct = [...byProduct.entries()]
    .map(([product, premium]) => ({ product: product as DashboardStats["productionByProduct"][number]["product"], share: Math.round((premium / totalProd) * 100) }))
    .sort((a, b) => b.share - a.share);

  const recentCancellations = await listCancellations();

  return {
    productionTotal: active.reduce((s, c) => s + c.premium, 0),
    premiumsTotal: mock.contracts.reduce((s, c) => s + c.premium, 0),
    contractsTotal: mock.contracts.length,
    contractsActive: active.length,
    contractsCancelled: cancelled.length,
    commissionsTotal: mock.commissions.reduce((s, c) => s + c.commission, 0),
    productionByMonth: months,
    productionByProduct,
    topAgents: (await listAgentSummaries()).slice(0, 5),
    recentContracts: [...mock.contracts]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 5),
    recentCancellations: recentCancellations.slice(0, 3),
  };
}
