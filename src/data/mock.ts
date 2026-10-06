import type {
  Agent,
  Cancellation,
  Commission,
  Contract,
  Product,
  User,
} from "@/types";

/**
 * Données de démonstration — représentent ce que renverra le backend Laravel.
 * Centralisées ici pour que la couche services puisse être remplacée par de
 * vrais appels HTTP sans toucher aux composants.
 */

export const users: User[] = [
  { id: 1, name: "Karim Bennani", email: "admin@assurcore.ma", role: "admin", active: true },
  { id: 2, name: "Salma Idrissi", email: "superviseur@assurcore.ma", role: "supervisor", active: true },
  // Le compte démo "agent" porte le nom d'une fiche conseiller existante
  // afin que "Mon Espace Agent" puisse lui être associé.
  { id: 3, name: "Youssef El Amrani", email: "agent@assurcore.ma", role: "agent", active: true },
  { id: 4, name: "Sara Benkirane", email: "s.benkirane@assurcore.ma", role: "agent", active: true },
  { id: 5, name: "Mehdi Tazi", email: "m.tazi@assurcore.ma", role: "agent", active: true },
  { id: 6, name: "Amina Alaoui", email: "a.alaoui@assurcore.ma", role: "agent", active: false },
];

export const agents: Agent[] = [
  { id: 1, name: "Youssef El Amrani", region: "Casablanca CFC", productSpecialty: "Auto Flotte & Transport", active: true },
  { id: 2, name: "Sara Benkirane", region: "Rabat Agdal", productSpecialty: "Santé Groupe & Prévoyance", active: true },
  { id: 3, name: "Mehdi Tazi", region: "Tanger Free Zone", productSpecialty: "RC Dirigeants D&O", active: true },
  { id: 4, name: "Amina Alaoui", region: "Marrakech Guéliz", productSpecialty: "Multirisque Pro & RC Pro", active: false },
  { id: 5, name: "Omar Chraibi", region: "Fès Médina", productSpecialty: "Multirisque Pro & RC Pro", active: true },
];

const P: Product[] = [
  "Auto Flotte & Transport",
  "Santé Groupe & Prévoyance",
  "Multirisque Pro & RC Pro",
  "RC Dirigeants D&O",
  "Vie & Retraite",
];

const CLIENTS = [
  "Maghreb Logistique SA",
  "Clinique Atlas Santé",
  "Dr. Rachid Mansouri",
  "Holding Financière du Sud",
  "Omnium Textile Casablanca",
  "Transports Express Marrakech",
  "Coopérative Agricole Tadla",
  "Groupe Immotel",
  "Cabinet Consulting Atlas",
  "Pharmacies Al Wifak",
  "Boulangeries Chahiwa",
  "TechnoPark Systems",
];

function mkContracts(): Contract[] {
  const contracts: Contract[] = [];
  let id = 1;
  const seq = 8841;
  // 3 contrats "aujourd'hui" (production récente), puis historique sur 12 mois
  const today = new Date("2026-10-05T00:00:00Z");
  for (let i = 0; i < 3; i++) {
    const d = new Date(today);
    d.setUTCHours(15 - i * 3, 42 - i * 27, 0, 0);
    contracts.push({
      id,
      reference: `CT-2026-${seq - i}`,
      client: CLIENTS[i],
      agentId: (i % 5) + 1,
      product: P[i % P.length],
      premium: [148500, 92000, 14200][i],
      commission: Math.round([148500, 92000, 14200][i] * 0.075),
      status: "active",
      startDate: d.toISOString().slice(0, 10),
      endDate: `${d.getUTCFullYear() + 1}-12-31`,
      createdAt: d.toISOString(),
    });
    id++;
  }
  // Historique : 47 contrats répartis sur les 12 derniers mois
  for (let m = 11; m >= 0; m--) {
    const count = 2 + ((m * 7) % 3); // 2 à 4 contrats par mois
    for (let j = 0; j < count; j++) {
      const d = new Date(Date.UTC(2025, 9 + (12 - m), 5 + j * 4, 10, 30, 0));
      const premium = 12000 + ((m * 37 + j * 91) % 23) * 6500;
      const cancelled = (m * 3 + j) % 11 === 0; // ~2 résiliations sur la période
      contracts.push({
        id,
        reference: `CT-2026-${seq - id + 1}`,
        client: CLIENTS[(id + j) % CLIENTS.length],
        agentId: ((id * 2 + j) % 5) + 1,
        product: P[(m + j) % P.length],
        premium,
        commission: Math.round(premium * (0.05 + ((j % 3) * 0.0125))),
        status: cancelled ? "cancelled" : "active",
        startDate: d.toISOString().slice(0, 10),
        endDate: `${d.getUTCFullYear() + 1}-12-31`,
        createdAt: d.toISOString(),
      });
      id++;
    }
  }
  return contracts;
}

export const contracts: Contract[] = mkContracts();

export const commissions: Commission[] = contracts.map((c, i) => ({
  id: c.id,
  contractId: c.id,
  agentId: c.agentId,
  premium: c.premium,
  commission: c.commission,
  status:
    c.status === "cancelled" && i % 2 === 0
      ? "clawback"
      : i % 4 === 0
        ? "en attente"
        : "payée",
  date: c.createdAt,
}));

export const cancellations: Cancellation[] = contracts
  .filter((c) => c.status === "cancelled")
  .map((c) => ({
    contractId: c.id,
    cancellationDate: c.endDate,
    reason: (["Concurrence tarifaire", "Défaut de paiement", "Cessation d'activité", "Insatisfaction client"] as const)[
      c.id % 4
    ],
    premium: c.premium,
    clawback: Math.round(c.commission * 0.35),
  }));
