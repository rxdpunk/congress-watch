import seedRosterSnapshot from "@/lib/congress/seed/roster-snapshot.json";
import { CURRENT_CONGRESS, CURRENT_SESSION } from "@/lib/congress/constants";
import type { CongressDataset, ImportRunRecord } from "@/lib/congress/domain";
import { seededLegislativeData } from "@/lib/congress/seed/legislative-seed";
import { buildHouseCommitteeAssignments, fetchHouseMemberProfileDetail, fetchLiveHouseRoster } from "@/lib/congress/official/house";
import { hasCongressGovApiKey } from "@/lib/congress/official/congress-gov";
import { fetchLiveSenateRoster } from "@/lib/congress/official/senate";

type RepositoryOptions = {
  mode?: "seed" | "live" | "hybrid";
  enrichHouseProfiles?: boolean;
  fetchImpl?: typeof fetch;
};

type SeedRosterSnapshot = Pick<
  CongressDataset,
  "sourceDocuments" | "members" | "memberTerms" | "committeeAssignments" | "importRuns"
>;

const rosterSnapshot = seedRosterSnapshot as SeedRosterSnapshot;

function createBaseDataset(): CongressDataset {
  return {
    metadata: {
      title: "Congress Watch V1 data layer",
      origin: "seed",
      completeness: "partial",
      generatedAt: new Date().toISOString(),
      currentCongress: CURRENT_CONGRESS,
      currentSession: CURRENT_SESSION,
      lastSuccessfulSyncAt: rosterSnapshot.importRuns.at(-1)?.completedAt ?? new Date().toISOString(),
      officialSources: [
        "https://clerk.house.gov/Members/ViewMemberList",
        "https://www.senate.gov/general/contact_information/senators_cfm.xml",
        "https://www.senate.gov/legislative/LIS_MEMBER/cvc_member_data.xml",
      ],
      warnings: [],
    },
    congresses: [
      {
        number: CURRENT_CONGRESS,
        startDate: "2025-01-03",
        endDate: "2027-01-03",
        isCurrent: true,
      },
    ],
    sessions: [
      {
        congressNumber: CURRENT_CONGRESS,
        sessionNumber: 1,
        label: "119th Congress, 1st Session",
        startDate: "2025-01-03",
        endDate: "2025-12-31",
      },
      {
        congressNumber: CURRENT_CONGRESS,
        sessionNumber: CURRENT_SESSION,
        label: "119th Congress, 2nd Session",
        startDate: "2026-01-03",
      },
    ],
    sourceDocuments: [...rosterSnapshot.sourceDocuments, ...seededLegislativeData.sourceDocuments],
    members: [...rosterSnapshot.members],
    memberTerms: [...rosterSnapshot.memberTerms],
    committeeAssignments: [...rosterSnapshot.committeeAssignments],
    bills: [...seededLegislativeData.bills],
    billSponsorships: [...seededLegislativeData.billSponsorships],
    votes: [...seededLegislativeData.votes],
    votePositions: [...seededLegislativeData.votePositions],
    importRuns: [...rosterSnapshot.importRuns, ...seededLegislativeData.importRuns],
  };
}

export function getSeedCongressDataset(): CongressDataset {
  const dataset = createBaseDataset();
  dataset.metadata.origin = "seed";
  dataset.metadata.generatedAt = rosterSnapshot.importRuns.at(-1)?.completedAt ?? dataset.metadata.generatedAt;
  dataset.metadata.lastSuccessfulSyncAt = dataset.metadata.generatedAt;
  dataset.metadata.completeness = "partial";
  dataset.metadata.warnings = ["Using the committed official-source seed snapshot."];
  return dataset;
}

function mergeLiveRosterIntoDataset(
  dataset: CongressDataset,
  roster: Pick<CongressDataset, "sourceDocuments" | "members" | "memberTerms" | "committeeAssignments">,
  generatedAt: string,
): CongressDataset {
  return {
    ...dataset,
    metadata: {
      ...dataset.metadata,
      origin: "hybrid",
      generatedAt,
      lastSuccessfulSyncAt: generatedAt,
      completeness: "partial",
      warnings: hasCongressGovApiKey()
        ? ["Live roster loaded from official House and Senate feeds; legislative records still use the seed subset until Congress.gov sync is implemented."]
        : ["Live roster loaded from official House and Senate feeds; bills and votes use the committed seed subset because Congress.gov API access is not configured."],
    },
    sourceDocuments: [
      ...dataset.sourceDocuments.filter((document) => document.sourceSystem === "congress-gov" || document.sourceSystem === "seed"),
      ...roster.sourceDocuments,
    ],
    members: roster.members,
    memberTerms: roster.memberTerms,
    committeeAssignments: roster.committeeAssignments,
    importRuns: [
      ...dataset.importRuns,
      {
        id: `import-live-roster-${generatedAt}`,
        pipelineName: "live-current-member-roster",
        status: "succeeded",
        startedAt: generatedAt,
        completedAt: generatedAt,
        recordsSeen: roster.members.length,
        recordsInserted: roster.members.length,
        recordsUpdated: 0,
        recordsFailed: 0,
        metadata: {
          houseMembers: roster.memberTerms.filter((term) => term.chamber === "house").length,
          senators: roster.memberTerms.filter((term) => term.chamber === "senate").length,
        },
      } satisfies ImportRunRecord,
    ],
  };
}

export async function getCongressDataset(options: RepositoryOptions = {}): Promise<CongressDataset> {
  const mode = options.mode ?? (process.env.CONGRESS_DATA_MODE as RepositoryOptions["mode"]) ?? "hybrid";

  if (mode === "seed") {
    return getSeedCongressDataset();
  }

  const fetchImpl = options.fetchImpl ?? fetch;
  const seed = getSeedCongressDataset();

  try {
    const [houseRoster, senateRoster] = await Promise.all([
      fetchLiveHouseRoster(fetchImpl),
      fetchLiveSenateRoster(fetchImpl),
    ]);

    const committeeAssignments = [...senateRoster.committeeAssignments];
    const sourceDocuments = [...houseRoster.sourceDocuments, ...senateRoster.sourceDocuments];
    let members = [...houseRoster.members, ...senateRoster.members];
    let memberTerms = [...houseRoster.memberTerms, ...senateRoster.memberTerms];

    if (options.enrichHouseProfiles) {
      const featuredHouseMembers = houseRoster.members.filter((member) =>
        ["A000381", "S001211", "F000466", "D000624", "M001208", "W000788"].includes(member.bioguideId),
      );
      for (const member of featuredHouseMembers) {
        const detail = await fetchHouseMemberProfileDetail(member.bioguideId, fetchImpl);
        sourceDocuments.push(detail.sourceDocument);
        committeeAssignments.push(
          ...buildHouseCommitteeAssignments(
            `term-house-${member.bioguideId.toLowerCase()}-current`,
            member.bioguideId,
            detail,
          ),
        );
        members = members.map((entry) =>
          entry.id === member.id
            ? {
                ...entry,
                officialWebsiteUrl: detail.officialWebsiteUrl ?? entry.officialWebsiteUrl,
              }
            : entry,
        );
        memberTerms = memberTerms.map((term) =>
          term.memberId === member.id
            ? {
                ...term,
                swornInDate: detail.swornInDate ?? term.swornInDate,
                serviceStartDate: detail.swornInDate ?? term.serviceStartDate,
                sourceDocumentIds: [...new Set([...term.sourceDocumentIds, detail.sourceDocument.id])],
              }
            : term,
        );
      }
    }

    return mergeLiveRosterIntoDataset(
      seed,
      {
        sourceDocuments,
        members,
        memberTerms,
        committeeAssignments,
      },
      new Date().toISOString(),
    );
  } catch (error) {
    return {
      ...seed,
      metadata: {
        ...seed.metadata,
        warnings: [
          `Fell back to the committed seed snapshot because the live roster sync failed: ${error instanceof Error ? error.message : "unknown error"}`,
        ],
      },
      importRuns: [
        ...seed.importRuns,
        {
          id: `import-live-roster-failed-${new Date().toISOString()}`,
          pipelineName: "live-current-member-roster",
          status: "failed",
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          recordsSeen: 0,
          recordsInserted: 0,
          recordsUpdated: 0,
          recordsFailed: 1,
          errorSummary: error instanceof Error ? error.message : "Unknown error",
        },
      ],
    };
  }
}
