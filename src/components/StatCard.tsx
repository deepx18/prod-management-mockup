export function StatCard({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "neutral" | "error";
}) {
  return (
    <div className="bg-surface-lowest p-md rounded-xl shadow-sm flex flex-col justify-between gap-sm">
      <span className="text-label-table-header text-on-surface-variant uppercase tracking-wider">
        {label}
      </span>
      <div>
        <div
          className={`text-display-kpi tabular ${tone === "error" ? "text-error" : "text-on-surface"}`}
        >
          {value}
        </div>
        {hint ? (
          <div className="mt-1 text-label-badge text-on-surface-variant">{hint}</div>
        ) : null}
      </div>
    </div>
  );
}
