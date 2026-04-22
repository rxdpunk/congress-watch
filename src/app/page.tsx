import Image from "next/image";
import Link from "next/link";

import { getAllMembers, getBills, getRecentVotes, getSiteOverview, getStates, type Vote } from "@/lib/congress-data";

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatLongDate(value: string | null) {
  if (!value) return "Unavailable";
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(parsed));
}

function formatCongressOrdinal(value: number) {
  const mod10 = value % 10;
  const mod100 = value % 100;
  if (mod10 === 1 && mod100 !== 11) return `${value}st`;
  if (mod10 === 2 && mod100 !== 12) return `${value}nd`;
  if (mod10 === 3 && mod100 !== 13) return `${value}rd`;
  return `${value}th`;
}

function StatCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: string;
}) {
  return (
    <article className="rounded-[1.1rem] border border-[var(--border)] bg-white px-4 py-4 shadow-[0_8px_22px_rgba(12,33,58,0.05)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-[var(--muted)]">{label}</p>
          <p className="mt-2 font-serif text-[2rem] leading-none text-[var(--ink)]">{value}</p>
          <p className="mt-2 text-xs leading-5 text-[var(--muted)]">{detail}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface)] text-xl text-[var(--navy)]">
          <span aria-hidden="true">{icon}</span>
        </div>
      </div>
    </article>
  );
}

function ChamberBreakdown({
  title,
  total,
  democrats,
  republicans,
  others,
  href,
}: {
  title: string;
  total: number;
  democrats: number;
  republicans: number;
  others: number;
  href: string;
}) {
  const totalForBar = Math.max(total, 1);
  const democratWidth = (democrats / totalForBar) * 100;
  const otherWidth = (others / totalForBar) * 100;
  const republicanWidth = (republicans / totalForBar) * 100;

  return (
    <article className="border-t border-[var(--border)] px-5 py-5 first:border-t-0">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ink)]">{title}</p>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div>
          <p className="font-serif text-[2.15rem] leading-none text-[var(--ink)]">{total}</p>
          <p className="mt-2 text-xs text-[var(--muted)]">Total Members</p>
        </div>
        <div>
          <p className="text-[2rem] font-semibold leading-none text-[var(--accent-blue)]">{democrats}</p>
          <p className="mt-2 text-xs text-[var(--muted)]">Democrats</p>
        </div>
        <div>
          <p className="text-[2rem] font-semibold leading-none text-[var(--accent-red)]">{republicans}</p>
          <p className="mt-2 text-xs text-[var(--muted)]">{others > 0 ? `Republicans · ${others} other` : "Republicans"}</p>
        </div>
      </div>
      <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-[var(--surface)]">
        <span className="bg-[var(--accent-blue)]" style={{ width: `${democratWidth}%` }} />
        {others > 0 ? <span className="bg-[#9aa6b4]" style={{ width: `${otherWidth}%` }} /> : null}
        <span className="bg-[var(--accent-red)]" style={{ width: `${republicanWidth}%` }} />
      </div>
      <Link href={href} className="mt-4 inline-flex items-center text-sm font-medium text-[var(--accent-blue)]">
        View all {title.toLowerCase()} →
      </Link>
    </article>
  );
}

function VoteTableRow({ vote }: { vote: Vote }) {
  return (
    <tr className="border-t border-[var(--border)]">
      <td className="px-4 py-3 align-top text-sm text-[var(--muted)]">{formatLongDate(vote.timestamp)}</td>
      <td className="px-4 py-3 align-top text-sm text-[var(--ink)]">
        <Link href={`/votes/${vote.chamber}/${vote.congress}/${vote.session}/${vote.rollCallNumber}`} className="font-medium text-[var(--ink)] hover:text-[var(--accent-blue)]">
          {vote.title}
        </Link>
        <p className="mt-1 max-w-[19rem] leading-6 text-[var(--muted)]">{vote.question}</p>
      </td>
      <td className="px-4 py-3 align-top text-sm text-[var(--accent-blue)]">{vote.yeaCount ?? "—"}</td>
      <td className="px-4 py-3 align-top text-sm text-[var(--accent-red)]">{vote.nayCount ?? "—"}</td>
      <td className="px-4 py-3 align-top text-sm text-[var(--muted)]">{vote.result}</td>
    </tr>
  );
}

export default async function HomePage() {
  const [overview, states, votes, bills, members] = await Promise.all([
    getSiteOverview(),
    getStates(),
    getRecentVotes(5),
    getBills(5),
    getAllMembers(),
  ]);

  const allMembers = overview.totalMembers;
  const houseMembers = overview.houseMembers;
  const senateMembers = overview.senateMembers;
  const houseDelegation = members.filter((member) => member.chamber === "house");
  const senateDelegation = members.filter((member) => member.chamber === "senate");
  const houseDemocrats = houseDelegation.filter((member) => member.partyCode === "D").length;
  const houseRepublicans = houseDelegation.filter((member) => member.partyCode === "R").length;
  const houseOthers = Math.max(houseDelegation.length - houseDemocrats - houseRepublicans, 0);
  const senateDemocrats = senateDelegation.filter((member) => member.partyCode === "D").length;
  const senateRepublicans = senateDelegation.filter((member) => member.partyCode === "R").length;
  const senateOthers = Math.max(senateDelegation.length - senateDemocrats - senateRepublicans, 0);

  return (
    <main className="mx-auto w-full max-w-[1280px] px-5 pb-14 pt-8 lg:px-8">
      <section className="overflow-hidden rounded-[1.7rem] border border-[var(--border)] bg-white shadow-[0_18px_48px_rgba(15,35,58,0.08)]">
        <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
          <div className="relative z-10 px-8 py-10 lg:px-10 lg:py-12">
            <h1 className="max-w-[12ch] font-serif text-[3.4rem] leading-[0.96] tracking-[-0.03em] text-[var(--navy)] lg:text-[4.1rem]">
              Congress deserves the same scrutiny as the presidency
            </h1>
            <div className="mt-6 h-[2px] w-16 bg-[var(--accent-red)]" />
            <p className="mt-6 max-w-[28rem] text-[1.05rem] leading-8 text-[var(--muted)]">
              Nonpartisan data on the people, votes, and legislation shaping our laws.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Link href="/house" className="button-primary px-5 py-3 text-sm font-semibold">
                Browse current members
              </Link>
              <Link href="/states" className="text-sm font-semibold text-[var(--accent-blue)]">
                By State →
              </Link>
              <Link href="/search" className="text-sm font-semibold text-[var(--accent-blue)]">
                By Party →
              </Link>
            </div>
          </div>
          <div className="relative min-h-[300px] overflow-hidden bg-[linear-gradient(180deg,rgba(236,243,250,0.85),rgba(247,244,238,0.3))]">
            <div className="absolute inset-y-0 left-0 z-10 w-28 bg-gradient-to-r from-white via-white/75 to-transparent" />
            <Image
              src="/reference-assets/capitol-west-front.jpg"
              alt="United States Capitol west front"
              fill
              priority
              className="object-cover object-center"
            />
          </div>
        </div>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-5">
        <StatCard
          label="Current Congress"
          value={`${formatCongressOrdinal(overview.currentCongress)} Congress`}
          detail="Jan 3, 2025 – Jan 3, 2027"
          icon="◌"
        />
        <StatCard
          label="Total Members"
          value={formatCompactNumber(allMembers)}
          detail={`${houseMembers} House · ${senateMembers} Senate`}
          icon="◍"
        />
        <StatCard
          label="States Covered"
          value={formatCompactNumber(overview.statesCount)}
          detail="All current delegations"
          icon="◔"
        />
        <StatCard
          label="Recent Roll Calls"
          value={formatCompactNumber(overview.recentVoteCount)}
          detail="Latest official vote records"
          icon="◷"
        />
        <StatCard
          label="Bills Tracked"
          value={formatCompactNumber(bills.length)}
          detail="Recent current-Congress legislation"
          icon="▣"
        />
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-[1.03fr_0.95fr_1.35fr]">
        <div className="overflow-hidden rounded-[1.1rem] border border-[var(--border)] bg-white shadow-[0_10px_28px_rgba(15,35,58,0.05)]">
          <div className="bg-[var(--navy)] px-5 py-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-white">Congress at a glance</h2>
          </div>
          <ChamberBreakdown
            title="U.S. House of Representatives"
            total={houseMembers}
            democrats={houseDemocrats}
            republicans={houseRepublicans}
            others={houseOthers}
            href="/house"
          />
          <ChamberBreakdown
            title="U.S. Senate"
            total={senateMembers}
            democrats={senateDemocrats}
            republicans={senateRepublicans}
            others={senateOthers}
            href="/senate"
          />
        </div>

        <div className="overflow-hidden rounded-[1.1rem] border border-[var(--border)] bg-white shadow-[0_10px_28px_rgba(15,35,58,0.05)]">
          <div className="border-b border-[var(--border)] px-5 py-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--navy)]">Browse by state</h2>
          </div>
          <div className="px-5 py-5">
            <div className="rounded-[1rem] bg-[var(--surface)] px-3 py-3">
              <Image
                src="/reference-assets/us-map.svg"
                alt="Map of the United States"
                width={640}
                height={396}
                className="h-auto w-full opacity-80"
              />
            </div>
            <form action="/states" className="mt-4">
              <select className="w-full rounded-[0.85rem] border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--muted)] outline-none">
                <option>Select a state</option>
                {states.map((state) => (
                  <option key={state.code}>{state.name}</option>
                ))}
              </select>
            </form>
          </div>
        </div>

        <div className="overflow-hidden rounded-[1.1rem] border border-[var(--border)] bg-white shadow-[0_10px_28px_rgba(15,35,58,0.05)]">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--navy)]">Recent roll call votes</h2>
            <Link href="/votes" className="text-sm font-medium text-[var(--accent-blue)]">
              View all votes →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="text-left">
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">Date</th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">Vote</th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">Yea</th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">Nay</th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">Result</th>
                </tr>
              </thead>
              <tbody>
                {votes.map((vote) => (
                  <VoteTableRow key={vote.slug} vote={vote} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-[1.1rem] border border-[var(--border)] bg-white px-5 py-4 shadow-[0_10px_28px_rgba(15,35,58,0.05)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[var(--navy)]">Find a member of Congress</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">Search by name, state, district, or zip code.</p>
          </div>
          <div className="text-xs text-[var(--muted)]">
            Data is sourced from official congressional records.
          </div>
        </div>
        <form action="/search" className="mt-4 grid gap-3 lg:grid-cols-[1.25fr_0.7fr_0.7fr_0.7fr_0.45fr]">
          <input
            type="search"
            name="q"
            placeholder="Search by name..."
            className="rounded-[0.9rem] border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent-blue)]"
          />
          <select className="rounded-[0.9rem] border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--muted)] outline-none">
            <option>All States</option>
            {states.map((state) => (
              <option key={state.code}>{state.name}</option>
            ))}
          </select>
          <select className="rounded-[0.9rem] border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--muted)] outline-none">
            <option>All Chambers</option>
            <option>House</option>
            <option>Senate</option>
          </select>
          <select className="rounded-[0.9rem] border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--muted)] outline-none">
            <option>All Parties</option>
            <option>Democrat</option>
            <option>Republican</option>
            <option>Independent</option>
          </select>
          <button className="button-primary px-5 py-3 text-sm font-semibold">Search</button>
        </form>
      </section>
    </main>
  );
}
