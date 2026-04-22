import Image from "next/image";
import Link from "next/link";

import { getStates } from "@/lib/congress-data";

const REGION_BY_STATE: Record<string, string> = {
  CT: "Northeast",
  ME: "Northeast",
  MA: "Northeast",
  NH: "Northeast",
  RI: "Northeast",
  VT: "Northeast",
  NJ: "Northeast",
  NY: "Northeast",
  PA: "Northeast",
  IL: "Midwest",
  IN: "Midwest",
  MI: "Midwest",
  OH: "Midwest",
  WI: "Midwest",
  IA: "Midwest",
  KS: "Midwest",
  MN: "Midwest",
  MO: "Midwest",
  NE: "Midwest",
  ND: "Midwest",
  SD: "Midwest",
  DE: "South",
  FL: "South",
  GA: "South",
  MD: "South",
  NC: "South",
  SC: "South",
  VA: "South",
  DC: "South",
  WV: "South",
  AL: "South",
  KY: "South",
  MS: "South",
  TN: "South",
  AR: "South",
  LA: "South",
  OK: "South",
  TX: "South",
  AZ: "West",
  CO: "West",
  ID: "West",
  MT: "West",
  NV: "West",
  NM: "West",
  UT: "West",
  WY: "West",
  AK: "West",
  CA: "West",
  HI: "West",
  OR: "West",
  WA: "West",
};

const DIRECTORY_VIEWS = [
  { slug: "all", label: "All States" },
  { slug: "name", label: "By Name" },
  { slug: "region", label: "By Region" },
] as const;

function buildDirectoryHref(view: string, query: string) {
  const params = new URLSearchParams();
  if (view && view !== "all") {
    params.set("view", view);
  }
  if (query.trim()) {
    params.set("q", query.trim());
  }
  const queryString = params.toString();
  return queryString ? `/states?${queryString}` : "/states";
}

export default async function StatesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; view?: string }>;
}) {
  const [{ q = "", view = "all" }, states] = await Promise.all([
    searchParams,
    getStates(),
  ]);

  const normalizedQuery = q.trim().toLowerCase();
  const activeView = DIRECTORY_VIEWS.some((option) => option.slug === view) ? view : "all";
  const enrichedStates = states.map((state) => ({
    ...state,
    region: REGION_BY_STATE[state.code] ?? "Territories",
  }));

  const filteredStates = enrichedStates.filter((state) => {
    if (!normalizedQuery) return true;
    return (
      state.name.toLowerCase().includes(normalizedQuery) ||
      state.code.toLowerCase().includes(normalizedQuery) ||
      state.region.toLowerCase().includes(normalizedQuery)
    );
  });

  const sortedStates = filteredStates.slice().sort((left, right) => {
    if (activeView === "region") {
      return left.region.localeCompare(right.region) || left.name.localeCompare(right.name);
    }
    return left.name.localeCompare(right.name);
  });

  const groupedStates = sortedStates.reduce<Record<string, typeof sortedStates>>((accumulator, state) => {
    const key = activeView === "region" ? state.region : "All States";
    accumulator[key] ??= [];
    accumulator[key].push(state);
    return accumulator;
  }, {});

  const regionSummary = Object.entries(
    enrichedStates.reduce<Record<string, number>>((accumulator, state) => {
      accumulator[state.region] = (accumulator[state.region] ?? 0) + 1;
      return accumulator;
    }, {}),
  ).sort((left, right) => left[0].localeCompare(right[0]));

  return (
    <main className="mx-auto w-full max-w-[1280px] px-5 pb-14 pt-8 lg:px-8">
      <section className="overflow-hidden rounded-[1.7rem] border border-[var(--border)] bg-white shadow-[0_18px_48px_rgba(15,35,58,0.08)]">
        <div className="grid gap-6 p-6 lg:grid-cols-[0.92fr_1.08fr] lg:p-8">
          <article className="rounded-[1.5rem] border border-[rgba(19,52,92,0.08)] bg-[linear-gradient(180deg,rgba(250,252,255,0.96),rgba(244,248,252,0.92))] p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[0.8rem] uppercase tracking-[0.16em] text-[var(--muted)]">Current Congress</p>
                <h1 className="mt-3 font-serif text-[2.35rem] leading-[1.02] text-[var(--navy)] sm:text-[2.7rem]">
                  Browse by State
                </h1>
                <p className="mt-3 max-w-[28rem] text-[0.98rem] leading-7 text-[var(--muted)]">
                  Move from a state directory into live House and Senate delegations, recent roll calls, and current member profiles.
                </p>
              </div>
              <div className="rounded-[1.2rem] border border-[rgba(19,52,92,0.08)] bg-white px-4 py-3 text-right shadow-[0_8px_24px_rgba(15,38,68,0.045)]">
                <p className="text-[0.75rem] uppercase tracking-[0.16em] text-[var(--muted)]">States</p>
                <p className="mt-1 font-serif text-[2rem] leading-none text-[var(--ink)]">{states.length}</p>
              </div>
            </div>

            <form action="/states" className="mt-6">
              <input type="hidden" name="view" value={activeView} />
              <label className="flex items-center gap-3 rounded-[1.05rem] border border-[rgba(19,52,92,0.12)] bg-white px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                <span className="text-lg text-[var(--muted)]" aria-hidden="true">
                  ⌕
                </span>
                <input
                  name="q"
                  defaultValue={q}
                  placeholder="Search states..."
                  className="w-full border-0 bg-transparent text-[0.98rem] text-[var(--ink)] outline-none placeholder:text-[var(--muted)]"
                />
              </label>
            </form>

            <div className="mt-5 grid grid-cols-3 overflow-hidden rounded-[1rem] border border-[rgba(19,52,92,0.12)] bg-white">
              {DIRECTORY_VIEWS.map((option) => {
                const isActive = option.slug === activeView;
                return (
                  <Link
                    key={option.slug}
                    href={buildDirectoryHref(option.slug, q)}
                    className={`px-3 py-3 text-center text-sm font-medium transition ${
                      isActive
                        ? "bg-[var(--navy)] text-white"
                        : "text-[var(--ink)] hover:bg-[rgba(19,52,92,0.05)]"
                    }`}
                  >
                    {option.label}
                  </Link>
                );
              })}
            </div>

            <div className="mt-5 overflow-hidden rounded-[1.35rem] border border-[rgba(19,52,92,0.08)] bg-white p-4">
              <Image
                src="/reference-assets/us-map.svg"
                alt="Map of the United States for browsing by state"
                width={720}
                height={420}
                className="h-auto w-full"
              />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {regionSummary.map(([region, count]) => (
                <div
                  key={region}
                  className="rounded-[1rem] border border-[rgba(19,52,92,0.08)] bg-white px-4 py-3"
                >
                  <p className="text-[0.78rem] uppercase tracking-[0.16em] text-[var(--muted)]">{region}</p>
                  <p className="mt-2 text-sm text-[var(--ink)]">{count} states</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[1.5rem] border border-[rgba(19,52,92,0.08)] bg-white p-5 shadow-[0_10px_28px_rgba(15,35,58,0.05)] sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[0.8rem] uppercase tracking-[0.16em] text-[var(--muted)]">
                  {activeView === "region" ? "Grouped Directory" : "State Directory"}
                </p>
                <h2 className="mt-2 font-serif text-[2rem] leading-none text-[var(--navy)]">
                  {sortedStates.length} matches
                </h2>
              </div>
              {normalizedQuery ? (
                <Link
                  href={buildDirectoryHref(activeView, "")}
                  className="text-sm font-medium text-[var(--accent-blue)]"
                >
                  Clear search
                </Link>
              ) : null}
            </div>

            <div className="mt-5 space-y-5">
              {Object.entries(groupedStates).map(([group, statesInGroup]) => (
                <section key={group}>
                  {activeView === "region" ? (
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h3 className="text-[0.84rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                        {group}
                      </h3>
                      <span className="text-sm text-[var(--muted)]">{statesInGroup.length}</span>
                    </div>
                  ) : null}
                  <div className="space-y-2">
                    {statesInGroup.map((state) => (
                      <Link
                        key={state.code}
                        href={`/states/${state.slug}`}
                        className="flex items-center justify-between gap-4 rounded-[1.1rem] border border-[rgba(19,52,92,0.1)] px-4 py-4 transition hover:border-[rgba(19,52,92,0.2)] hover:bg-[rgba(244,248,252,0.85)]"
                      >
                        <div className="min-w-0">
                          <p className="text-[0.76rem] uppercase tracking-[0.16em] text-[var(--muted)]">
                            {state.region}
                          </p>
                          <p className="mt-1 text-[1.08rem] font-medium text-[var(--ink)]">{state.name}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="rounded-full bg-[rgba(19,52,92,0.06)] px-3 py-1 text-sm font-medium text-[var(--navy)]">
                            {state.code}
                          </span>
                          <span className="text-[1.25rem] text-[var(--muted)]" aria-hidden="true">
                            ›
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              ))}

              {sortedStates.length === 0 ? (
                <div className="rounded-[1.1rem] border border-dashed border-[rgba(19,52,92,0.18)] px-4 py-6 text-sm leading-7 text-[var(--muted)]">
                  No states matched that search. Try a state name, abbreviation, or region.
                </div>
              ) : null}
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
