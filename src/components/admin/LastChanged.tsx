interface AuditedRecord {
  updatedByName?: string;
  updatedByRole?: string;
  updatedAt?: string;
}

export function lastChangedText(record: AuditedRecord): string {
  if (!record.updatedByName || !record.updatedAt) return '';
  const when = new Date(record.updatedAt);
  if (Number.isNaN(when.getTime())) return '';
  const time = when.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
  return `Last changed by ${record.updatedByName} (${record.updatedByRole || 'Staff'}) · ${time}`;
}

export default function LastChanged({ record }: { record: AuditedRecord }) {
  const text = lastChangedText(record);
  if (!text) return null;
  return <span className="count">{text}</span>;
}
