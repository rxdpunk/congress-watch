import Link from "next/link";

import { PageIntro } from "@/components/page-intro";
import { getStates } from "@/lib/congress-data";

export default async function StatesPage() {
  const states = await getStates();

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-12 lg:px-8">
      <PageIntro
        eyebrow="States"
        title="Browse Congress by state"
        description="Find your delegation quickly and move from a state overview into current senators, representatives, recent votes, and member records."
      />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {states.map((state) => (
          <Link key={state.code} href={`/states/${state.slug}`} className="rounded-[1.5rem] border border-[var(--border)] bg-white px-5 py-5 shadow-[0_16px_40px_rgba(12,33,58,0.05)] transition hover:border-[var(--accent-blue)]">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">{state.code}</p>
            <h2 className="mt-3 font-serif text-3xl text-[var(--ink)]">{state.name}</h2>
          </Link>
        ))}
      </div>
    </main>
  );
}
