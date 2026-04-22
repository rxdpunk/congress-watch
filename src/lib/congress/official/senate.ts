import { STATE_NAMES } from "@/lib/congress/constants";
import type { CommitteeAssignmentRecord, MemberRecord, MemberTermRecord, SourceDocument } from "@/lib/congress/domain";
import { createMemberSlug, currentSenateTermWindow, normalizeWhitespace } from "@/lib/congress/utils";

const SENATE_CONTACT_URL = "https://www.senate.gov/general/contact_information/senators_cfm.xml";
const SENATE_MEMBERSHIP_URL = "https://www.senate.gov/legislative/LIS_MEMBER/cvc_member_data.xml";

type SenateLiveResult = {
  sourceDocuments: SourceDocument[];
  members: MemberRecord[];
  memberTerms: MemberTermRecord[];
  committeeAssignments: CommitteeAssignmentRecord[];
  generatedAt: string;
};

type SenateMemberCommitteeInfo = {
  bioguideId: string;
  committees: { code?: string; name: string }[];
};

function matchTag(block: string, tag: string): string | undefined {
  const match = block.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
  return match ? normalizeWhitespace(match[1]) : undefined;
}

function parseSenateClass(label: string): 1 | 2 | 3 {
  if (label.includes("III")) {
    return 3;
  }

  if (label.includes("II")) {
    return 2;
  }

  return 1;
}

function parseSenateContactMembers(xml: string, retrievedAt: string) {
  const members: MemberRecord[] = [];
  const terms: MemberTermRecord[] = [];
  const sourceDocuments: SourceDocument[] = [
    {
      id: "src-senate-contact-current",
      sourceSystem: "senate",
      sourceType: "contact-list",
      url: SENATE_CONTACT_URL,
      retrievedAt,
    },
  ];

  for (const match of xml.matchAll(/<member>([\s\S]*?)<\/member>/g)) {
    const block = match[1];
    const bioguideId = matchTag(block, "bioguide_id");
    const firstName = matchTag(block, "first_name");
    const lastName = matchTag(block, "last_name");
    const party = matchTag(block, "party") as MemberTermRecord["partyCode"] | undefined;
    const state = matchTag(block, "state");
    const website = matchTag(block, "website");
    const senateClassLabel = matchTag(block, "class");

    if (!bioguideId || !firstName || !lastName || !party || !state || !senateClassLabel) {
      continue;
    }

    const senateClass = parseSenateClass(senateClassLabel);
    const memberId = `member-senate-${bioguideId.toLowerCase()}`;
    const termId = `term-senate-${bioguideId.toLowerCase()}-current`;
    const fullName = `${firstName} ${lastName}`.replace(/\s+/g, " ").trim();
    const termWindow = currentSenateTermWindow(senateClass);

    members.push({
      id: memberId,
      bioguideId,
      slug: createMemberSlug({
        firstName,
        lastName,
        stateCode: state,
        chamber: "senate",
      }),
      firstName,
      lastName,
      fullName,
      officialWebsiteUrl: website,
      congressProfileUrl: `https://www.congress.gov/member/${fullName.replace(/\s+/g, "-")}/${bioguideId}`,
      chamber: "senate",
      isCurrentMember: true,
    });

    terms.push({
      id: termId,
      memberId,
      chamber: "senate",
      congressNumber: 119,
      stateCode: state,
      stateName: STATE_NAMES[state] ?? state,
      senateClass,
      partyCode: party,
      termStartDate: termWindow.termStartDate,
      termEndDate: termWindow.termEndDate,
      isActive: true,
      seatLabel: `United States Senator from ${STATE_NAMES[state] ?? state}`,
      sourceDocumentIds: ["src-senate-contact-current"],
    });
  }

  return { members, terms, sourceDocuments };
}

function parseSenateMembership(xml: string, retrievedAt: string): {
  sourceDocuments: SourceDocument[];
  committeeInfoByBioguideId: Map<string, SenateMemberCommitteeInfo>;
} {
  const sourceDocuments: SourceDocument[] = [
    {
      id: "src-senate-membership-current",
      sourceSystem: "senate",
      sourceType: "committee-memberships",
      url: SENATE_MEMBERSHIP_URL,
      retrievedAt,
    },
  ];
  const committeeInfoByBioguideId = new Map<string, SenateMemberCommitteeInfo>();

  for (const match of xml.matchAll(/<senator[^>]*>([\s\S]*?)<\/senator>/g)) {
    const block = match[1];
    const bioguideId = matchTag(block, "bioguideId");
    if (!bioguideId) {
      continue;
    }

    const committees = [...block.matchAll(/<committee(?:\s+code="([^"]+)")?(?:\s+position="[^"]+")?>([\s\S]*?)<\/committee>/g)].map(
      ([, code, name]) => ({
        code,
        name: normalizeWhitespace(name),
      }),
    );

    committeeInfoByBioguideId.set(bioguideId, {
      bioguideId,
      committees,
    });
  }

  return { sourceDocuments, committeeInfoByBioguideId };
}

export async function fetchLiveSenateRoster(fetchImpl: typeof fetch = fetch): Promise<SenateLiveResult> {
  const [contactResponse, membershipResponse] = await Promise.all([
    fetchImpl(SENATE_CONTACT_URL, { next: { revalidate: 3600 } }),
    fetchImpl(SENATE_MEMBERSHIP_URL, { next: { revalidate: 3600 } }),
  ]);

  if (!contactResponse.ok) {
    throw new Error(`Failed to fetch Senate contact feed: ${contactResponse.status}`);
  }

  if (!membershipResponse.ok) {
    throw new Error(`Failed to fetch Senate membership feed: ${membershipResponse.status}`);
  }

  const retrievedAt = new Date().toISOString();
  const [contactXml, membershipXml] = await Promise.all([contactResponse.text(), membershipResponse.text()]);
  const contactData = parseSenateContactMembers(contactXml, retrievedAt);
  const membershipData = parseSenateMembership(membershipXml, retrievedAt);

  const committeeAssignments: CommitteeAssignmentRecord[] = [];
  for (const term of contactData.terms) {
    const member = contactData.members.find((entry) => entry.id === term.memberId);
    if (!member) {
      continue;
    }

    const committeeInfo = membershipData.committeeInfoByBioguideId.get(member.bioguideId);
    if (!committeeInfo) {
      continue;
    }

    committeeInfo.committees.forEach((committee, index) => {
      committeeAssignments.push({
        id: `committee-${term.id}-${index + 1}`,
        memberTermId: term.id,
        committeeName: committee.name,
        committeeCode: committee.code,
        isSubcommittee: false,
        sourceDocumentId: "src-senate-membership-current",
      });
    });
  }

  return {
    sourceDocuments: [...contactData.sourceDocuments, ...membershipData.sourceDocuments],
    members: contactData.members,
    memberTerms: contactData.terms,
    committeeAssignments,
    generatedAt: retrievedAt,
  };
}
