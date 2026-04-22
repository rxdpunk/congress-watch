import Link from "next/link";

import { PageIntro } from "@/components/page-intro";
import { formatDisplayDate, getBills } from "@/lib/congress-data";

export default async function BillsPage() {
  const bills = await getBills(36);

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-12 lg:px-8">
      <PageIntro
        eyebrow="Bills"
        title="Recent legislation in the current Congress"
        description="Browse recent legislation and follow each bill back to its official source, title, policy area, and latest recorded action."
      />
      <div className="mt-10 space-y-4">
        {bills.map((bill) => (
          <Link
            key={`${bill.billType}-${bill.billNumber}`}
            href={`/bills/${bill.congress}/${bill.billType}/${bill.billNumber}`}
            className="block rounded-[1.5rem] border border-[var(--border)] bg-white px-5 py-5 shadow-[0_16px_40px_rgba(12,33,58,0.05)] transition hover:border-[var(--accent-blue)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-semibold text-[var(--ink)]">{bill.idLabel}</p>
              <span className="text-sm text-[var(--muted)]">{formatDisplayDate(bill.latestActionDate)}</span>
            </div>
            <h2 className="mt-3 text-lg leading-8 text-[var(--ink)]">{bill.title}</h2>
            {bill.latestActionText ? <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{bill.latestActionText}</p> : null}
          </Link>
        ))}
      </div>
    </main>
  );
}
