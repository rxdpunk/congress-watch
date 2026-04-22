import { notFound } from "next/navigation";

import { MetricCard } from "@/components/metric-card";
import { PageIntro } from "@/components/page-intro";
import { formatDisplayDate, getBillDetail } from "@/lib/congress-data";

export default async function BillDetailPage({
  params,
}: {
  params: Promise<{ congress: string; billType: string; billNumber: string }>;
}) {
  const resolved = await params;
  let bill;

  try {
    bill = await getBillDetail(Number(resolved.congress), resolved.billType, Number(resolved.billNumber));
  } catch {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-12 lg:px-8">
      <PageIntro eyebrow="Bill detail" title={`${bill.idLabel} · ${bill.title}`} description={bill.latestActionText ?? "Official bill detail record"} />

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <MetricCard label="Introduced" value={formatDisplayDate(bill.introducedDate)} />
        <MetricCard label="Latest action" value={formatDisplayDate(bill.latestActionDate)} />
        <MetricCard label="Policy area" value={bill.policyArea ?? "Unavailable"} />
        <MetricCard label="Cosponsors" value={bill.cosponsorsCount == null ? "Unavailable" : String(bill.cosponsorsCount)} />
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <article className="rounded-[1.75rem] border border-[var(--border)] bg-white p-6">
          <h2 className="font-serif text-3xl text-[var(--ink)]">Summary</h2>
          <p className="mt-6 text-base leading-8 text-[var(--muted)]">
            {bill.summary ??
              "No official summary text is currently available from the live bill record. The title and latest action remain source-linked."}
          </p>
          <div className="mt-8">
            <h3 className="font-semibold text-[var(--ink)]">Official source</h3>
            <a href={bill.sourceUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm text-[var(--accent-blue)] underline decoration-[var(--accent-blue)]/30 underline-offset-4">
              {bill.sourceUrl}
            </a>
          </div>
        </article>

        <article className="rounded-[1.75rem] border border-[var(--border)] bg-white p-6">
          <h2 className="font-serif text-3xl text-[var(--ink)]">Action history</h2>
          <div className="mt-6 space-y-4">
            {bill.latestActions.map((action) => (
              <div key={`${action.actionDate}-${action.actionText}`} className="rounded-[1.25rem] border border-[var(--border)] px-4 py-4">
                <p className="text-sm font-semibold text-[var(--ink)]">{formatDisplayDate(action.actionDate)}</p>
                <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{action.actionText}</p>
              </div>
            ))}
          </div>
          {bill.subjects.length > 0 ? (
            <div className="mt-8">
              <h3 className="font-semibold text-[var(--ink)]">Subjects</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {bill.subjects.map((subject) => (
                  <span key={subject} className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)]">
                    {subject}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </article>
      </section>
    </main>
  );
}
