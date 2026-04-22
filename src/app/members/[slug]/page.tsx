import Link from "next/link";
import { notFound } from "next/navigation";

import { MetricCard } from "@/components/metric-card";
import { PageIntro } from "@/components/page-intro";
import { formatDisplayDate, formatPercent, getMemberPageData } from "@/lib/congress-data";

export default async function MemberPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getMemberPageData(slug);

  if (!data) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-12 lg:px-8">
      <PageIntro eyebrow="Member profile" title={data.member.fullName} description={data.member.roleLabel} />

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-[1.75rem] border border-[var(--border)] bg-white p-6 shadow-[0_16px_40px_rgba(12,33,58,0.06)]">
          <div className="flex flex-col gap-6 md:flex-row">
            <div className="flex h-40 w-32 items-center justify-center rounded-[1.25rem] bg-[var(--surface)] text-4xl font-semibold text-[var(--navy)]">
              {data.member.firstName[0]}
              {data.member.lastName[0]}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    data.member.partyCode === "R"
                      ? "bg-[rgba(176,48,53,0.12)] text-[var(--accent-red)]"
                      : data.member.partyCode === "D"
                        ? "bg-[rgba(39,93,181,0.12)] text-[var(--accent-blue)]"
                        : "bg-[rgba(12,33,58,0.08)] text-[var(--ink)]"
                  }`}
                >
                  {data.member.partyName}
                </span>
                <span className="text-sm text-[var(--muted)]">{data.member.stateName}</span>
                {data.member.districtLabel ? <span className="text-sm text-[var(--muted)]">{data.member.districtLabel}</span> : null}
                {data.member.senateClass ? <span className="text-sm text-[var(--muted)]">{data.member.senateClass}</span> : null}
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard label="Serving since" value={formatDisplayDate(data.serviceSince)} />
                <MetricCard label="Current term ends" value={formatDisplayDate(data.member.termEndDate)} />
                <MetricCard label="Committees" value={String(data.member.committees.length)} />
                <MetricCard label="Recent participation" value={formatPercent(data.participationRate)} />
              </div>
            </div>
          </div>
        </article>

        <aside className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--navy)] p-6 text-white shadow-[0_18px_50px_rgba(12,33,58,0.18)]">
          <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--paper-muted)]">Official contact</p>
          <div className="mt-4 space-y-3 text-sm leading-7">
            {data.member.officialWebsiteUrl ? (
              <p>
                Website:{" "}
                <a href={data.member.officialWebsiteUrl} target="_blank" rel="noreferrer" className="underline decoration-white/30 underline-offset-4">
                  {data.member.officialWebsiteUrl}
                </a>
              </p>
            ) : null}
            {data.member.officeAddress ? <p>Office: {data.member.officeAddress}</p> : null}
            {data.member.officePhone ? <p>Phone: {data.member.officePhone}</p> : null}
          </div>
          <div className="mt-8">
            <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--paper-muted)]">Committee assignments</p>
            <div className="mt-4 space-y-2">
              {data.member.committees.length > 0 ? (
                data.member.committees.map((committee) => (
                  <div key={committee.code} className="rounded-[1rem] border border-white/10 px-4 py-3 text-sm">
                    <p>{committee.name}</p>
                    {committee.role ? <p className="mt-1 text-xs text-[var(--paper-muted)]">{committee.role}</p> : null}
                  </div>
                ))
              ) : (
                <p className="text-sm text-[var(--paper-muted)]">No committee assignments available from current source records.</p>
              )}
            </div>
          </div>
        </aside>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <article className="rounded-[1.75rem] border border-[var(--border)] bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-3xl text-[var(--ink)]">Sponsored bills</h2>
            <span className="text-sm text-[var(--muted)]">{data.sponsoredBills.length} loaded</span>
          </div>
          <div className="mt-6 space-y-4">
            {data.sponsoredBills.length > 0 ? (
              data.sponsoredBills.map((bill) => (
                <Link
                  key={`${bill.billType}-${bill.billNumber}`}
                  href={`/bills/${bill.congress}/${bill.billType}/${bill.billNumber}`}
                  className="block rounded-[1.25rem] border border-[var(--border)] px-4 py-4 transition hover:border-[var(--accent-blue)]"
                >
                  <p className="font-semibold text-[var(--ink)]">{bill.idLabel}</p>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{bill.title}</p>
                </Link>
              ))
            ) : (
              <p className="text-sm leading-7 text-[var(--muted)]">No sponsored bills are currently available from the live feed.</p>
            )}
          </div>
        </article>

        <article className="rounded-[1.75rem] border border-[var(--border)] bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-3xl text-[var(--ink)]">Recent roll calls</h2>
            <span className="text-sm text-[var(--muted)]">{data.totalRecentVotes} checked</span>
          </div>
          <div className="mt-6 space-y-4">
            {data.recentVotes.length > 0 ? (
              data.recentVotes.map((vote) => (
                <Link
                  key={vote.slug}
                  href={`/votes/${vote.chamber}/${vote.congress}/${vote.session}/${vote.rollCallNumber}`}
                  className="block rounded-[1.25rem] border border-[var(--border)] px-4 py-4 transition hover:border-[var(--accent-blue)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-[var(--ink)]">{vote.title}</p>
                    <span className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">{vote.position.vote}</span>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{vote.result}</p>
                </Link>
              ))
            ) : (
              <p className="text-sm leading-7 text-[var(--muted)]">No recent roll-call votes were found for this member in the current cached window.</p>
            )}
          </div>
        </article>
      </section>
    </main>
  );
}
