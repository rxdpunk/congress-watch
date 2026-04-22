import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type { CongressDataset } from "@/lib/congress/domain";
import { buildHouseCommitteeAssignments, fetchHouseMemberProfileDetail, fetchLiveHouseRoster } from "@/lib/congress/official/house";
import { fetchLiveSenateRoster } from "@/lib/congress/official/senate";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, "..", "..");
const outputPath = resolve(rootDir, "src/lib/congress/seed/roster-snapshot.json");

const FEATURED_HOUSE_MEMBERS = new Set(["A000381", "D000624", "F000466", "M001208", "S001211", "W000788"]);

type RosterSnapshot = Pick<
  CongressDataset,
  "sourceDocuments" | "members" | "memberTerms" | "committeeAssignments" | "importRuns"
>;

async function main() {
  const startedAt = new Date().toISOString();
  const [houseRoster, senateRoster] = await Promise.all([fetchLiveHouseRoster(), fetchLiveSenateRoster()]);

  const sourceDocuments = [...houseRoster.sourceDocuments, ...senateRoster.sourceDocuments];
  const members = [...houseRoster.members, ...senateRoster.members];
  const memberTerms = [...houseRoster.memberTerms, ...senateRoster.memberTerms];
  const committeeAssignments = [...senateRoster.committeeAssignments];

  for (const member of houseRoster.members.filter((entry) => FEATURED_HOUSE_MEMBERS.has(entry.bioguideId))) {
    const detail = await fetchHouseMemberProfileDetail(member.bioguideId);
    sourceDocuments.push(detail.sourceDocument);
    committeeAssignments.push(
      ...buildHouseCommitteeAssignments(`term-house-${member.bioguideId.toLowerCase()}-current`, member.bioguideId, detail),
    );

    const matchingMember = members.find((entry) => entry.id === member.id);
    if (matchingMember && detail.officialWebsiteUrl) {
      matchingMember.officialWebsiteUrl = detail.officialWebsiteUrl;
    }

    const matchingTerm = memberTerms.find((entry) => entry.memberId === member.id);
    if (matchingTerm && detail.swornInDate) {
      matchingTerm.swornInDate = detail.swornInDate;
      matchingTerm.serviceStartDate = detail.swornInDate;
      matchingTerm.sourceDocumentIds = [...new Set([...matchingTerm.sourceDocumentIds, detail.sourceDocument.id])];
    }
  }

  const completedAt = new Date().toISOString();
  const snapshot: RosterSnapshot = {
    sourceDocuments,
    members,
    memberTerms,
    committeeAssignments,
    importRuns: [
      {
        id: `seed-snapshot-${completedAt}`,
        pipelineName: "build-roster-seed",
        status: "succeeded",
        startedAt,
        completedAt,
        recordsSeen: members.length + memberTerms.length,
        recordsInserted: members.length + memberTerms.length + committeeAssignments.length,
        recordsUpdated: 0,
        recordsFailed: 0,
        metadata: {
          houseMembers: houseRoster.members.length,
          senators: senateRoster.members.length,
          committeeAssignments: committeeAssignments.length,
          enrichedHouseProfiles: FEATURED_HOUSE_MEMBERS.size,
        },
      },
    ],
  };

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");

  process.stdout.write(
    `Wrote ${outputPath}\nHouse members: ${houseRoster.members.length}\nSenators: ${senateRoster.members.length}\n`,
  );
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
  process.exitCode = 1;
});
