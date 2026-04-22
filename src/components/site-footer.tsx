import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-[var(--muted)] lg:px-8">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link href="/methodology" className="hover:text-[var(--ink)]">
            Methodology
          </Link>
          <Link href="/data-sources" className="hover:text-[var(--ink)]">
            Data Sources
          </Link>
          <Link href="/about" className="hover:text-[var(--ink)]">
            About
          </Link>
          <Link href="/search" className="hover:text-[var(--ink)]">
            Search
          </Link>
        </div>
        <p>Congress Ledger is a public-interest civic interface built around official-source-first congressional data.</p>
        <p>Any AI-generated language must be labeled AI-assisted and traceable to stored source-backed facts.</p>
      </div>
    </footer>
  );
}
