import { PageIntro } from "@/components/page-intro";

const sources = [
  "House Clerk MemberData.xml",
  "Senate current-member XML feeds",
  "House Clerk roll call vote XML",
  "Senate LIS roll call vote XML",
  "Congress.gov API",
  "GovInfo bill status data",
];

export default function DataSourcesPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-12 lg:px-8">
      <PageIntro
        eyebrow="Data sources"
        title="Official inputs behind the site"
        description="The site is built to favor primary government sources over third-party political datasets wherever practical."
      />
      <div className="mt-10 grid gap-4">
        {sources.map((source) => (
          <article key={source} className="rounded-[1.25rem] border border-[var(--border)] bg-white px-5 py-5 text-base text-[var(--ink)] shadow-[0_16px_40px_rgba(12,33,58,0.05)]">
            {source}
          </article>
        ))}
      </div>
    </main>
  );
}
