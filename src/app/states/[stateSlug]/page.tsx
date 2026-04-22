import Link from "next/link";
import { notFound } from "next/navigation";

import { getStateOverview, type Member, type Vote } from "@/lib/congress-data";

const VIEW_OPTIONS = [
  { slug: "overview", label: "Overview" },
  { slug: "all", label: "All Members" },
  { slug: "house", label: "House" },
  { slug: "senate", label: "Senate" },
] as const;

function buildStateViewHref(stateSlug: string, view: string) {
  if (view === "overview") {
    return `/states/${stateSlug}`;
  }
  return `/states/${stateSlug}?view=${view}`;
}

function formatVoteDate(value: string) {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(parsed));
}

function buildMemberSubtitle(member: Member) {
  if (member.chamber === "house") {
    return `${member.partyCode} · ${member.stateName} ${member.districtLabel ?? "At-Large District"}`;
  }
  return `${member.partyCode} · ${member.stateName}`;
}

function getPartyTone(partyCode: string) {
  if (partyCode === "R") {
    return "bg-[rgba(176,48,53,0.12)] text-[var(--accent-red)]";
  }
  if (partyCode === "D") {
    return "bg-[rgba(36,82,164,0.12)] text-[var(--accent-blue)]";
  }
  return "bg-[rgba(12,33,58,0.08)] text-[var(--ink)]";
}

function getResultTone(result: string) {
  const normalized = result.toLowerCase();
  if (normalized.includes("pass") || normalized.includes("agreed") || normalized.includes("confirmed")) {
    return "text-[#2d6a4f]";
  }
  if (normalized.includes("fail") || normalized.includes("rejected")) {
    return "text-[var(--accent-red)]";
  }
  return "text-[var(--muted)]";
}

function getDelegationBreakdown(members: Member[]) {
  const democrats = members.filter((member) => member.partyCode === "D").length;
  const republicans = members.filter((member) => member.partyCode === "R").length;
  const independents = members.filter((member) => member.partyCode === "I").length;
  return {
    total: members.length,
    democrats,
    republicans,
    independents,
  };
}

function DelegationCard({
  title,
  detail,
  members,
}: {
  title: string;
  detail: string;
  members: Member[];
}) {
  const breakdown = getDelegationBreakdown(members);
  const dots = [
    ...Array.from({ length: breakdown.democrats }, (_, index) => ({
      key: `d-${index}`,
      className: "bg-[var(--accent-blue)]",
    })),
    ...Array.from({ length: breakdown.republicans }, (_, index) => ({
      key: `r-${index}`,
      className: "bg-[var(--accent-red)]",
    })),
    ...Array.from({ length: breakdown.independents }, (_, index) => ({
      key: `i-${index}`,
      className: "bg-[#7b8796]",
    })),
  ];

  return (
    <article className="rounded-[1.2rem] border border-[rgba(19,52,92,0.1)] bg-white p-5 shadow-[0_8px_24px_rgba(15,38,68,0.045)]">
      <p className="text-[0.88rem] font-medium text-[var(--ink)]">{title}</p>
      <p className="mt-1 text-sm text-[var(--muted)]">{detail}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {dots.length > 0 ? (
          dots.map((dot) => (
            <span
              key={dot.key}
              className={`h-3.5 w-3.5 rounded-full ${dot.className}`}
              aria-hidden="true"
            />
          ))
        ) : (
          <span className="text-sm text-[var(--muted)]">No current members available.</span>
        )}
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
        <div>
          <p className="font-semibold text-[var(--accent-blue)]">{breakdown.democrats}</p>
          <p className="mt-1 text-[var(--muted)]">Democrat</p>
        </div>
        <div>
          <p className="font-semibold text-[var(--accent-red)]">{breakdown.republicans}</p>
          <p className="mt-1 text-[var(--muted)]">Republican</p>
        </div>
        <div>
          <p className="font-semibold text-[var(--ink)]">{breakdown.independents}</p>
          <p className="mt-1 text-[var(--muted)]">Independent</p>
        </div>
      </div>
    </article>
  );
}

function MemberListItem({ member }: { member: Member }) {
  return (
    <Link
      href={`/members/${member.slug}`}
      className="flex items-center justify-between gap-4 rounded-[1.15rem] border border-[rgba(19,52,92,0.1)] bg-white px-4 py-4 transition hover:border-[rgba(19,52,92,0.2)] hover:bg-[rgba(244,248,252,0.9)]"
    >
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(180deg,rgba(248,250,253,1),rgba(232,238,247,1))] text-base font-semibold text-[var(--navy)]">
          {member.firstName[0]}
          {member.lastName[0]}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[1.05rem] font-medium text-[var(--ink)]">{member.fullName}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">{buildMemberSubtitle(member)}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">{member.roleLabel}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-4">
        <span className={`rounded-full px-3 py-1 text-sm font-medium ${getPartyTone(member.partyCode)}`}>
          {member.partyName}
        </span>
        <span className="text-[1.2rem] text-[var(--muted)]" aria-hidden="true">
          ›
        </span>
      </div>
    </Link>
  );
}

function VoteListItem({ vote }: { vote: Vote & { delegationBreakdown: Vote["positions"] } }) {
  return (
    <Link
      href={`/votes/${vote.chamber}/${vote.congress}/${vote.session}/${vote.rollCallNumber}`}
      className="block rounded-[1.15rem] border border-[rgba(19,52,92,0.1)] bg-white px-4 py-4 transition hover:border-[rgba(19,52,92,0.2)] hover:bg-[rgba(244,248,252,0.9)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-[1rem] font-medium text-[var(--ink)]">{vote.title}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {vote.chamber === "house" ? "House Vote" : "Senate Vote"} · {formatVoteDate(vote.timestamp)}
          </p>
        </div>
        <p className={`shrink-0 text-sm font-medium ${getResultTone(vote.result)}`}>{vote.result}</p>
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--muted)]">{vote.question}</p>
      <p className="mt-3 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
        Delegation votes: {vote.delegationBreakdown.slice(0, 4).map((position) => position.vote).join(" · ")}
      </p>
    </Link>
  );
}

function SectionHeader({
  title,
  count,
  href,
}: {
  title: string;
  count: number;
  href?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="font-serif text-[2rem] leading-none text-[var(--navy)]">{title}</h2>
      <div className="flex items-center gap-4">
        <span className="text-sm text-[var(--muted)]">{count} total</span>
        {href ? (
          <Link href={href} className="text-sm font-medium text-[var(--accent-blue)]">
            View all
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export default async function StateDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ stateSlug: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const [{ stateSlug }, { view = "overview" }] = await Promise.all([params, searchParams]);
  const data = await getStateOverview(stateSlug);

  if (!data) {
    notFound();
  }

  const activeView = VIEW_OPTIONS.some((option) => option.slug === view) ? view : "overview";
  const allMembers = data.members.slice().sort((left, right) => left.sortName.localeCompare(right.sortName));
  const houseMembers = data.houseMembers.slice().sort((left, right) => left.sortName.localeCompare(right.sortName));
  const senateMembers = data.senateMembers.slice().sort((left, right) => left.sortName.localeCompare(right.sortName));
  const visibleMembers =
    activeView === "house" ? houseMembers : activeView === "senate" ? senateMembers : allMembers;

  return (
    <main className="mx-auto w-full max-w-[1280px] px-5 pb-14 pt-8 lg:px-8">
      <section className="rounded-[1.7rem] border border-[var(--border)] bg-white px-6 py-6 shadow-[0_18px_48px_rgba(15,35,58,0.08)] lg:px-8">
        <Link href="/states" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--accent-blue)]">
          <span aria-hidden="true">‹</span>
          Browse by State
        </Link>

        <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[0.84rem] uppercase tracking-[0.16em] text-[var(--muted)]">{data.code}</p>
            <h1 className="mt-2 font-serif text-[2.8rem] leading-[0.98] text-[var(--navy)]">{data.state}</h1>
            <p className="mt-2 text-[1rem] text-[var(--muted)]">Current Congress</p>
          </div>
          <nav className="grid grid-cols-2 overflow-hidden rounded-[1rem] border border-[rgba(19,52,92,0.12)] bg-white sm:grid-cols-4">
            {VIEW_OPTIONS.map((option) => {
              const isActive = option.slug === activeView;
              return (
                <Link
                  key={option.slug}
                  href={buildStateViewHref(data.slug, option.slug)}
                  className={`px-4 py-3 text-center text-sm font-medium transition ${
                    isActive
                      ? "bg-[var(--navy)] text-white"
                      : "text-[var(--ink)] hover:bg-[rgba(19,52,92,0.05)]"
                  }`}
                >
                  {option.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </section>

      {activeView === "overview" ? (
        <>
          <section className="mt-5 grid gap-5 xl:grid-cols-[1.18fr_0.82fr]">
            <article className="rounded-[1.5rem] border border-[var(--border)] bg-white p-5 shadow-[0_10px_28px_rgba(15,35,58,0.05)] sm:p-6">
              <h2 className="font-serif text-[2rem] leading-none text-[var(--navy)]">Party Breakdown</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <DelegationCard
                  title="House Delegation"
                  detail={`${houseMembers.length} Members`}
                  members={houseMembers}
                />
                <DelegationCard
                  title="Senate Delegation"
                  detail={`${senateMembers.length} Members`}
                  members={senateMembers}
                />
              </div>

              <div className="mt-4 rounded-[1.2rem] border border-[rgba(19,52,92,0.1)] bg-[linear-gradient(180deg,rgba(250,252,255,0.96),rgba(244,248,252,0.92))] px-5 py-5">
                <div className="flex flex-wrap items-center gap-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--navy)] text-xl text-white">
                    ⌂
                  </div>
                  <div>
                    <p className="text-[0.8rem] uppercase tracking-[0.16em] text-[var(--muted)]">Total Delegation</p>
                    <p className="mt-1 font-serif text-[2.4rem] leading-none text-[var(--ink)]">{allMembers.length}</p>
                  </div>
                  <div className="h-10 w-px bg-[rgba(19,52,92,0.1)]" />
                  <div className="grid grid-cols-2 gap-5 text-sm text-[var(--muted)] sm:grid-cols-3">
                    <div>
                      <p className="text-[1.3rem] font-semibold text-[var(--ink)]">{houseMembers.length}</p>
                      <p>House</p>
                    </div>
                    <div>
                      <p className="text-[1.3rem] font-semibold text-[var(--ink)]">{senateMembers.length}</p>
                      <p>Senate</p>
                    </div>
                    <div>
                      <p className="text-[1.3rem] font-semibold text-[var(--ink)]">
                        {(data.partyBreakdown.D ?? 0) + (data.partyBreakdown.R ?? 0) + (data.partyBreakdown.I ?? 0)}
                      </p>
                      <p>Voting Members</p>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <aside className="rounded-[1.5rem] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(247,250,254,1),rgba(238,244,251,0.92))] p-5 shadow-[0_10px_28px_rgba(15,35,58,0.05)] sm:p-6">
              <div className="rounded-[1.2rem] bg-white/70 px-4 py-4">
                <p className="text-[0.8rem] uppercase tracking-[0.16em] text-[var(--muted)]">About {data.state}</p>
                <p className="mt-4 text-[1rem] leading-8 text-[var(--ink)]">
                  {data.state} is represented by {houseMembers.length} voting members in the House of Representatives and {senateMembers.length} senators in the U.S. Senate.
                </p>
              </div>
              <div className="mt-4 grid gap-3">
                <div className="rounded-[1.1rem] border border-[rgba(19,52,92,0.08)] bg-white px-4 py-4">
                  <p className="text-[0.78rem] uppercase tracking-[0.16em] text-[var(--muted)]">Most Recent View</p>
                  <p className="mt-2 text-sm leading-7 text-[var(--ink)]">Use the member tabs to move between the full delegation, House seats, and senators with the same card language as the mobile reference.</p>
                </div>
                <div className="rounded-[1.1rem] border border-[rgba(19,52,92,0.08)] bg-white px-4 py-4">
                  <p className="text-[0.78rem] uppercase tracking-[0.16em] text-[var(--muted)]">Official Scope</p>
                  <p className="mt-2 text-sm leading-7 text-[var(--ink)]">These listings are built from current official House and Senate rosters plus recent roll-call records tied back to this delegation.</p>
                </div>
              </div>
            </aside>
          </section>

          <section className="mt-5 grid gap-5 xl:grid-cols-[1.06fr_0.94fr]">
            <article className="rounded-[1.5rem] border border-[var(--border)] bg-white p-5 shadow-[0_10px_28px_rgba(15,35,58,0.05)] sm:p-6">
              <SectionHeader title="Current Members" count={allMembers.length} href={buildStateViewHref(data.slug, "all")} />
              <div className="mt-5 space-y-3">
                {allMembers.slice(0, 4).map((member) => (
                  <MemberListItem key={member.bioguideId} member={member} />
                ))}
              </div>
            </article>

            <article className="rounded-[1.5rem] border border-[var(--border)] bg-white p-5 shadow-[0_10px_28px_rgba(15,35,58,0.05)] sm:p-6">
              <SectionHeader title="Recent Votes" count={data.relatedVotes.length} />
              <div className="mt-5 space-y-3">
                {data.relatedVotes.length > 0 ? (
                  data.relatedVotes.slice(0, 4).map((vote) => <VoteListItem key={vote.slug} vote={vote} />)
                ) : (
                  <div className="rounded-[1.1rem] border border-dashed border-[rgba(19,52,92,0.18)] px-4 py-6 text-sm leading-7 text-[var(--muted)]">
                    No recent roll-call vote breakdown was available for this delegation in the current cached window.
                  </div>
                )}
              </div>
            </article>
          </section>
        </>
      ) : activeView === "all" ? (
        <section className="mt-5 grid gap-5 xl:grid-cols-[1.06fr_0.94fr]">
          <article className="space-y-5">
            <section className="rounded-[1.5rem] border border-[var(--border)] bg-white p-5 shadow-[0_10px_28px_rgba(15,35,58,0.05)] sm:p-6">
              <SectionHeader title="House Members" count={houseMembers.length} href={buildStateViewHref(data.slug, "house")} />
              <div className="mt-5 space-y-3">
                {houseMembers.map((member) => (
                  <MemberListItem key={member.bioguideId} member={member} />
                ))}
              </div>
            </section>

            <section className="rounded-[1.5rem] border border-[var(--border)] bg-white p-5 shadow-[0_10px_28px_rgba(15,35,58,0.05)] sm:p-6">
              <SectionHeader title="Senators" count={senateMembers.length} href={buildStateViewHref(data.slug, "senate")} />
              <div className="mt-5 space-y-3">
                {senateMembers.map((member) => (
                  <MemberListItem key={member.bioguideId} member={member} />
                ))}
              </div>
            </section>
          </article>

          <article className="rounded-[1.5rem] border border-[var(--border)] bg-white p-5 shadow-[0_10px_28px_rgba(15,35,58,0.05)] sm:p-6">
            <SectionHeader title="Recent Votes" count={data.relatedVotes.length} />
            <div className="mt-5 space-y-3">
              {data.relatedVotes.length > 0 ? (
                data.relatedVotes.slice(0, 6).map((vote) => <VoteListItem key={vote.slug} vote={vote} />)
              ) : (
                <div className="rounded-[1.1rem] border border-dashed border-[rgba(19,52,92,0.18)] px-4 py-6 text-sm leading-7 text-[var(--muted)]">
                  No recent roll-call vote breakdown was available for this delegation in the current cached window.
                </div>
              )}
            </div>
          </article>
        </section>
      ) : (
        <section className="mt-5 grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
          <article className="rounded-[1.5rem] border border-[var(--border)] bg-white p-5 shadow-[0_10px_28px_rgba(15,35,58,0.05)] sm:p-6">
            <SectionHeader
              title={activeView === "house" ? "House Members" : "Senators"}
              count={visibleMembers.length}
            />
            <div className="mt-5 space-y-3">
              {visibleMembers.map((member) => (
                <MemberListItem key={member.bioguideId} member={member} />
              ))}
            </div>
          </article>

          <aside className="space-y-5">
            <article className="rounded-[1.5rem] border border-[var(--border)] bg-white p-5 shadow-[0_10px_28px_rgba(15,35,58,0.05)] sm:p-6">
              <SectionHeader title="Recent Votes" count={data.relatedVotes.length} />
              <div className="mt-5 space-y-3">
                {data.relatedVotes.length > 0 ? (
                  data.relatedVotes.slice(0, 5).map((vote) => <VoteListItem key={vote.slug} vote={vote} />)
                ) : (
                  <div className="rounded-[1.1rem] border border-dashed border-[rgba(19,52,92,0.18)] px-4 py-6 text-sm leading-7 text-[var(--muted)]">
                    No recent roll-call vote breakdown was available for this delegation in the current cached window.
                  </div>
                )}
              </div>
            </article>

            <article className="rounded-[1.5rem] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(247,250,254,1),rgba(238,244,251,0.92))] p-5 shadow-[0_10px_28px_rgba(15,35,58,0.05)] sm:p-6">
              <p className="text-[0.8rem] uppercase tracking-[0.16em] text-[var(--muted)]">Delegation Snapshot</p>
              <p className="mt-3 text-sm leading-7 text-[var(--ink)]">
                {data.state} currently has {houseMembers.length} House members and {senateMembers.length} senators in active service.
              </p>
              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div className="rounded-[1rem] border border-[rgba(19,52,92,0.08)] bg-white px-3 py-3">
                  <p className="font-semibold text-[var(--accent-blue)]">{data.partyBreakdown.D ?? 0}</p>
                  <p className="mt-1 text-[var(--muted)]">D</p>
                </div>
                <div className="rounded-[1rem] border border-[rgba(19,52,92,0.08)] bg-white px-3 py-3">
                  <p className="font-semibold text-[var(--accent-red)]">{data.partyBreakdown.R ?? 0}</p>
                  <p className="mt-1 text-[var(--muted)]">R</p>
                </div>
                <div className="rounded-[1rem] border border-[rgba(19,52,92,0.08)] bg-white px-3 py-3">
                  <p className="font-semibold text-[var(--ink)]">{data.partyBreakdown.I ?? 0}</p>
                  <p className="mt-1 text-[var(--muted)]">I</p>
                </div>
              </div>
            </article>
          </aside>
        </section>
      )}
    </main>
  );
}
