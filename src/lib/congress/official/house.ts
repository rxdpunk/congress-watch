import { STATE_NAMES } from "@/lib/congress/constants";
import type { CommitteeAssignmentRecord, MemberRecord, MemberTermRecord, SourceDocument } from "@/lib/congress/domain";
import { createMemberSlug, currentHouseTermWindow, districtNumberFromLabel, normalizeWhitespace } from "@/lib/congress/utils";

const HOUSE_MEMBER_LIST_URL = "https://clerk.house.gov/Members/ViewMemberList";

type HouseLiveResult = {
  sourceDocuments: SourceDocument[];
  members: MemberRecord[];
  memberTerms: MemberTermRecord[];
  generatedAt: string;
};

export type HouseProfileDetail = {
  sourceDocument: SourceDocument;
  officialWebsiteUrl?: string;
  swornInDate?: string;
  committees: { code?: string; name: string; parentCommitteeName?: string; isSubcommittee: boolean }[];
};

function ordinalDistrictToLabel(rawLabel: string): string | undefined {
  const normalized = normalizeWhitespace(rawLabel);
  if (!normalized || normalized.toLowerCase() === "at large") {
    return undefined;
  }

  const match = normalized.match(/^(\d+)/);
  return match ? String(Number(match[1])).padStart(2, "0") : undefined;
}

export async function fetchLiveHouseRoster(fetchImpl: typeof fetch = fetch): Promise<HouseLiveResult> {
  const response = await fetchImpl(HOUSE_MEMBER_LIST_URL, { next: { revalidate: 3600 } });
  if (!response.ok) {
    throw new Error(`Failed to fetch House member list: ${response.status}`);
  }

  const retrievedAt = new Date().toISOString();
  const html = await response.text();
  const sourceDocuments: SourceDocument[] = [
    {
      id: "src-house-member-list-current",
      sourceSystem: "house-clerk",
      sourceType: "member-list",
      url: HOUSE_MEMBER_LIST_URL,
      retrievedAt,
    },
  ];
  const members: MemberRecord[] = [];
  const memberTerms: MemberTermRecord[] = [];
  const termWindow = currentHouseTermWindow();

  for (const match of html.matchAll(
    /<a href="\/members\/([^"]+)"[^>]*aria-label="([^"]+), state: ([^(]+)\(([A-Z]{2})\) , district: ([^,]+) , party: ([^"]+)"/gi,
  )) {
    const [, clerkMemberId, rawName, rawStateName, stateCode, districtLabel, partyLabel] = match;
    const [lastName, firstName] = rawName
      .split(",")
      .map((value) => normalizeWhitespace(value))
      .filter(Boolean);

    if (!lastName || !firstName) {
      continue;
    }

    const partyCode = partyLabel.startsWith("Republican")
      ? "R"
      : partyLabel.startsWith("Independent")
        ? "I"
        : "D";
    const memberId = `member-house-${clerkMemberId.toLowerCase()}`;
    const districtNumber = districtNumberFromLabel(districtLabel);
    const districtCode = ordinalDistrictToLabel(districtLabel);
    const fullName = `${firstName} ${lastName}`.replace(/\s+/g, " ").trim();

    members.push({
      id: memberId,
      bioguideId: clerkMemberId,
      slug: createMemberSlug({
        firstName,
        lastName,
        stateCode,
        chamber: "house",
        district: districtNumber,
      }),
      firstName,
      lastName,
      fullName,
      congressProfileUrl: `https://www.congress.gov/member/${fullName.replace(/\s+/g, "-")}/${clerkMemberId}`,
      chamber: "house",
      isCurrentMember: true,
    });

    memberTerms.push({
      id: `term-house-${clerkMemberId.toLowerCase()}-current`,
      memberId,
      chamber: "house",
      congressNumber: 119,
      stateCode,
      stateName: normalizeWhitespace(rawStateName) || STATE_NAMES[stateCode] || stateCode,
      district: districtNumber,
      districtLabel: districtCode,
      partyCode,
      termStartDate: termWindow.termStartDate,
      termEndDate: termWindow.termEndDate,
      isActive: true,
      seatLabel:
        districtCode === undefined
          ? `Representative for ${STATE_NAMES[stateCode] ?? stateCode} At Large`
          : `Representative for ${STATE_NAMES[stateCode] ?? stateCode}'s ${Number(districtCode)}${districtSuffix(Number(districtCode))} District`,
      sourceDocumentIds: ["src-house-member-list-current"],
    });
  }

  return {
    sourceDocuments,
    members,
    memberTerms,
    generatedAt: retrievedAt,
  };
}

function districtSuffix(district: number): string {
  if (district % 100 >= 11 && district % 100 <= 13) {
    return "th";
  }

  if (district % 10 === 1) {
    return "st";
  }

  if (district % 10 === 2) {
    return "nd";
  }

  if (district % 10 === 3) {
    return "rd";
  }

  return "th";
}

export async function fetchHouseMemberProfileDetail(
  bioguideId: string,
  fetchImpl: typeof fetch = fetch,
): Promise<HouseProfileDetail> {
  const url = `https://clerk.house.gov/members/${bioguideId}`;
  const response = await fetchImpl(url, { next: { revalidate: 3600 } });
  if (!response.ok) {
    throw new Error(`Failed to fetch House member profile ${bioguideId}: ${response.status}`);
  }

  const html = await response.text();
  const retrievedAt = new Date().toISOString();
  const sourceDocument: SourceDocument = {
    id: `src-house-profile-${bioguideId.toLowerCase()}`,
    sourceSystem: "house-clerk",
    sourceType: "member-profile",
    externalId: bioguideId,
    url,
    retrievedAt,
  };
  const websiteMatch = html.match(/Website:\s*<a href=([^\s>]+)/i);
  const oathMatch = html.match(/Oath of Office:\s*([^<]+)/i);
  const committees: HouseProfileDetail["committees"] = [];
  let currentCommitteeName: string | undefined;

  for (const match of html.matchAll(/<a class="library-committeePanel-subItems" href="\/Committees\/([^"]+)"[^>]*>([^<]+)<\/a>/g)) {
    const [, code, name] = match;
    const normalizedName = normalizeWhitespace(name);
    const isSubcommittee = code.length > 4;

    if (!isSubcommittee) {
      currentCommitteeName = normalizedName;
      committees.push({
        code,
        name: normalizedName,
        isSubcommittee: false,
      });
      continue;
    }

    committees.push({
      code,
      name: normalizedName,
      parentCommitteeName: currentCommitteeName,
      isSubcommittee: true,
    });
  }

  return {
    sourceDocument,
    officialWebsiteUrl: websiteMatch?.[1],
    swornInDate: normalizeHouseDate(oathMatch?.[1]),
    committees,
  };
}

function normalizeHouseDate(rawDate?: string): string | undefined {
  if (!rawDate) {
    return undefined;
  }

  const cleaned = rawDate.replace(/\./g, "").trim();
  const parsed = new Date(`${cleaned} UTC`);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed.toISOString().slice(0, 10);
}

export function buildHouseCommitteeAssignments(
  termId: string,
  bioguideId: string,
  detail: HouseProfileDetail,
): CommitteeAssignmentRecord[] {
  return detail.committees.map((committee, index) => ({
    id: `committee-house-${bioguideId.toLowerCase()}-${index + 1}`,
    memberTermId: termId,
    committeeName: committee.name,
    committeeCode: committee.code,
    parentCommitteeName: committee.parentCommitteeName,
    isSubcommittee: committee.isSubcommittee,
    sourceDocumentId: detail.sourceDocument.id,
  }));
}
