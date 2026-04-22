import Link from "next/link";

const navItems = [
  { href: "/states", label: "States" },
  { href: "/house", label: "House" },
  { href: "/senate", label: "Senate" },
  { href: "/votes", label: "Votes" },
  { href: "/bills", label: "Bills" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[var(--navy)] text-white shadow-[0_10px_30px_rgba(12,33,58,0.18)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-4 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-sm font-semibold">
              CW
            </div>
            <div>
              <p className="font-serif text-2xl leading-none">Congress.Watch</p>
              <p className="text-sm text-[var(--paper-muted)]">Facts. Transparency. Accountability.</p>
            </div>
          </Link>

          <form action="/search" className="flex w-full max-w-md items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-2">
            <input
              type="search"
              name="q"
              placeholder="Search members, states, bills, votes..."
              className="w-full bg-transparent text-sm text-white placeholder:text-[var(--paper-muted)] outline-none"
            />
            <button type="submit" className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[var(--navy)]">
              Search
            </button>
          </form>
        </div>

        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[var(--paper-muted)]">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-white">
              {item.label}
            </Link>
          ))}
          <span className="ml-auto rounded-full border border-white/15 px-3 py-1 text-xs uppercase tracking-[0.2em]">
            Current Congress
          </span>
        </nav>
      </div>
    </header>
  );
}
