import { PageIntro } from "@/components/page-intro";

export default function MethodologyPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-12 lg:px-8">
      <PageIntro
        eyebrow="Methodology"
        title="How Congress Ledger handles data, facts, and AI"
        description="The product is designed to stay factual, source-linked, and current-member-focused. These rules matter as much as the interface itself."
      />
      <div className="mt-10 space-y-6 rounded-[1.75rem] border border-[var(--border)] bg-white p-6 leading-8 text-[var(--muted)]">
        <p>All meaningful records should trace back to official congressional or chamber sources whenever possible.</p>
        <p>Current-member logic is explicit. The product is built around the active House and Senate roster, not historical archives.</p>
        <p>AI-generated text is not source truth. Any future AI-assisted summary must be labeled clearly and derived only from stored source-backed data.</p>
        <p>If data is delayed or incomplete, the site should say so plainly rather than imply certainty that does not exist.</p>
      </div>
    </main>
  );
}
