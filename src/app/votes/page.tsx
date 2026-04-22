import Link from "next/link";

import { PageIntro } from "@/components/page-intro";
import { getRecentVotes } from "@/lib/congress-data";

export default async function VotesPage() {
  const votes = await getRecentVotes(20);

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-12 lg:px-8">
      <PageIntro
        eyebrow="Votes"
        title="Recent official roll-call votes"
        description="Browse recent House and Senate roll calls, with chamber, date, result, and direct access to member-level recorded positions."
      />
      <div className="mt-10 space-y-4">
        {votes.map((vote) => (
          <Link
            key={vote.slug}
            href={`/votes/${vote.chamber}/${vote.congress}/${vote.session}/${vote.rollCallNumber}`}
            className="block rounded-[1.5rem] border border-[var(--border)] bg-white px-5 py-5 shadow-[0_16px_40px_rgba(12,33,58,0.05)] transition hover:border-[var(--accent-blue)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
                <span>{vote.chamber}</span>
                <span>Congress {vote.congress}</span>
                <span>Roll {vote.rollCallNumber}</span>
              </div>
              <span className="text-sm text-[var(--muted)]">{vote.dateLabel}</span>
            </div>
            <h2 className="mt-3 text-lg leading-8 text-[var(--ink)]">{vote.title}</h2>
            <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{vote.result}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
