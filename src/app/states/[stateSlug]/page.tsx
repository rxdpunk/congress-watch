import { notFound } from "next/navigation";

import { MemberCard } from "@/components/member-card";
import { MetricCard } from "@/components/metric-card";
import { PageIntro } from "@/components/page-intro";
import { getStateOverview } from "@/lib/congress-data";

export default async function StateDetailPage({
  params,
}: {
  params: Promise<{ stateSlug: string }>;
}) {
  const { stateSlug } = await params;
  const data = await getStateOverview(stateSlug);

  if (!data) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-12 lg:px-8">
      <PageIntro
        eyebrow="State delegation"
        title={data.state}
        description={`Current members from ${data.state}, split across the House and Senate with direct paths into profiles, recent roll-call activity, and party breakdown.`}
      />

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <MetricCard label="Total delegation" value={String(data.members.length)} />
        <MetricCard label="House members" value={String(data.houseMembers.length)} />
        <MetricCard label="Senators" value={String(data.senateMembers.length)} />
        <MetricCard label="Party split" value={`${data.partyBreakdown.D ?? 0}-${data.partyBreakdown.R ?? 0}`} detail="Democrats to Republicans" />
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[1.75rem] border border-[var(--border)] bg-white p-6">
          <h2 className="font-serif text-3xl text-[var(--ink)]">Delegation members</h2>
          <div className="mt-6 grid gap-5 xl:grid-cols-2">
            {data.members.map((member) => (
              <MemberCard key={member.bioguideId} member={member} />
            ))}
          </div>
        </article>

        <article className="rounded-[1.75rem] border border-[var(--border)] bg-white p-6">
          <h2 className="font-serif text-3xl text-[var(--ink)]">Recent votes involving the delegation</h2>
          <div className="mt-6 space-y-4">
            {data.relatedVotes.length > 0 ? (
              data.relatedVotes.map((vote) => (
                <div key={vote.slug} className="rounded-[1.25rem] border border-[var(--border)] px-4 py-4">
                  <p className="text-sm font-semibold text-[var(--ink)]">{vote.title}</p>
                  <p className="mt-2 text-sm text-[var(--muted)]">{vote.result}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                    {vote.delegationBreakdown.map((position) => position.vote).join(" · ")}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm leading-7 text-[var(--muted)]">No recent roll-call vote breakdown was available for this delegation in the current cached window.</p>
            )}
          </div>
        </article>
      </section>
    </main>
  );
}
