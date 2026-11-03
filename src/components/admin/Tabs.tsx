'use client';

export default function Tabs({
  items,
  current,
  onSelect,
}: {
  items: readonly (readonly [string, string])[];
  current: string;
  onSelect: (key: string) => void;
}) {
  return (
    <div className="tabs" role="tablist">
      {items.map(([key, label]) => (
        <button
          key={key}
          type="button"
          role="tab"
          aria-selected={current === key}
          onClick={() => onSelect(key)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
