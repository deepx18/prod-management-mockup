import Link from "next/link";

export function EmptyState({
  title,
  message,
  action,
}: {
  title: string;
  message: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-xl text-center">
      <p className="text-headline-sm text-on-surface">{title}</p>
      <p className="mt-1 max-w-sm text-body-compact text-on-surface-variant">{message}</p>
      {action ? (
        <Link
          href={action.href}
          className="mt-md px-lg py-1.5 bg-primary text-on-primary rounded text-body-compact font-medium hover:bg-primary-container transition-colors"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
