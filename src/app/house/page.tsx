import { MemberCard } from "@/components/member-card";
import { PageIntro } from "@/components/page-intro";
import { getMembersByChamber } from "@/lib/congress-data";

export default async function HousePage() {
  const members = await getMembersByChamber("house");

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-12 lg:px-8">
      <PageIntro
        eyebrow="House"
        title="Current House members"
        description="Voting members of the U.S. House of Representatives, organized around official roster data and ready to drill into votes, sponsored bills, and member records."
      />
      <div className="mt-10 grid gap-5 xl:grid-cols-2">
        {members.map((member) => (
          <MemberCard key={member.bioguideId} member={member} />
        ))}
      </div>
    </main>
  );
}
