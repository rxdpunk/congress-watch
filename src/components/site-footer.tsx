import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[color:var(--border)] bg-white">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center gap-3 px-5 py-8 text-center text-sm text-[var(--muted)] lg:px-8">
        <p className="text-[13px] text-[var(--muted)]">All data is sourced from official congressional records.</p>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] font-medium text-[var(--accent-blue)]">
          <Link href="/data-sources" className="transition-colors hover:text-[var(--navy)]">
            About the Data
          </Link>
          <span className="text-[var(--border-strong)]">•</span>
          <Link href="/methodology" className="transition-colors hover:text-[var(--navy)]">
            Methodology
          </Link>
          <span className="text-[var(--border-strong)]">•</span>
          <Link href="/about" className="transition-colors hover:text-[var(--navy)]">
            About
          </Link>
        </div>

        <p className="max-w-3xl text-[12px] leading-5 text-[var(--muted)]">
          Congress.Watch is a public-interest civic interface built around official-source-first congressional data.
        </p>
      </div>
    </footer>
  );
}
