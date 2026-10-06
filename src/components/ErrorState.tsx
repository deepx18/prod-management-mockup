"use client";

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-xl text-center">
      <p className="text-headline-sm text-error">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-md px-lg py-1.5 border border-outline-variant rounded text-body-compact text-on-surface hover:bg-surface-low transition-colors"
        >
          Réessayer
        </button>
      ) : null}
    </div>
  );
}
