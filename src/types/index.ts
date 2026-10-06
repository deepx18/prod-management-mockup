/**
 * Domain types — shared contract between the frontend and the future Laravel API.
 * Field names intentionally mirror the planned GET /api/... responses so the
 * mock services layer can be swapped for real HTTP calls without UI changes.
 */

export type Role = "admin" | "supervisor" | "agent";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  active: boolean;
}

export interface Session {
  user: User;
}

export type ContractStatus = "active" | "cancelled";

export type Product =
  | "Auto Flotte & Transport"
  | "Santé Groupe & Prévoyance"
  | "Multirisque Pro & RC Pro"
  | "RC Dirigeants D&O"
  | "Vie & Retraite";

export const PRODUCTS: Product[] = [
  "Auto Flotte & Transport",
  "Santé Groupe & Prévoyance",
  "Multirisque Pro & RC Pro",
  "RC Dirigeants D&O",
  "Vie & Retraite",
];

export type CancellationReason =
  | "Concurrence tarifaire"
  | "Défaut de paiement"
  | "Cessation d'activité"
  | "Insatisfaction client";

export type CommissionStatus = "payée" | "en attente" | "clawback";

export interface Agent {
  id: number;
  name: string;
  region: string;
  productSpecialty: Product;
  active: boolean;
}

export interface Contract {
  id: number;
  reference: string;
  client: string;
  agentId: number;
  product: Product;
  premium: number; // cotisation annuelle, MAD
  commission: number; // commission agent, MAD
  status: ContractStatus;
  startDate: string; // ISO yyyy-mm-dd
  endDate: string; // ISO yyyy-mm-dd
  createdAt: string; // ISO datetime
}

export interface Commission {
  id: number;
  contractId: number;
  agentId: number;
  premium: number;
  commission: number;
  status: CommissionStatus;
  date: string; // ISO
}

export interface Cancellation {
  contractId: number;
  cancellationDate: string;
  reason: CancellationReason;
  premium: number;
  clawback: number;
}

export interface AgentSummary extends Agent {
  contracts: number;
  production: number; // total premiums, MAD
  commissions: number; // total commissions, MAD
}

export interface DashboardStats {
  productionTotal: number;
  premiumsTotal: number;
  contractsTotal: number;
  contractsActive: number;
  contractsCancelled: number;
  commissionsTotal: number;
  productionByMonth: { month: string; production: number; premiums: number }[];
  productionByProduct: { product: Product; share: number }[];
  topAgents: AgentSummary[];
  recentContracts: Contract[];
  recentCancellations: (Cancellation & {
    contractRef: string;
    client: string;
    agentName: string;
  })[];
}

export interface AgentDetail {
  agent: Agent;
  contracts: Contract[];
  commissions: Commission[];
  cancellations: Cancellation[];
  stats: {
    contracts: number;
    production: number;
    commissions: number;
    cancellations: number;
  };
}

export interface MonthlyPoint {
  month: string;
  production: number;
  premiums: number;
}
