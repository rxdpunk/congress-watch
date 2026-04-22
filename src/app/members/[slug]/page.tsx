import Link from "next/link";
import { notFound } from "next/navigation";

import { formatDisplayDate, formatPercent, getMemberPageData } from "@/lib/congress-data";

function getPartyClasses(partyCode: "D" | "R" | "I") {
  if (partyCode === "R") {
    return "bg-[rgba(176,48,53,0.1)] text-[var(--accent-red)]";
  }

  if (partyCode === "D") {
    return "bg-[rgba(39,93,181,0.1)] text-[var(--accent-blue)]";
  }

  return "bg-[rgba(12,33,58,0.08)] text-[var(--ink)]";
}

function getDaysLeft(value: string | null) {
  if (!value) return null;
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return null;
  return Math.max(0, Math.ceil((parsed - Date.now()) / (1000 * 60 * 60 * 24)));
}

function getTermProgress(start: string | null, end: string | null) {
  if (!start || !end) return null;

  const startTime = Date.parse(start);
  const endTime = Date.parse(end);

  if (Number.isNaN(startTime) || Number.isNaN(endTime) || endTime <= startTime) {
    return null;
  }

  const now = Date.now();
  const raw = ((now - startTime) / (endTime - startTime)) * 100;
  return Math.max(0, Math.min(100, raw));
}

function formatCount(value: number | null) {
  if (value == null) return "Unavailable";
  return new Intl.NumberFormat("en-US").format(value);
}

function getVoteResultClasses(result: string) {
  if (/fail/i.test(result)) {
    return "text-[var(--accent-red)]";
  }

  if (/pass|agreed|confirmed/i.test(result)) {
    return "text-[var(--accent-blue)]";
  }

  return "text-[var(--ink)]";
}

function getVotePositionClasses(vote: string) {
  if (/nay|no/i.test(vote)) {
    return "text-[var(--accent-red)]";
  }

  if (/yea|aye|yes/i.test(vote)) {
    return "text-[var(--accent-blue)]";
  }

  if (/not voting/i.test(vote)) {
    return "text-[var(--muted)]";
  }

  return "text-[var(--ink)]";
}

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

  const termProgress = getTermProgress(data.member.termStartDate, data.member.termEndDate);
  const daysLeft = getDaysLeft(data.member.termEndDate);
  const totalVotes = data.totalRecentVotes;
  const participationRate = data.participationRate ?? 0;
  const missedVoteRate = totalVotes > 0 ? (data.missedVotes / totalVotes) * 100 : 0;
  const memberInitials = `${data.member.firstName[0] ?? ""}${data.member.lastName[0] ?? ""}`;
  const districtDescriptor =
    data.member.chamber === "house"
      ? `${data.member.stateName}${data.member.districtLabel ? ` - ${data.member.districtLabel}` : ""}`
      : `${data.member.stateName} - United States Senate`;

  const officeLine = [data.member.officeAddress, data.member.officePhone].filter(Boolean).join("  •  ");

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 lg:px-8 lg:py-10">
      <nav className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted)]">
        <Link href="/" className="transition hover:text-[var(--accent-blue)]">
          Home
        </Link>
        <span>›</span>
        <Link href={data.member.chamber === "house" ? "/house" : "/senate"} className="transition hover:text-[var(--accent-blue)]">
          {data.member.chamber === "house" ? "House" : "Senate"}
        </Link>
        <span>›</span>
        <span className="text-[var(--ink)]">{data.member.fullName}</span>
      </nav>

      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.78rem] uppercase tracking-[0.22em] text-[var(--muted)]">Member Profile</p>
          <h1 className="mt-2 font-serif text-4xl text-[var(--ink)] sm:text-5xl">{data.member.fullName}</h1>
        </div>
        <div className="hidden text-sm text-[var(--muted)] lg:block">
          <a
            href={data.member.officialWebsiteUrl ?? undefined}
            target="_blank"
            rel="noreferrer"
            className={data.member.officialWebsiteUrl ? "transition hover:text-[var(--accent-blue)]" : "pointer-events-none opacity-0"}
          >
            Official website
          </a>
        </div>
      </div>

      <section className="mt-7 grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,0.72fr)_minmax(0,0.62fr)]">
        <article className="rounded-[1.5rem] border border-[rgba(19,52,92,0.12)] bg-white p-6 shadow-[0_18px_50px_rgba(12,33,58,0.055)]">
          <div className="flex flex-col gap-6 md:flex-row">
            <div className="w-full max-w-[10rem] shrink-0">
              <div className="overflow-hidden rounded-[1rem] border border-[rgba(19,52,92,0.12)] bg-[linear-gradient(180deg,#eef3f9,#dbe6f4)]">
                {data.imageUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={data.imageUrl}
                      alt={`Official portrait of ${data.member.fullName}`}
                      className="h-64 w-full object-cover"
                    />
                  </>
                ) : (
                  <div className="flex h-64 items-center justify-center font-serif text-5xl text-[var(--navy)]">{memberInitials}</div>
                )}
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-serif text-3xl leading-tight text-[var(--ink)]">{data.member.fullName}</h2>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getPartyClasses(data.member.partyCode)}`}>
                  {data.member.partyName}
                </span>
              </div>

              <p className="mt-2 text-lg text-[var(--muted)]">{data.member.roleLabel}</p>

              <div className="mt-5 space-y-3 text-[0.98rem] text-[var(--ink)]">
                <p>{districtDescriptor}</p>
                <p>{data.member.chamber === "house" ? "House of Representatives" : "United States Senate"}</p>
                {officeLine ? <p className="text-[var(--muted)]">{officeLine}</p> : null}
                {data.member.officialWebsiteUrl ? (
                  <p>
                    <a
                      href={data.member.officialWebsiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--accent-blue)] underline decoration-[rgba(39,93,181,0.28)] underline-offset-4"
                    >
                      Visit official website
                    </a>
                  </p>
                ) : null}
              </div>

              <div className="mt-6 grid gap-4 border-t border-[rgba(19,52,92,0.1)] pt-5 sm:grid-cols-2 xl:grid-cols-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Serving Since</p>
                  <p className="mt-2 text-lg font-semibold text-[var(--ink)]">{formatDisplayDate(data.serviceSince)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Current Term Ends</p>
                  <p className="mt-2 text-lg font-semibold text-[var(--ink)]">{formatDisplayDate(data.member.termEndDate)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Sponsored Bills</p>
                  <p className="mt-2 text-lg font-semibold text-[var(--ink)]">{formatCount(data.sponsoredBills.length)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Recent Votes Tracked</p>
                  <p className="mt-2 text-lg font-semibold text-[var(--ink)]">{formatCount(totalVotes)}</p>
                </div>
              </div>
            </div>
          </div>
        </article>

        <aside className="rounded-[1.5rem] border border-[rgba(19,52,92,0.12)] bg-white p-6 shadow-[0_18px_50px_rgba(12,33,58,0.055)]">
          <p className="text-[0.78rem] uppercase tracking-[0.22em] text-[var(--muted)]">Current Term</p>
          <p className="mt-3 text-lg text-[var(--ink)]">
            {data.member.chamber === "house" ? "House term" : "Senate term"}  •  Ends {formatDisplayDate(data.member.termEndDate)}
          </p>
          <div className="mt-7 flex items-center gap-5">
            <div
              className="flex h-32 w-32 items-center justify-center rounded-full border border-[rgba(19,52,92,0.12)]"
              style={{
                background:
                  termProgress == null
                    ? "linear-gradient(180deg, rgba(244,247,252,1), rgba(238,243,249,1))"
                    : `conic-gradient(var(--accent-blue) ${termProgress}%, rgba(228,235,245,1) ${termProgress}% 100%)`,
              }}
            >
              <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white text-center">
                <span className="font-serif text-3xl text-[var(--ink)]">
                  {termProgress == null ? "—" : `${Math.round(termProgress)}%`}
                </span>
                <span className="mt-1 text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Complete</span>
              </div>
            </div>
            <div className="min-w-0">
              <p className="font-serif text-4xl text-[var(--ink)]">{daysLeft == null ? "—" : formatCount(daysLeft)}</p>
              <p className="mt-2 text-sm text-[var(--muted)]">Days left in current term</p>
              <p className="mt-3 text-sm text-[var(--muted)]">Started {formatDisplayDate(data.member.termStartDate)}</p>
            </div>
          </div>
        </aside>

        <aside className="rounded-[1.5rem] border border-[rgba(19,52,92,0.12)] bg-[linear-gradient(180deg,#f6f9fd,#eef3f9)] p-6 shadow-[0_18px_50px_rgba(12,33,58,0.045)]">
          <div className="flex h-32 items-center justify-center rounded-[1rem] border border-[rgba(19,52,92,0.08)] bg-white">
            <div className="text-center">
              <p className="text-[0.78rem] uppercase tracking-[0.2em] text-[var(--muted)]">{data.member.stateCode}</p>
              <p className="mt-2 font-serif text-4xl text-[var(--navy)]">
                {data.member.chamber === "house" ? data.member.district ?? "AL" : "US"}
              </p>
            </div>
          </div>
          <p className="mt-5 text-lg font-semibold text-[var(--ink)]">{districtDescriptor}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Browse the current delegation, compare members in the state, and move into chamber and vote pages from the same geographic context.
          </p>
          <Link href={`/states/${data.member.stateSlug}`} className="mt-5 inline-flex items-center text-sm font-semibold text-[var(--accent-blue)]">
            View state profile
          </Link>
        </aside>
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-4">
        <article className="rounded-[1.35rem] border border-[rgba(19,52,92,0.12)] bg-white p-5 shadow-[0_14px_36px_rgba(12,33,58,0.045)]">
          <p className="font-serif text-3xl text-[var(--accent-blue)]">{formatPercent(data.participationRate)}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">% votes cast in recent window</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--surface)]">
            <div className="h-full rounded-full bg-[var(--accent-blue)]" style={{ width: `${participationRate}%` }} />
          </div>
          <p className="mt-3 text-sm text-[var(--muted)]">Based on {formatCount(totalVotes)} recent roll calls found in live sources.</p>
        </article>

        <article className="rounded-[1.35rem] border border-[rgba(19,52,92,0.12)] bg-white p-5 shadow-[0_14px_36px_rgba(12,33,58,0.045)]">
          <p className="font-serif text-3xl text-[var(--accent-red)]">{formatCount(data.missedVotes)}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">Missed votes in recent window</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--surface)]">
            <div className="h-full rounded-full bg-[var(--accent-red)]" style={{ width: `${missedVoteRate}%` }} />
          </div>
          <p className="mt-3 text-sm text-[var(--muted)]">
            {totalVotes > 0 ? `${Math.round(missedVoteRate * 10) / 10}% of tracked roll calls.` : "No recent vote window available."}
          </p>
        </article>

        <article className="rounded-[1.35rem] border border-[rgba(19,52,92,0.12)] bg-white p-5 shadow-[0_14px_36px_rgba(12,33,58,0.045)]">
          <p className="font-serif text-3xl text-[var(--ink)]">{formatCount(data.sponsoredBills.length)}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">Sponsored bills loaded</p>
          <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
            {data.cosponsoredCount == null
              ? "Cosponsorship totals are unavailable in the current response."
              : `${formatCount(data.cosponsoredCount)} cosponsored measures found through Congress.gov.`}
          </p>
        </article>

        <article className="rounded-[1.35rem] border border-[rgba(19,52,92,0.12)] bg-white p-5 shadow-[0_14px_36px_rgba(12,33,58,0.045)]">
          <p className="font-serif text-3xl text-[var(--ink)]">{formatCount(data.member.committees.length)}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">Committee assignments</p>
          <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
            {data.member.committees.length > 0
              ? data.member.committees.slice(0, 2).map((committee) => committee.name).join(" • ")
              : "No committee assignments available from the current official source set."}
          </p>
        </article>
      </section>

      <section className="mt-8 rounded-[1.5rem] border border-[rgba(19,52,92,0.12)] bg-white p-6 shadow-[0_18px_50px_rgba(12,33,58,0.055)]">
        <div className="flex flex-wrap gap-2 border-b border-[rgba(19,52,92,0.1)] pb-4">
          <span className="rounded-t-[0.9rem] border border-[rgba(19,52,92,0.16)] border-b-white bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)]">
            Voting Record
          </span>
          <span className="rounded-t-[0.9rem] border border-transparent px-4 py-2 text-sm text-[var(--muted)]">All Roll Call Votes</span>
          <span className="rounded-t-[0.9rem] border border-transparent px-4 py-2 text-sm text-[var(--muted)]">Sponsored Bills</span>
          <span className="rounded-t-[0.9rem] border border-transparent px-4 py-2 text-sm text-[var(--muted)]">Committee Assignments</span>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(21rem,0.9fr)]">
          <article className="rounded-[1.25rem] border border-[rgba(19,52,92,0.1)] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl text-[var(--ink)]">Recent Votes</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">Latest positions found for this member in the live roll-call window.</p>
              </div>
              {data.recentVotes.length > 0 ? (
                <Link
                  href={`/votes/${data.recentVotes[0].chamber}`}
                  className="text-sm font-semibold text-[var(--accent-blue)]"
                >
                  View chamber votes
                </Link>
              ) : null}
            </div>

            {data.recentVotes.length > 0 ? (
              <div className="mt-5 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-[rgba(19,52,92,0.1)] text-[0.76rem] uppercase tracking-[0.14em] text-[var(--muted)]">
                    <tr>
                      <th className="px-0 py-3 font-medium">Date</th>
                      <th className="px-3 py-3 font-medium">Vote</th>
                      <th className="px-3 py-3 font-medium">Position</th>
                      <th className="px-3 py-3 font-medium">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentVotes.map((vote) => (
                      <tr key={vote.slug} className="border-b border-[rgba(19,52,92,0.08)] align-top last:border-b-0">
                        <td className="px-0 py-4 text-[var(--muted)]">{vote.dateLabel}</td>
                        <td className="px-3 py-4">
                          <Link
                            href={`/votes/${vote.chamber}/${vote.congress}/${vote.session}/${vote.rollCallNumber}`}
                            className="font-medium text-[var(--accent-blue)]"
                          >
                            {vote.title}
                          </Link>
                          <p className="mt-1 max-w-[38rem] text-[var(--muted)]">{vote.question}</p>
                        </td>
                        <td className={`px-3 py-4 font-semibold ${getVotePositionClasses(vote.position.vote)}`}>{vote.position.vote}</td>
                        <td className={`px-3 py-4 font-medium ${getVoteResultClasses(vote.result)}`}>{vote.result}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-5 text-sm leading-7 text-[var(--muted)]">No recent roll-call votes were found for this member in the current cached window.</p>
            )}
          </article>

          <div className="space-y-5">
            <article className="rounded-[1.25rem] border border-[rgba(19,52,92,0.1)] p-5">
              <h2 className="font-serif text-2xl text-[var(--ink)]">Voting Record</h2>
              <div className="mt-5 space-y-5">
                <div>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-[var(--ink)]">Participation</span>
                    <span className="font-semibold text-[var(--accent-blue)]">{formatPercent(data.participationRate)}</span>
                  </div>
                  <div className="mt-2 h-4 overflow-hidden rounded-full bg-[var(--surface)]">
                    <div className="h-full rounded-full bg-[var(--accent-blue)]" style={{ width: `${participationRate}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-[var(--ink)]">Missed votes</span>
                    <span className="font-semibold text-[var(--accent-red)]">{formatCount(data.missedVotes)}</span>
                  </div>
                  <div className="mt-2 h-4 overflow-hidden rounded-full bg-[var(--surface)]">
                    <div className="h-full rounded-full bg-[var(--accent-red)]" style={{ width: `${missedVoteRate}%` }} />
                  </div>
                </div>

                <div className="grid gap-4 border-t border-[rgba(19,52,92,0.1)] pt-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Total Votes</p>
                    <p className="mt-2 text-lg font-semibold text-[var(--ink)]">{formatCount(totalVotes)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Window</p>
                    <p className="mt-2 text-lg font-semibold text-[var(--ink)]">Recent live roll calls</p>
                  </div>
                </div>
              </div>
            </article>

            <article className="rounded-[1.25rem] border border-[rgba(19,52,92,0.1)] p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-serif text-2xl text-[var(--ink)]">Sponsored Bills</h2>
                <span className="text-sm text-[var(--muted)]">{formatCount(data.sponsoredBills.length)}</span>
              </div>
              <div className="mt-5 space-y-4">
                {data.sponsoredBills.length > 0 ? (
                  data.sponsoredBills.slice(0, 3).map((bill) => (
                    <Link
                      key={`${bill.billType}-${bill.billNumber}`}
                      href={`/bills/${bill.congress}/${bill.billType}/${bill.billNumber}`}
                      className="block rounded-[1rem] border border-[rgba(19,52,92,0.1)] px-4 py-4 transition hover:border-[var(--accent-blue)]"
                    >
                      <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">{bill.idLabel}</p>
                      <p className="mt-2 font-medium text-[var(--ink)]">{bill.title}</p>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm leading-7 text-[var(--muted)]">No sponsored bills are currently available from the live feed.</p>
                )}
              </div>
            </article>

            <article className="rounded-[1.25rem] border border-[rgba(19,52,92,0.1)] p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-serif text-2xl text-[var(--ink)]">Committee Assignments</h2>
                <span className="text-sm text-[var(--muted)]">{formatCount(data.member.committees.length)}</span>
              </div>
              <div className="mt-5 space-y-3">
                {data.member.committees.length > 0 ? (
                  data.member.committees.map((committee) => (
                    <div key={committee.code} className="rounded-[1rem] border border-[rgba(19,52,92,0.1)] px-4 py-3">
                      <p className="font-medium text-[var(--ink)]">{committee.name}</p>
                      {committee.role ? <p className="mt-1 text-sm text-[var(--muted)]">{committee.role}</p> : null}
                    </div>
                  ))
                ) : (
                  <p className="text-sm leading-7 text-[var(--muted)]">No committee assignments available from current source records.</p>
                )}
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
