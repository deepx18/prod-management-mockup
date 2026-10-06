export function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full max-w-xs bg-surface-lowest border border-outline-variant rounded px-md py-1.5 text-body-compact text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
    />
  );
}
