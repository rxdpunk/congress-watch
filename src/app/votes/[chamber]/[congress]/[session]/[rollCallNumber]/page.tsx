import { notFound } from "next/navigation";

import { MetricCard } from "@/components/metric-card";
import { PageIntro } from "@/components/page-intro";
import { getVoteDetail } from "@/lib/congress-data";

export default async function VoteDetailPage({
  params,
}: {
  params: Promise<{
    chamber: "house" | "senate";
    congress: string;
    session: string;
    rollCallNumber: string;
  }>;
}) {
  const resolved = await params;
  let vote;

  try {
    vote = await getVoteDetail(
      resolved.chamber,
      Number(resolved.congress),
      Number(resolved.session),
      Number(resolved.rollCallNumber),
    );
  } catch {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-12 lg:px-8">
      <PageIntro eyebrow="Vote detail" title={vote.title} description={vote.result} />

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <MetricCard label="Chamber" value={vote.chamber} />
        <MetricCard label="Roll call" value={String(vote.rollCallNumber)} />
        <MetricCard label="Congress" value={`${vote.congress}`} />
        <MetricCard label="Recorded positions" value={String(vote.positions.length)} />
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-[1.75rem] border border-[var(--border)] bg-white p-6">
          <h2 className="font-serif text-3xl text-[var(--ink)]">Metadata</h2>
          <dl className="mt-6 space-y-4 text-sm">
            <div>
              <dt className="font-semibold text-[var(--ink)]">Question</dt>
              <dd className="mt-1 leading-7 text-[var(--muted)]">{vote.question}</dd>
            </div>
            <div>
              <dt className="font-semibold text-[var(--ink)]">Issue</dt>
              <dd className="mt-1 leading-7 text-[var(--muted)]">{vote.issue ?? "No linked bill or issue label in this record."}</dd>
            </div>
            <div>
              <dt className="font-semibold text-[var(--ink)]">Official source</dt>
              <dd className="mt-1 leading-7 text-[var(--muted)]">
                <a href={vote.sourceUrl} target="_blank" rel="noreferrer" className="text-[var(--accent-blue)] underline decoration-[var(--accent-blue)]/30 underline-offset-4">
                  {vote.sourceUrl}
                </a>
              </dd>
            </div>
          </dl>
        </article>

        <article className="rounded-[1.75rem] border border-[var(--border)] bg-white p-6">
          <h2 className="font-serif text-3xl text-[var(--ink)]">Member positions</h2>
          <div className="mt-6 max-h-[44rem] overflow-auto rounded-[1rem] border border-[var(--border)]">
            <table className="min-w-full border-collapse text-sm">
              <thead className="sticky top-0 bg-[var(--surface)]">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-[var(--ink)]">Member</th>
                  <th className="px-4 py-3 text-left font-semibold text-[var(--ink)]">State</th>
                  <th className="px-4 py-3 text-left font-semibold text-[var(--ink)]">Party</th>
                  <th className="px-4 py-3 text-left font-semibold text-[var(--ink)]">Vote</th>
                </tr>
              </thead>
              <tbody>
                {vote.positions.map((position) => (
                  <tr key={`${position.memberId}-${position.vote}`} className="border-t border-[var(--border)]">
                    <td className="px-4 py-3 text-[var(--ink)]">{position.memberName}</td>
                    <td className="px-4 py-3 text-[var(--muted)]">{position.stateCode}</td>
                    <td className="px-4 py-3 text-[var(--muted)]">{position.partyCode}</td>
                    <td className="px-4 py-3 text-[var(--ink)]">{position.vote}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </main>
  );
}
