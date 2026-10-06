const moneyFmt = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
const dateFmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" });
const dateTimeFmt = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "short",
  timeStyle: "short",
});

export function formatMoney(v: number): string {
  return `${moneyFmt.format(v)} MAD`;
}

export function formatNumber(v: number): string {
  return moneyFmt.format(v);
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : dateFmt.format(d);
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : dateTimeFmt.format(d);
}
