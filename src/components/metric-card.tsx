import type { ReactNode } from "react";

export function MetricCard({
  label,
  value,
  detail,
  visual,
}: {
  label: string;
  value: string;
  detail?: string;
  visual?: ReactNode;
}) {
  return (
    <article className="rounded-[1.1rem] border border-[rgba(19,52,92,0.12)] bg-white px-5 py-4 shadow-[0_8px_24px_rgba(15,38,68,0.045)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[0.82rem] font-medium tracking-[0.01em] text-[var(--muted)]">{label}</p>
          <p className="mt-1.5 font-serif text-[2rem] leading-none text-[var(--ink)]">{value}</p>
          {detail ? <p className="mt-2 text-[0.82rem] leading-5 text-[var(--muted)]">{detail}</p> : null}
        </div>
        {visual ? (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[rgba(19,52,92,0.08)] bg-[linear-gradient(180deg,rgba(246,249,253,0.95),rgba(239,244,251,0.95))] text-[var(--accent)]">
            {visual}
          </div>
        ) : null}
      </div>
    </article>
  );
}
