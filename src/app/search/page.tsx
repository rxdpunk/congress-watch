import Link from "next/link";

import { PageIntro } from "@/components/page-intro";
import { searchSite } from "@/lib/congress-data";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const results = await searchSite(q);

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-12 lg:px-8">
      <PageIntro
        eyebrow="Search"
        title="Find a member, state, bill, or vote"
        description="Search is designed around common public questions like “Who represents me?” and “How has this member voted?”"
      />

      <form action="/search" className="mt-8 flex flex-col gap-3 rounded-[1.5rem] border border-[var(--border)] bg-white p-4 sm:flex-row">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search members or states"
          className="w-full rounded-full border border-[var(--border)] px-4 py-3 outline-none focus:border-[var(--accent-blue)]"
        />
        <button className="rounded-full bg-[var(--navy)] px-6 py-3 text-sm font-semibold text-white">Search</button>
      </form>

      {q ? (
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <section className="rounded-[1.5rem] border border-[var(--border)] bg-white p-6">
            <h2 className="font-serif text-3xl text-[var(--ink)]">Members</h2>
            <div className="mt-5 space-y-3">
              {results.members.length > 0 ? (
                results.members.slice(0, 30).map((member) => (
                  <Link key={member.bioguideId} href={`/members/${member.slug}`} className="block rounded-[1rem] border border-[var(--border)] px-4 py-4 transition hover:border-[var(--accent-blue)]">
                    <p className="font-semibold text-[var(--ink)]">{member.fullName}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{member.roleLabel}</p>
                  </Link>
                ))
              ) : (
                <p className="text-sm leading-7 text-[var(--muted)]">No matching members found.</p>
              )}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-[var(--border)] bg-white p-6">
            <h2 className="font-serif text-3xl text-[var(--ink)]">States</h2>
            <div className="mt-5 space-y-3">
              {results.states.length > 0 ? (
                results.states.map((state) => (
                  <Link key={state.code} href={`/states/${state.slug}`} className="block rounded-[1rem] border border-[var(--border)] px-4 py-4 transition hover:border-[var(--accent-blue)]">
                    <p className="font-semibold text-[var(--ink)]">{state.name}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{state.code}</p>
                  </Link>
                ))
              ) : (
                <p className="text-sm leading-7 text-[var(--muted)]">No matching states found.</p>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
