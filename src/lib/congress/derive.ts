import { CHAMBER_LABELS, FEATURED_STATE_CODES, PARTY_LABELS } from "@/lib/congress/constants";
import type {
  CongressDataset,
  FeaturedState,
  HomeReadModel,
  LegacyBillCard,
  LegacyMemberCard,
  LegacyVoteCard,
  MemberReadModel,
  MemberRecord,
  MemberTermRecord,
  MemberVoteStats,
  OverviewStat,
  StateDirectoryEntry,
  StateReadModel,
  VotePositionRecord,
} from "@/lib/congress/domain";
import { formatDate, formatDurationBetween, formatPercentage, normalizeWhitespace } from "@/lib/congress/utils";

type MemberJoin = {
  member: MemberRecord;
  term: MemberTermRecord;
};

export function deriveMemberVoteStats(dataset: CongressDataset, memberId: string): MemberVoteStats {
  const positions = dataset.votePositions.filter((position) => position.memberId === memberId);

  if (positions.length === 0) {
    return {
      totalVotes: 0,
      yeaCount: 0,
      nayCount: 0,
      presentCount: 0,
      notVotingCount: 0,
      participationRate: null,
    };
  }

  const counts = positions.reduce(
    (accumulator, position) => {
      if (position.positionCode === "yea") {
        accumulator.yeaCount += 1;
      }

      if (position.positionCode === "nay") {
        accumulator.nayCount += 1;
      }

      if (position.positionCode === "present") {
        accumulator.presentCount += 1;
      }

      if (position.positionCode === "not_voting") {
        accumulator.notVotingCount += 1;
      }

      return accumulator;
    },
    {
      yeaCount: 0,
      nayCount: 0,
      presentCount: 0,
      notVotingCount: 0,
    },
  );

  const participated = positions.length - counts.notVotingCount;

  return {
    totalVotes: positions.length,
    ...counts,
    participationRate: positions.length === 0 ? null : (participated / positions.length) * 100,
  };
}

export function deriveFeaturedStates(dataset: CongressDataset): FeaturedState[] {
  const activeTerms = dataset.memberTerms.filter((term) => term.isActive);

  return FEATURED_STATE_CODES.map((stateCode) => {
    const matchingTerms = activeTerms.filter((term) => term.stateCode === stateCode);
    const stateName = matchingTerms[0]?.stateName ?? stateCode;
    const senators = matchingTerms.filter((term) => term.chamber === "senate").length;
    const representatives = matchingTerms.filter((term) => term.chamber === "house").length;
    const splitParts = [
      `${senators} senator${senators === 1 ? "" : "s"}`,
      `${representatives} representative${representatives === 1 ? "" : "s"}`,
    ];

    return {
      code: stateCode,
      name: stateName,
      delegationCount: matchingTerms.length,
      split: splitParts.join(", "),
    };
  });
}

export function deriveOverviewStats(dataset: CongressDataset): OverviewStat[] {
  const activeTerms = dataset.memberTerms.filter((term) => term.isActive);
  const houseCount = activeTerms.filter((term) => term.chamber === "house").length;
  const senateCount = activeTerms.filter((term) => term.chamber === "senate").length;
  const voteCount = dataset.votes.length;
  const currentProfileCount = dataset.members.filter((member) => member.isCurrentMember).length;

  return [
    { label: "Current House members", value: houseCount.toLocaleString("en-US") },
    { label: "Current senators", value: senateCount.toLocaleString("en-US") },
    { label: "Tracked roll call votes", value: voteCount.toLocaleString("en-US") },
    { label: "Source-linked member profiles", value: currentProfileCount.toLocaleString("en-US") },
  ];
}

function joinCurrentMembers(dataset: CongressDataset): MemberJoin[] {
  const activeTerms = dataset.memberTerms.filter((term) => term.isActive);

  return activeTerms
    .map((term) => {
      const member = dataset.members.find((record) => record.id === term.memberId);
      if (!member) {
        return null;
      }

      return { member, term };
    })
    .filter((value): value is MemberJoin => value !== null)
    .sort((left, right) => left.member.fullName.localeCompare(right.member.fullName));
}

export function deriveStateDirectory(dataset: CongressDataset): StateDirectoryEntry[] {
  const activeTerms = dataset.memberTerms.filter((term) => term.isActive);
  const grouped = new Map<
    string,
    {
      code: string;
      name: string;
      memberCount: number;
      senators: number;
      representatives: number;
    }
  >();

  for (const term of activeTerms) {
    const existing = grouped.get(term.stateCode) ?? {
      code: term.stateCode,
      name: term.stateName,
      memberCount: 0,
      senators: 0,
      representatives: 0,
    };

    existing.memberCount += 1;
    if (term.chamber === "senate") {
      existing.senators += 1;
    } else {
      existing.representatives += 1;
    }

    grouped.set(term.stateCode, existing);
  }

  return [...grouped.values()].sort((left, right) => left.name.localeCompare(right.name));
}

function collectMemberCommittees(dataset: CongressDataset, memberTermId: string): string[] {
  return dataset.committeeAssignments
    .filter((assignment) => assignment.memberTermId === memberTermId && !assignment.isSubcommittee)
    .map((assignment) => assignment.committeeName);
}

function recentFocusText(memberJoin: MemberJoin, sponsorshipTitles: string[], recentVoteTitle?: string): string {
  const pieces = [memberJoin.term.seatLabel];

  if (sponsorshipTitles.length > 0) {
    pieces.push(`Sponsor of ${sponsorshipTitles[0]}`);
  }

  if (recentVoteTitle) {
    pieces.push(`recently tracked in ${recentVoteTitle}`);
  }

  return pieces.join("; ");
}

export function deriveLegacyMemberCard(dataset: CongressDataset, memberJoin: MemberJoin): LegacyMemberCard {
  const voteStats = deriveMemberVoteStats(dataset, memberJoin.member.id);
  const committees = collectMemberCommittees(dataset, memberJoin.term.id);
  const sponsorTitles = dataset.billSponsorships
    .filter((sponsorship) => sponsorship.memberId === memberJoin.member.id && sponsorship.sponsorshipType === "sponsor")
    .map((sponsorship) => dataset.bills.find((bill) => bill.id === sponsorship.billId)?.shortTitle ?? "")
    .filter(Boolean);
  const latestVote = dataset.votes
    .filter((vote) => dataset.votePositions.some((position) => position.voteId === vote.id && position.memberId === memberJoin.member.id))
    .sort((left, right) => right.voteDate.localeCompare(left.voteDate))[0];

  return {
    slug: memberJoin.member.slug,
    name: memberJoin.member.fullName,
    chamber: CHAMBER_LABELS[memberJoin.member.chamber],
    party: PARTY_LABELS[memberJoin.term.partyCode],
    state: memberJoin.term.stateCode,
    stateName: memberJoin.term.stateName,
    district: memberJoin.term.districtLabel ? `${memberJoin.term.stateCode}-${memberJoin.term.districtLabel}` : undefined,
    roleLabel: memberJoin.term.seatLabel,
    termEndsOn: formatDate(memberJoin.term.termEndDate),
    timeInOffice: formatDurationBetween(memberJoin.term.serviceStartDate ?? memberJoin.term.termStartDate),
    participationRate: formatPercentage(voteStats.participationRate),
    missedVotes: voteStats.notVotingCount,
    committees,
    recentFocus: recentFocusText(memberJoin, sponsorTitles, latestVote?.title),
  };
}

export function deriveLegacyVoteCard(dataset: CongressDataset, voteId: string): LegacyVoteCard | null {
  const vote = dataset.votes.find((entry) => entry.id === voteId);
  if (!vote) {
    return null;
  }

  const relatedBill = vote.relatedBillId
    ? dataset.bills.find((bill) => bill.id === vote.relatedBillId)
    : undefined;
  const summary = relatedBill?.shortTitle ?? normalizeWhitespace(vote.question);

  return {
    slug: vote.slug,
    title: vote.title,
    chamber: CHAMBER_LABELS[vote.chamber],
    result: vote.resultText,
    heldOn: formatDate(vote.voteDate),
    rollCall: `Roll Call ${vote.rollCallNumber}`,
    summary,
  };
}

export function deriveLegacyBillCard(dataset: CongressDataset, billId: string): LegacyBillCard | null {
  const bill = dataset.bills.find((entry) => entry.id === billId);
  if (!bill) {
    return null;
  }

  const sponsor = dataset.billSponsorships.find(
    (sponsorship) => sponsorship.billId === billId && sponsorship.sponsorshipType === "sponsor",
  );
  const sponsorName = sponsor
    ? dataset.members.find((member) => member.id === sponsor.memberId)?.fullName ?? "Unknown sponsor"
    : "Unknown sponsor";

  return {
    slug: bill.slug,
    number: `${bill.billType.toUpperCase().replace("HR", "H.R.").replace("S", "S.")} ${bill.billNumber}`,
    title: bill.shortTitle ?? bill.officialTitle,
    status: bill.statusLabel,
    sponsor: sponsorName,
    chamber: CHAMBER_LABELS[bill.originChamber],
  };
}

function deriveRecentVoteCards(dataset: CongressDataset, limit = 6): LegacyVoteCard[] {
  return [...dataset.votes]
    .sort((left, right) => right.voteDate.localeCompare(left.voteDate))
    .slice(0, limit)
    .map((vote) => deriveLegacyVoteCard(dataset, vote.id))
    .filter((vote): vote is LegacyVoteCard => vote !== null);
}

function deriveFeaturedBillCards(dataset: CongressDataset, limit = 6): LegacyBillCard[] {
  return [...dataset.bills]
    .sort((left, right) => right.latestActionDate.localeCompare(left.latestActionDate))
    .slice(0, limit)
    .map((bill) => deriveLegacyBillCard(dataset, bill.id))
    .filter((bill): bill is LegacyBillCard => bill !== null);
}

export function deriveBillCards(dataset: CongressDataset, limit = dataset.bills.length): LegacyBillCard[] {
  return deriveFeaturedBillCards(dataset, limit);
}

export function deriveVoteCards(dataset: CongressDataset, limit = dataset.votes.length): LegacyVoteCard[] {
  return deriveRecentVoteCards(dataset, limit);
}

export function deriveHomeReadModel(dataset: CongressDataset): HomeReadModel {
  return {
    generatedAt: dataset.metadata.generatedAt,
    sourceMode: dataset.metadata.origin,
    completeness: dataset.metadata.completeness,
    overviewStats: deriveOverviewStats(dataset),
    featuredStates: deriveFeaturedStates(dataset),
    recentVotes: deriveRecentVoteCards(dataset, 3),
    featuredBills: deriveFeaturedBillCards(dataset, 4),
  };
}

export function deriveStateReadModel(dataset: CongressDataset, stateCode: string): StateReadModel | null {
  const normalizedState = stateCode.trim().toUpperCase();
  const memberJoins = joinCurrentMembers(dataset).filter((join) => join.term.stateCode === normalizedState);

  if (memberJoins.length === 0) {
    return null;
  }

  const memberIds = new Set(memberJoins.map((join) => join.member.id));
  const billCards = dataset.billSponsorships
    .filter((sponsorship) => memberIds.has(sponsorship.memberId) && sponsorship.sponsorshipType === "sponsor")
    .map((sponsorship) => deriveLegacyBillCard(dataset, sponsorship.billId))
    .filter((bill): bill is LegacyBillCard => bill !== null);

  const voteCards = dataset.votePositions
    .filter((position) => memberIds.has(position.memberId))
    .map((position) => deriveLegacyVoteCard(dataset, position.voteId))
    .filter((vote): vote is LegacyVoteCard => vote !== null)
    .filter((vote, index, collection) => collection.findIndex((entry) => entry.slug === vote.slug) === index)
    .slice(0, 6);

  return {
    stateCode: normalizedState,
    stateName: memberJoins[0].term.stateName,
    generatedAt: dataset.metadata.generatedAt,
    memberCards: memberJoins.map((join) => deriveLegacyMemberCard(dataset, join)),
    sponsoredBills: billCards,
    recentVotes: voteCards,
    stats: {
      totalMembers: memberJoins.length,
      senators: memberJoins.filter((join) => join.term.chamber === "senate").length,
      representatives: memberJoins.filter((join) => join.term.chamber === "house").length,
    },
  };
}

export function deriveMemberReadModel(dataset: CongressDataset, slug: string): MemberReadModel | null {
  const memberJoin = joinCurrentMembers(dataset).find((join) => join.member.slug === slug);
  if (!memberJoin) {
    return null;
  }

  const stats = deriveMemberVoteStats(dataset, memberJoin.member.id);
  const sponsorships = dataset.billSponsorships
    .filter((sponsorship) => sponsorship.memberId === memberJoin.member.id && sponsorship.sponsorshipType === "sponsor")
    .map((sponsorship) => deriveLegacyBillCard(dataset, sponsorship.billId))
    .filter((bill): bill is LegacyBillCard => bill !== null);
  const recentVotes = dataset.votePositions
    .filter((position) => position.memberId === memberJoin.member.id)
    .map((position) => deriveLegacyVoteCard(dataset, position.voteId))
    .filter((vote): vote is LegacyVoteCard => vote !== null);

  return {
    generatedAt: dataset.metadata.generatedAt,
    memberCard: deriveLegacyMemberCard(dataset, memberJoin),
    sourceMode: dataset.metadata.origin,
    sponsorships,
    recentVotes,
    stats,
  };
}

export function getVotePositionForMember(
  positions: VotePositionRecord[],
  voteId: string,
  memberId: string,
): VotePositionRecord | undefined {
  return positions.find((position) => position.voteId === voteId && position.memberId === memberId);
}
