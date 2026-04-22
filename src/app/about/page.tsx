import { PageIntro } from "@/components/page-intro";

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-12 lg:px-8">
      <PageIntro
        eyebrow="About"
        title="A civic product about the branch that writes the law"
        description="Congress Ledger exists to make congressional activity easier to browse, compare, and understand without partisan framing or campaign-style presentation."
      />
      <div className="mt-10 space-y-6 rounded-[1.75rem] border border-[var(--border)] bg-white p-6 leading-8 text-[var(--muted)]">
        <p>The site is organized around current members of Congress, official roll-call votes, sponsored bills, and public-source transparency.</p>
        <p>Its purpose is not to tell users what to think. Its purpose is to make it easier to see what elected lawmakers have done.</p>
        <p>The design direction is intentionally editorial and public-service-oriented rather than partisan or campaign-driven.</p>
      </div>
    </main>
  );
}
