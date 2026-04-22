import Link from "next/link";

import { formatDisplayDate, type Member } from "@/lib/congress-data";

export function MemberCard({ member }: { member: Member }) {
  return (
    <article className="rounded-[1.5rem] border border-[var(--border)] bg-white p-5 shadow-[0_16px_40px_rgba(12,33,58,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--muted)]">
            {member.chamber === "house" ? "House" : "Senate"}
          </p>
          <h3 className="mt-2 font-serif text-2xl text-[var(--ink)]">{member.fullName}</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{member.roleLabel}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            member.partyCode === "R"
              ? "bg-[rgba(176,48,53,0.12)] text-[var(--accent-red)]"
              : member.partyCode === "D"
                ? "bg-[rgba(36,82,164,0.12)] text-[var(--accent-blue)]"
                : "bg-[rgba(12,33,58,0.08)] text-[var(--ink)]"
          }`}
        >
          {member.partyName}
        </span>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-[1rem] bg-[var(--surface)] px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">Term ends</p>
          <p className="mt-2 text-sm font-medium text-[var(--ink)]">{formatDisplayDate(member.termEndDate)}</p>
        </div>
        <div className="rounded-[1rem] bg-[var(--surface)] px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">Committees</p>
          <p className="mt-2 text-sm font-medium text-[var(--ink)]">{member.committees.length}</p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2 text-xs text-[var(--muted)]">
        {member.committees.slice(0, 3).map((committee) => (
          <span key={`${member.bioguideId}-${committee.code}`} className="rounded-full border border-[var(--border)] px-3 py-1">
            {committee.name}
          </span>
        ))}
      </div>
      <Link
        href={`/members/${member.slug}`}
        className="button-primary mt-6 px-4 py-2 text-sm font-medium"
      >
        View profile
      </Link>
    </article>
  );
}
