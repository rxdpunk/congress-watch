export type ChamberCode = "house" | "senate";
export type PartyCode = "D" | "I" | "R";
export type SponsorshipType = "sponsor" | "cosponsor";
export type VotePositionCode = "yea" | "nay" | "present" | "not_voting";
export type DataOrigin = "seed" | "live" | "hybrid";
export type DatasetCompleteness = "full" | "partial";
export type ImportRunStatus = "succeeded" | "failed" | "partial";

export type SourceDocument = {
  id: string;
  sourceSystem: "house-clerk" | "senate" | "congress-gov" | "seed";
  sourceType: string;
  externalId?: string;
  url: string;
  retrievedAt: string;
  note?: string;
};

export type CongressRecord = {
  number: number;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
};

export type SessionRecord = {
  congressNumber: number;
  sessionNumber: number;
  label: string;
  startDate?: string;
  endDate?: string;
};

export type MemberRecord = {
  id: string;
  bioguideId: string;
  slug: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  fullName: string;
  officialWebsiteUrl?: string;
  congressProfileUrl?: string;
  chamber: ChamberCode;
  isCurrentMember: boolean;
};

export type MemberTermRecord = {
  id: string;
  memberId: string;
  chamber: ChamberCode;
  congressNumber: number;
  stateCode: string;
  stateName: string;
  district?: number;
  districtLabel?: string;
  senateClass?: 1 | 2 | 3;
  partyCode: PartyCode;
  termStartDate: string;
  termEndDate: string;
  swornInDate?: string;
  serviceStartDate?: string;
  isActive: boolean;
  seatLabel: string;
  sourceDocumentIds: string[];
};

export type CommitteeAssignmentRecord = {
  id: string;
  memberTermId: string;
  committeeName: string;
  committeeCode?: string;
  parentCommitteeName?: string;
  isSubcommittee: boolean;
  sourceDocumentId: string;
};

export type BillRecord = {
  id: string;
  slug: string;
  congressNumber: number;
  billType: string;
  billNumber: number;
  originChamber: ChamberCode;
  officialTitle: string;
  shortTitle?: string;
  policyArea?: string;
  introducedDate: string;
  latestActionText: string;
  latestActionDate: string;
  statusLabel: string;
  congressUrl: string;
  sourceDocumentId: string;
};

export type BillSponsorshipRecord = {
  id: string;
  billId: string;
  memberId: string;
  sponsorshipType: SponsorshipType;
  isPrimary: boolean;
  sponsorshipDate?: string;
  sourceDocumentId: string;
};

export type VoteRecord = {
  id: string;
  slug: string;
  chamber: ChamberCode;
  congressNumber: number;
  sessionNumber: number;
  rollCallNumber: number;
  voteDate: string;
  title: string;
  question: string;
  resultText: string;
  voteType?: string;
  officialSourceUrl: string;
  relatedBillId?: string;
  sourceDocumentId: string;
};

export type VotePositionRecord = {
  id: string;
  voteId: string;
  memberId: string;
  memberTermId?: string;
  positionCode: VotePositionCode;
  positionLabel: string;
  sourceDocumentId: string;
};

export type ImportRunRecord = {
  id: string;
  pipelineName: string;
  status: ImportRunStatus;
  startedAt: string;
  completedAt?: string;
  recordsSeen: number;
  recordsInserted: number;
  recordsUpdated: number;
  recordsFailed: number;
  errorSummary?: string;
  metadata?: Record<string, string | number | boolean>;
};

export type CongressDataset = {
  metadata: {
    title: string;
    origin: DataOrigin;
    completeness: DatasetCompleteness;
    generatedAt: string;
    currentCongress: number;
    currentSession: number;
    lastSuccessfulSyncAt: string;
    officialSources: string[];
    warnings: string[];
  };
  congresses: CongressRecord[];
  sessions: SessionRecord[];
  sourceDocuments: SourceDocument[];
  members: MemberRecord[];
  memberTerms: MemberTermRecord[];
  committeeAssignments: CommitteeAssignmentRecord[];
  bills: BillRecord[];
  billSponsorships: BillSponsorshipRecord[];
  votes: VoteRecord[];
  votePositions: VotePositionRecord[];
  importRuns: ImportRunRecord[];
};

export type MemberVoteStats = {
  totalVotes: number;
  yeaCount: number;
  nayCount: number;
  presentCount: number;
  notVotingCount: number;
  participationRate: number | null;
};

export type OverviewStat = {
  label: string;
  value: string;
};

export type FeaturedState = {
  code: string;
  name: string;
  delegationCount: number;
  split: string;
};

export type LegacyMemberCard = {
  slug: string;
  name: string;
  chamber: "House" | "Senate";
  party: "Democrat" | "Republican" | "Independent";
  state: string;
  stateName: string;
  district?: string;
  roleLabel: string;
  termEndsOn: string;
  timeInOffice: string;
  participationRate: string;
  missedVotes: number;
  committees: string[];
  recentFocus: string;
};

export type LegacyVoteCard = {
  slug: string;
  title: string;
  chamber: "House" | "Senate";
  result: string;
  heldOn: string;
  rollCall: string;
  summary: string;
};

export type LegacyBillCard = {
  slug: string;
  number: string;
  title: string;
  status: string;
  sponsor: string;
  chamber: "House" | "Senate";
};

export type HomeReadModel = {
  generatedAt: string;
  sourceMode: DataOrigin;
  completeness: DatasetCompleteness;
  overviewStats: OverviewStat[];
  featuredStates: FeaturedState[];
  recentVotes: LegacyVoteCard[];
  featuredBills: LegacyBillCard[];
};

export type StateReadModel = {
  stateCode: string;
  stateName: string;
  generatedAt: string;
  memberCards: LegacyMemberCard[];
  sponsoredBills: LegacyBillCard[];
  recentVotes: LegacyVoteCard[];
  stats: {
    totalMembers: number;
    senators: number;
    representatives: number;
  };
};

export type MemberReadModel = {
  generatedAt: string;
  memberCard: LegacyMemberCard;
  sourceMode: DataOrigin;
  sponsorships: LegacyBillCard[];
  recentVotes: LegacyVoteCard[];
  stats: MemberVoteStats;
};

export type StateDirectoryEntry = {
  code: string;
  name: string;
  memberCount: number;
  senators: number;
  representatives: number;
};
