import Link from "next/link";

import { MemberCard } from "@/components/member-card";
import { MetricCard } from "@/components/metric-card";
import { getAllMembers, getBills, getRecentVotes, getSiteOverview, getStates } from "@/lib/congress-data";

export default async function HomePage() {
  const [overview, members, recentVotes, bills, states] = await Promise.all([
    getSiteOverview(),
    getAllMembers(),
    getRecentVotes(6),
    getBills(6),
    getStates(),
  ]);

  const houseMembers = members.filter((member) => member.chamber === "house");
  const senateMembers = members.filter((member) => member.chamber === "senate");
  const houseDemocrats = houseMembers.filter((member) => member.partyCode === "D").length;
  const houseRepublicans = houseMembers.filter((member) => member.partyCode === "R").length;
  const senateDemocrats = senateMembers.filter((member) => member.partyCode === "D").length;
  const senateRepublicans = senateMembers.filter((member) => member.partyCode === "R").length;

  return (
    <main className="pb-20">
      <section className="border-b border-[var(--border)] bg-[linear-gradient(180deg,_rgba(255,255,255,0.84),_rgba(247,244,238,0.94))]">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-16">
          <div>
            <div className="inline-flex rounded-full border border-[var(--border)] bg-white px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              119th Congress · Current members only
            </div>
            <h1 className="mt-6 max-w-4xl font-serif text-5xl leading-[1.02] text-[var(--ink)] sm:text-6xl">
              Congress deserves the same scrutiny as the presidency.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              Source-linked data on the people, votes, committees, and legislation shaping federal law. Built to help the public see what current members of Congress are actually doing.
            </p>
            <form action="/search" className="mt-8 flex flex-col gap-3 rounded-[1.5rem] border border-[var(--border)] bg-white p-4 shadow-[0_18px_48px_rgba(12,33,58,0.06)] sm:flex-row">
              <input
                type="search"
                name="q"
                placeholder="Search by member name or state"
                className="w-full rounded-full border border-[var(--border)] px-4 py-3 outline-none focus:border-[var(--accent-blue)]"
              />
              <button className="rounded-full bg-[var(--navy)] px-6 py-3 text-sm font-semibold text-white">Search</button>
            </form>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/states" className="rounded-full bg-[var(--navy)] px-5 py-3 text-sm font-semibold text-white">
                Browse by state
              </Link>
              <Link href="/votes" className="rounded-full border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--ink)]">
                See latest votes
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[var(--border)] bg-white p-6 shadow-[0_20px_60px_rgba(12,33,58,0.08)]">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold tracking-[0.08em] text-[var(--navy)]">Congress at a glance</p>
              <Link href="/states" className="text-sm text-[var(--accent-blue)]">
                Browse all states
              </Link>
            </div>
            <div className="mt-6 space-y-5">
              <article className="rounded-[1.25rem] bg-[var(--surface)] p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">U.S. House of Representatives</p>
                <div className="mt-3 grid grid-cols-3 gap-4">
                  <div>
                    <p className="font-serif text-4xl text-[var(--ink)]">{overview.houseMembers}</p>
                    <p className="text-xs text-[var(--muted)]">Voting members</p>
                  </div>
                  <div>
                    <p className="text-3xl font-semibold text-[var(--accent-blue)]">{houseDemocrats}</p>
                    <p className="text-xs text-[var(--muted)]">Democrats</p>
                  </div>
                  <div>
                    <p className="text-3xl font-semibold text-[var(--accent-red)]">{houseRepublicans}</p>
                    <p className="text-xs text-[var(--muted)]">Republicans</p>
                  </div>
                </div>
              </article>
              <article className="rounded-[1.25rem] bg-[var(--surface)] p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">U.S. Senate</p>
                <div className="mt-3 grid grid-cols-3 gap-4">
                  <div>
                    <p className="font-serif text-4xl text-[var(--ink)]">{overview.senateMembers}</p>
                    <p className="text-xs text-[var(--muted)]">Senators</p>
                  </div>
                  <div>
                    <p className="text-3xl font-semibold text-[var(--accent-blue)]">{senateDemocrats}</p>
                    <p className="text-xs text-[var(--muted)]">Democrats</p>
                  </div>
                  <div>
                    <p className="text-3xl font-semibold text-[var(--accent-red)]">{senateRepublicans}</p>
                    <p className="text-xs text-[var(--muted)]">Republicans</p>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-4 px-5 py-10 lg:grid-cols-5 lg:px-8">
        <MetricCard label="Current Congress" value={`${overview.currentCongress}th`} detail="Official roster data" />
        <MetricCard label="Total members" value={String(overview.totalMembers)} detail="House and Senate combined" />
        <MetricCard label="States covered" value={String(overview.statesCount)} detail="All 50 states" />
        <MetricCard label="Recent roll calls" value={String(overview.recentVoteCount)} detail="Latest imported votes" />
        <MetricCard label="Recent missed votes" value={String(overview.missedVoteCount)} detail="From latest roll-call records" />
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div className="rounded-[1.75rem] border border-[var(--border)] bg-white p-6 shadow-[0_18px_50px_rgba(12,33,58,0.05)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--muted)]">Browse by state</p>
              <h2 className="mt-3 font-serif text-3xl text-[var(--ink)]">Start with your delegation.</h2>
            </div>
            <Link href="/states" className="text-sm text-[var(--accent-blue)]">
              View all
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {states.slice(0, 12).map((state) => (
              <Link key={state.code} href={`/states/${state.slug}`} className="rounded-[1.25rem] border border-[var(--border)] bg-[var(--surface)] px-4 py-4 transition hover:border-[var(--accent-blue)]">
                <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">{state.code}</p>
                <p className="mt-2 font-medium text-[var(--ink)]">{state.name}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-[var(--border)] bg-white p-6 shadow-[0_18px_50px_rgba(12,33,58,0.05)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--muted)]">Recent roll-call votes</p>
              <h2 className="mt-3 font-serif text-3xl text-[var(--ink)]">Latest recorded action</h2>
            </div>
            <Link href="/votes" className="text-sm text-[var(--accent-blue)]">
              All votes
            </Link>
          </div>
          <div className="mt-6 space-y-4">
            {recentVotes.map((vote) => (
              <Link
                key={vote.slug}
                href={`/votes/${vote.chamber}/${vote.congress}/${vote.session}/${vote.rollCallNumber}`}
                className="block rounded-[1.25rem] border border-[var(--border)] px-4 py-4 transition hover:border-[var(--accent-blue)]"
              >
                <div className="flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
                  <span>{vote.chamber}</span>
                  <span>Roll {vote.rollCallNumber}</span>
                </div>
                <h3 className="mt-3 text-base font-semibold leading-7 text-[var(--ink)]">{vote.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{vote.result}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-8 lg:grid-cols-[1fr_1fr] lg:px-8">
        <div className="rounded-[1.75rem] border border-[var(--border)] bg-white p-6 shadow-[0_18px_50px_rgba(12,33,58,0.05)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--muted)]">Member profiles</p>
              <h2 className="mt-3 font-serif text-3xl text-[var(--ink)]">Current members, one factual record each.</h2>
            </div>
            <Link href="/house" className="text-sm text-[var(--accent-blue)]">
              Browse members
            </Link>
          </div>
          <div className="mt-6 grid gap-5 xl:grid-cols-2">
            {members.slice(0, 4).map((member) => (
              <MemberCard key={member.bioguideId} member={member} />
            ))}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-[var(--border)] bg-white p-6 shadow-[0_18px_50px_rgba(12,33,58,0.05)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--muted)]">Tracked legislation</p>
              <h2 className="mt-3 font-serif text-3xl text-[var(--ink)]">Recent bills from the current Congress</h2>
            </div>
            <Link href="/bills" className="text-sm text-[var(--accent-blue)]">
              All bills
            </Link>
          </div>
          <div className="mt-6 space-y-4">
            {bills.map((bill) => (
              <Link
                key={`${bill.billType}-${bill.billNumber}`}
                href={`/bills/${bill.congress}/${bill.billType}/${bill.billNumber}`}
                className="block rounded-[1.25rem] border border-[var(--border)] px-4 py-4 transition hover:border-[var(--accent-blue)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[var(--ink)]">{bill.idLabel}</p>
                  <span className="text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">{bill.originChamber ?? "Congress"}</span>
                </div>
                <p className="mt-2 text-base leading-7 text-[var(--ink)]">{bill.title}</p>
                {bill.latestActionText ? <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{bill.latestActionText}</p> : null}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
