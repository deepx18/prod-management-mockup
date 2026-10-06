export function PageSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-md animate-pulse" aria-hidden>
      <div className="h-8 w-1/3 bg-surface-container rounded" />
      <div className="h-20 bg-surface-container rounded-xl" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 bg-surface-container rounded" />
      ))}
    </div>
  );
}
