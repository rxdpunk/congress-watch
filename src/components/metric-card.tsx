export function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <article className="rounded-[1.25rem] border border-[var(--border)] bg-white px-5 py-4 shadow-[0_12px_30px_rgba(12,33,58,0.05)]">
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className="mt-2 font-serif text-3xl text-[var(--ink)]">{value}</p>
      {detail ? <p className="mt-2 text-xs leading-5 text-[var(--muted)]">{detail}</p> : null}
    </article>
  );
}
