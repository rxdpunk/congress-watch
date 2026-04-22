import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-4xl flex-col items-start justify-center px-5 py-12 lg:px-8">
      <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--muted)]">Not found</p>
      <h1 className="mt-4 font-serif text-5xl text-[var(--ink)]">That page is not available.</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--muted)]">
        The record may not exist, may have moved, or may not yet be available from the current source data.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/" className="button-primary px-5 py-3 text-sm font-semibold">
          Return home
        </Link>
        <Link href="/search" className="rounded-full border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--ink)]">
          Search the site
        </Link>
      </div>
    </main>
  );
}
