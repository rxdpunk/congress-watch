import { MemberCard } from "@/components/member-card";
import { PageIntro } from "@/components/page-intro";
import { getMembersByChamber } from "@/lib/congress-data";

export default async function SenatePage() {
  const members = await getMembersByChamber("senate");

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-12 lg:px-8">
      <PageIntro
        eyebrow="Senate"
        title="Current senators"
        description="Current members of the U.S. Senate, with official-source-backed links into committee assignments, roll-call participation, and sponsored legislation."
      />
      <div className="mt-10 grid gap-5 xl:grid-cols-2">
        {members.map((member) => (
          <MemberCard key={member.bioguideId} member={member} />
        ))}
      </div>
    </main>
  );
}
