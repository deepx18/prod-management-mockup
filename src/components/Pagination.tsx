export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  if (total === 0) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  return (
    <div className="flex items-center justify-between pt-sm">
      <span className="text-label-badge text-on-surface-variant tabular">
        {from}–{to} sur {total}
      </span>
      <div className="flex items-center gap-xs">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-md py-1 rounded border border-outline-variant bg-surface-lowest text-body-compact text-on-surface disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-low transition-colors"
        >
          Précédent
        </button>
        <span className="px-sm text-body-compact text-on-surface-variant tabular">
          {page} / {pageCount}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount}
          className="px-md py-1 rounded border border-outline-variant bg-surface-lowest text-body-compact text-on-surface disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-low transition-colors"
        >
          Suivant
        </button>
      </div>
    </div>
  );
}
