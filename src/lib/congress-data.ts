import { unstable_cache } from "next/cache";
import { XMLParser } from "fast-xml-parser";

export type Chamber = "house" | "senate";
export type PartyCode = "D" | "R" | "I";

export type CommitteeAssignment = {
  code: string;
  name: string;
  role?: string;
};

export type Member = {
  bioguideId: string;
  slug: string;
  firstName: string;
  lastName: string;
  fullName: string;
  sortName: string;
  chamber: Chamber;
  partyCode: PartyCode;
  partyName: string;
  stateCode: string;
  stateName: string;
  stateSlug: string;
  district: number | null;
  districtLabel: string | null;
  senateClass: string | null;
  seatLabel: string;
  roleLabel: string;
  officialWebsiteUrl: string | null;
  officeAddress: string | null;
  officePhone: string | null;
  hometown: string | null;
  lisMemberId: string | null;
  committees: CommitteeAssignment[];
  termStartDate: string | null;
  termEndDate: string | null;
};

export type VotePosition = {
  memberId: string;
  memberName: string;
  partyCode: PartyCode;
  stateCode: string;
  vote: string;
};

export type Vote = {
  chamber: Chamber;
  congress: number;
  session: number;
  calendarYear: number;
  rollCallNumber: number;
  slug: string;
  title: string;
  question: string;
  issue: string | null;
  result: string;
  dateLabel: string;
  timestamp: string;
  sourceUrl: string;
  officialUrl: string;
  positions: VotePosition[];
  yeaCount: number | null;
  nayCount: number | null;
  presentCount: number | null;
  notVotingCount: number | null;
};

export type Bill = {
  congress: number;
  billType: string;
  billNumber: number;
  idLabel: string;
  title: string;
  policyArea: string | null;
  introducedDate: string | null;
  latestActionDate: string | null;
  latestActionText: string | null;
  originChamber: string | null;
  sponsorName: string | null;
  sponsorBioguideId: string | null;
  sourceUrl: string;
};

export type BillDetail = Bill & {
  summary: string | null;
  cosponsorsCount: number | null;
  latestActions: Array<{
    actionDate: string | null;
    actionText: string;
  }>;
  subjects: string[];
};

export type SiteOverview = {
  currentCongress: number;
  houseMembers: number;
  senateMembers: number;
  totalMembers: number;
  statesCount: number;
  recentVoteCount: number;
  missedVoteCount: number;
  lastUpdated: string;
};

const XML = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  trimValues: true,
  parseTagValue: false,
});

const DAY = 60 * 60 * 24;
const HOUR = 60 * 60;
const SIX_HOURS = HOUR * 6;
const CONGRESS_API_KEY = process.env.CONGRESS_API_KEY ?? "DEMO_KEY";

const STATE_NAMES: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
};

function asArray<T>(value: T | T[] | undefined | null): T[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stateCodeToSlug(code: string) {
  return slugify(STATE_NAMES[code] ?? code);
}

function buildMemberSlug(fullName: string, stateCode: string, chamber: Chamber, district: number | null) {
  const suffix = chamber === "house" ? `${stateCode.toLowerCase()}-${district === 0 ? "at-large" : district}` : stateCode.toLowerCase();
  return `${slugify(fullName)}-${suffix}`;
}

function partyNameFromCode(code: string): string {
  if (code === "D") return "Democrat";
  if (code === "R") return "Republican";
  return "Independent";
}

function formatDistrictLabel(stateCode: string, district: number | null) {
  if (district == null) return null;
  if (district === 0) return `${stateCode} At-Large`;
  return `${stateCode}-${String(district).padStart(2, "0")}`;
}

function deriveHouseTermEndDate(termStartDate: string | null) {
  if (!termStartDate) return null;
  const year = Number(termStartDate.slice(0, 4));
  return `${year + 2}-01-03`;
}

function deriveSenateTermEndDate(senateClass: string | null, currentCongress: number) {
  if (!senateClass) return null;
  const classNumber = Number(senateClass.replace(/[^\d]/g, ""));
  if (!Number.isFinite(classNumber) || classNumber < 1 || classNumber > 3) {
    return null;
  }

  const congressStartYear = 1789 + (currentCongress - 1) * 2;
  let year = congressStartYear;
  while ((((year - 1789) / 2) % 3 + 1) !== classNumber) {
    year += 2;
  }
  return `${year + 6}-01-03`;
}

function parseDate(value: string | null | undefined) {
  if (!value) return null;
  const trimmed = value.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  if (/^\d{8}$/.test(trimmed)) {
    return `${trimmed.slice(0, 4)}-${trimmed.slice(4, 6)}-${trimmed.slice(6, 8)}`;
  }

  const parsed = Date.parse(trimmed);
  if (Number.isNaN(parsed)) return null;
  return new Date(parsed).toISOString().slice(0, 10);
}

function parseTimestamp(value: string | null | undefined) {
  if (!value) return null;
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return null;
  return new Date(parsed).toISOString();
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function toTitleBillType(type: string) {
  return type.toLowerCase();
}

async function fetchText(url: string, revalidate: number) {
  const response = await fetch(url, {
    next: { revalidate },
    headers: {
      "User-Agent": "Congress Ledger/1.0",
      Accept: "application/json, text/xml, application/xml, text/html;q=0.9",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return response.text();
}

async function fetchJson<T>(url: string, revalidate: number) {
  const response = await fetch(url, {
    next: { revalidate },
    headers: {
      "User-Agent": "Congress Ledger/1.0",
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return (await response.json()) as T;
}

export function parseHouseVoteIndexHtml(html: string, year: number) {
  const rows = [...html.matchAll(/<TR><TD><A HREF="http:\/\/clerk\.house\.gov\/cgi-bin\/vote\.asp\?year=\d+&rollnumber=(\d+)">(\d+)<\/A><\/TD>\s*<TD><FONT FACE="Arial" SIZE="-1">([^<]+)<\/FONT><\/TD>\s*<TD><FONT FACE="Arial" SIZE="-1">([\s\S]*?)<\/FONT><\/TD>\s*<TD><FONT FACE="Arial" SIZE="-1">([\s\S]*?)<\/FONT><\/TD>\s*<TD ALIGN="CENTER"><FONT FACE="Arial" SIZE="-1">([^<]+)<\/FONT><\/TD>\s*<TD><FONT FACE="Arial" SIZE="-1">([\s\S]*?)<\/FONT><\/TD><\/TR>/gi)];

  return rows.map((match) => ({
    calendarYear: year,
    rollCallNumber: Number(match[1]),
    dateLabel: stripHtml(match[3]),
    issue: stripHtml(match[4]) || null,
    question: stripHtml(match[5]),
    result: stripHtml(match[6]),
    title: stripHtml(match[7]),
  }));
}

export function parseHouseVoteXml(xml: string, sourceUrl: string): Vote {
  const parsed = XML.parse(xml);
  const root = parsed["rollcall-vote"];
  const metadata = root["vote-metadata"];
  const totals = metadata["vote-totals"]?.["totals-by-vote"];
  const recordedVotes = asArray(root["vote-data"]?.["recorded-vote"]);
  const congress = Number(metadata.congress);
  const session = Number(String(metadata.session).replace(/\D/g, "")) || 1;
  const calendarYear = Number(sourceUrl.match(/\/evs\/(\d{4})\//)?.[1] ?? new Date().getUTCFullYear());
  const rollCallNumber = Number(metadata["rollcall-num"]);
  const actionDate = String(metadata["action-date"] ?? "").trim();
  const actionTime = String(metadata["action-time"]?.["#text"] ?? metadata["action-time"] ?? "12:00 AM").trim();
  const timestamp = parseTimestamp(`${actionDate} ${actionTime} ET`) ?? `${calendarYear}-01-01T00:00:00.000Z`;

  const positions: VotePosition[] = recordedVotes.map((entry) => ({
    memberId: String(entry.legislator?.["name-id"] ?? ""),
    memberName: String(entry.legislator?.["#text"] ?? entry.legislator ?? "").trim(),
    partyCode: String(entry.legislator?.party ?? "I") as PartyCode,
    stateCode: String(entry.legislator?.state ?? ""),
    vote: String(entry.vote ?? "").trim(),
  }));

  return {
    chamber: "house",
    congress,
    session,
    calendarYear,
    rollCallNumber,
    slug: `house-${congress}-${session}-${rollCallNumber}`,
    title: String(metadata["vote-desc"] ?? metadata["legis-num"] ?? "House Vote"),
    question: String(metadata["vote-question"] ?? ""),
    issue: String(metadata["legis-num"] ?? "").trim() || null,
    result: String(metadata["vote-result"] ?? ""),
    dateLabel: actionDate,
    timestamp,
    sourceUrl,
    officialUrl: `https://clerk.house.gov/Votes/${calendarYear}${String(rollCallNumber).padStart(3, "0")}`,
    positions,
    yeaCount: totals?.yea_total ? Number(totals.yea_total) : null,
    nayCount: totals?.nay_total ? Number(totals.nay_total) : null,
    presentCount: totals?.present_total ? Number(totals.present_total) : null,
    notVotingCount: totals?.not_voting_total ? Number(totals.not_voting_total) : null,
  };
}

export function parseSenateVoteMenuXml(xml: string) {
  const parsed = XML.parse(xml);
  const root = parsed.vote_summary;
  const congress = Number(root.congress);
  const session = Number(root.session);
  const calendarYear = Number(root.congress_year);
  const votes = asArray(root.votes?.vote);

  return votes.map((vote) => ({
    congress,
    session,
    calendarYear,
    rollCallNumber: Number(vote.vote_number),
    dateLabel: String(vote.vote_date),
    issue: String(vote.issue ?? "").trim() || null,
    question: stripHtml(String(vote.question ?? "")),
    result: stripHtml(String(vote.result ?? "")),
    title: stripHtml(String(vote.title ?? "Senate Vote")),
  }));
}

export function parseSenateVoteXml(xml: string, sourceUrl: string): Vote {
  const parsed = XML.parse(xml);
  const root = parsed.roll_call_vote;
  const congress = Number(root.congress);
  const session = Number(root.session);
  const calendarYear = Number(root.congress_year);
  const rollCallNumber = Number(root.vote_number);
  const positions = asArray(root.members?.member).map((member) => ({
    memberId: String(member.lis_member_id ?? ""),
    memberName: stripHtml(String(member.member_full ?? `${member.first_name ?? ""} ${member.last_name ?? ""}`)),
    partyCode: String(member.party ?? "I") as PartyCode,
    stateCode: String(member.state ?? ""),
    vote: String(member.vote_cast ?? "").trim(),
  }));
  const timestamp = parseTimestamp(String(root.vote_date)) ?? `${calendarYear}-01-01T00:00:00.000Z`;
  const document = root.document;
  const issue = document?.document_type && document?.document_number ? `${document.document_type} ${document.document_number}` : null;

  return {
    chamber: "senate",
    congress,
    session,
    calendarYear,
    rollCallNumber,
    slug: `senate-${congress}-${session}-${rollCallNumber}`,
    title: String(root.vote_title ?? "Senate Vote"),
    question: stripHtml(String(root.question ?? root.vote_question_text ?? "")),
    issue,
    result: String(root.vote_result_text ?? root.vote_result ?? ""),
    dateLabel: String(root.vote_date ?? ""),
    timestamp,
    sourceUrl,
    officialUrl: `https://www.senate.gov/legislative/LIS/roll_call_votes/vote${congress}${session}/vote_${congress}_${session}_${String(rollCallNumber).padStart(5, "0")}.xml`,
    positions,
    yeaCount: root.vote_tally?.yeas ? Number(root.vote_tally.yeas) : null,
    nayCount: root.vote_tally?.nays ? Number(root.vote_tally.nays) : null,
    presentCount: null,
    notVotingCount: null,
  };
}

export function parseHouseRosterXml(xml: string) {
  const parsed = XML.parse(xml);
  const root = parsed.MemberData;
  const congress = Number(root["title-info"]?.["congress-num"] ?? 119);
  const committeeCatalog = new Map<string, string>();
  const subcommitteeCatalog = new Map<string, string>();

  for (const committee of asArray(root.committees?.committee)) {
    committeeCatalog.set(String(committee.comcode), String(committee["committee-fullname"] ?? committee.comcode));
    for (const subcommittee of asArray(committee.subcommittee)) {
      subcommitteeCatalog.set(
        String(subcommittee.subcomcode),
        String(subcommittee["subcommittee-fullname"] ?? subcommittee.subcomcode),
      );
    }
  }

  const members = asArray(root.members?.member)
    .map((entry): Member | null => {
      const stateCode = String(entry.statedistrict ?? "").slice(0, 2);
      if (!(stateCode in STATE_NAMES)) return null;
      const districtSuffix = String(entry.statedistrict ?? "").slice(2);
      const district = Number(districtSuffix);
      const memberInfo = entry["member-info"];
      const fullName = String(memberInfo.namelist ?? "").trim();
      const bioguideId = String(memberInfo.bioguideID ?? "").trim();
      const committees = [
        ...asArray(entry["committee-assignments"]?.committee).map((committee) => ({
          code: String(committee.comcode),
          name: committeeCatalog.get(String(committee.comcode)) ?? String(committee.comcode),
          role: committee.leadership ? String(committee.leadership) : undefined,
        })),
        ...asArray(entry["committee-assignments"]?.subcommittee).map((committee) => ({
          code: String(committee.subcomcode),
          name: subcommitteeCatalog.get(String(committee.subcomcode)) ?? String(committee.subcomcode),
          role: committee.leadership ? String(committee.leadership) : undefined,
        })),
      ];

      const districtLabel = formatDistrictLabel(stateCode, district);
      return {
        bioguideId,
        slug: buildMemberSlug(fullName, stateCode, "house", district),
        firstName: String(memberInfo.firstname ?? "").trim(),
        lastName: String(memberInfo.lastname ?? "").trim(),
        fullName,
        sortName: String(memberInfo["sort-name"] ?? fullName).trim(),
        chamber: "house" as const,
        partyCode: String(memberInfo.party ?? "I").trim() as PartyCode,
        partyName: partyNameFromCode(String(memberInfo.party ?? "I")),
        stateCode,
        stateName: STATE_NAMES[stateCode],
        stateSlug: stateCodeToSlug(stateCode),
        district,
        districtLabel,
        senateClass: null,
        seatLabel: district === 0 ? `${STATE_NAMES[stateCode]} At-Large` : `${STATE_NAMES[stateCode]} ${districtLabel}`,
        roleLabel: district === 0 ? `Representative for ${STATE_NAMES[stateCode]} At-Large` : `Representative for ${districtLabel}`,
        officialWebsiteUrl: String(memberInfo["official-url"] ?? "").trim() || null,
        officeAddress: null,
        officePhone: null,
        hometown: null,
        lisMemberId: null,
        committees,
        termStartDate: parseDate(memberInfo["sworn-date"]?.date ?? memberInfo["sworn-date"]),
        termEndDate: deriveHouseTermEndDate(parseDate(memberInfo["sworn-date"]?.date ?? memberInfo["sworn-date"])),
      } satisfies Member;
    })
    .filter((member): member is Member => member !== null);

  return { congress, members };
}

export function parseSenateRosterXml(cvcXml: string, contactsXml: string, currentCongress: number) {
  const cvc = XML.parse(cvcXml);
  const contacts = XML.parse(contactsXml);
  const contactLookup = new Map<string, { website: string | null; address: string | null; phone: string | null; senateClass: string | null }>();

  for (const member of asArray(contacts.contact_information?.member)) {
    contactLookup.set(String(member.bioguide_id), {
      website: String(member.website ?? member.email ?? "").trim() || null,
      address: String(member.address ?? "").trim() || null,
      phone: String(member.phone ?? "").trim() || null,
      senateClass: String(member.class ?? "").trim() || null,
    });
  }

  return asArray(cvc.congress_contact_info?.senator)
    .map((senator): Member | null => {
      const stateCode = String(senator.state ?? "").trim();
      if (!(stateCode in STATE_NAMES)) return null;
      const bioguideId = String(senator.bioguideId ?? "").trim();
      const fullName = [senator.name?.first, senator.name?.last].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
      const contact = contactLookup.get(bioguideId);
      const senateClass = contact?.senateClass ?? null;

      return {
        bioguideId,
        slug: buildMemberSlug(fullName, stateCode, "senate", null),
        firstName: String(senator.name?.first ?? "").trim(),
        lastName: String(senator.name?.last ?? "").trim(),
        fullName,
        sortName: `${String(senator.name?.last ?? "").trim()}, ${String(senator.name?.first ?? "").trim()}`.trim(),
        chamber: "senate" as const,
        partyCode: String(senator.party ?? "I").trim() as PartyCode,
        partyName: partyNameFromCode(String(senator.party ?? "I")),
        stateCode,
        stateName: STATE_NAMES[stateCode],
        stateSlug: stateCodeToSlug(stateCode),
        district: null,
        districtLabel: null,
        senateClass,
        seatLabel: `${STATE_NAMES[stateCode]} Senate Seat`,
        roleLabel: `United States Senator from ${STATE_NAMES[stateCode]}`,
        officialWebsiteUrl: contact?.website ?? null,
        officeAddress: contact?.address ?? null,
        officePhone: contact?.phone ?? null,
        hometown: String(senator.homeTown ?? "").trim() || null,
        lisMemberId: String(senator.lis_member_id ?? "").trim() || null,
        committees: asArray(senator.committees?.committee).map((committee) => ({
          code: String(committee.code ?? ""),
          name: String(committee["#text"] ?? committee).trim(),
        })),
        termStartDate: null,
        termEndDate: deriveSenateTermEndDate(senateClass, currentCongress),
      } satisfies Member;
    })
    .filter((member): member is Member => member !== null);
}

const getHouseRoster = unstable_cache(
  async () => {
    const xml = await fetchText("https://clerk.house.gov/xml/lists/MemberData.xml", DAY);
    return parseHouseRosterXml(xml);
  },
  ["house-roster"],
  { revalidate: DAY },
);

const getSenateRoster = unstable_cache(
  async (currentCongress: number) => {
    const [cvcXml, contactsXml] = await Promise.all([
      fetchText("https://www.senate.gov/legislative/LIS_MEMBER/cvc_member_data.xml", DAY),
      fetchText("https://www.senate.gov/general/contact_information/senators_cfm.xml", DAY),
    ]);
    return parseSenateRosterXml(cvcXml, contactsXml, currentCongress);
  },
  ["senate-roster"],
  { revalidate: DAY },
);

const getRecentHouseVotes = unstable_cache(
  async (limit: number) => {
    const year = new Date().getUTCFullYear();
    const html = await fetchText(`https://clerk.house.gov/evs/${year}/index.asp`, HOUR);
    const summaries = parseHouseVoteIndexHtml(html, year).slice(0, limit);

    const votes = await Promise.all(
      summaries.map(async (summary) => {
        const sourceUrl = `https://clerk.house.gov/evs/${year}/roll${String(summary.rollCallNumber).padStart(3, "0")}.xml`;
        const xml = await fetchText(sourceUrl, HOUR);
        return parseHouseVoteXml(xml, sourceUrl);
      }),
    );

    return votes;
  },
  ["recent-house-votes"],
  { revalidate: HOUR },
);

const getRecentSenateVotes = unstable_cache(
  async (limit: number) => {
    const { congress } = await getHouseRoster();
    const session = 2;
    const menuUrl = `https://www.senate.gov/legislative/LIS/roll_call_lists/vote_menu_${congress}_${session}.xml`;
    const menuXml = await fetchText(menuUrl, HOUR);
    const summaries = parseSenateVoteMenuXml(menuXml).slice(0, limit);

    const votes = await Promise.all(
      summaries.map(async (summary) => {
        const sourceUrl = `https://www.senate.gov/legislative/LIS/roll_call_votes/vote${summary.congress}${summary.session}/vote_${summary.congress}_${summary.session}_${String(summary.rollCallNumber).padStart(5, "0")}.xml`;
        const xml = await fetchText(sourceUrl, HOUR);
        return parseSenateVoteXml(xml, sourceUrl);
      }),
    );

    return votes;
  },
  ["recent-senate-votes"],
  { revalidate: HOUR },
);

const getLatestBills = unstable_cache(
  async (limit: number) => {
    const { congress } = await getHouseRoster();
    const data = await fetchJson<{
      bills: Array<{
        congress: number;
        number: string;
        originChamber?: string;
        policyArea?: { name: string | null };
        title: string;
        type: string;
        updateDate?: string;
        url: string;
        latestAction?: { actionDate?: string; text?: string };
      }>;
    }>(`https://api.congress.gov/v3/bill/${congress}?limit=${limit}&api_key=${CONGRESS_API_KEY}`, SIX_HOURS);

    return data.bills.map((bill) => ({
      congress: bill.congress,
      billType: toTitleBillType(bill.type),
      billNumber: Number(bill.number),
      idLabel: `${bill.type} ${bill.number}`,
      title: bill.title,
      policyArea: bill.policyArea?.name ?? null,
      introducedDate: null,
      latestActionDate: bill.latestAction?.actionDate ?? bill.updateDate ?? null,
      latestActionText: bill.latestAction?.text ?? null,
      originChamber: bill.originChamber ?? null,
      sponsorName: null,
      sponsorBioguideId: null,
      sourceUrl: bill.url,
    })) satisfies Bill[];
  },
  ["latest-bills"],
  { revalidate: SIX_HOURS },
);

const getBillDetailCached = unstable_cache(
  async (congress: number, billType: string, billNumber: number) => {
    const bill = await fetchJson<{
      bill: {
        congress: number;
        number: string;
        title: string;
        type: string;
        updateDate?: string;
        originChamber?: string;
        introducedDate?: string;
        policyArea?: { name: string | null };
        summaries?: Array<{ text?: string }>;
        sponsors?: Array<{ bioguideId?: string; fullName?: string }>;
        latestAction?: { actionDate?: string; text?: string };
        actions?: Array<{ actionDate?: string; text?: string }>;
        subjects?: { legislativeSubjects?: Array<{ name?: string }>; policyArea?: { name?: string } };
        cosponsors?: { count?: number };
        url: string;
      };
    }>(
      `https://api.congress.gov/v3/bill/${congress}/${billType}/${billNumber}?api_key=${CONGRESS_API_KEY}`,
      SIX_HOURS,
    );

    const payload = bill.bill;
    return {
      congress: payload.congress,
      billType: toTitleBillType(payload.type),
      billNumber: Number(payload.number),
      idLabel: `${payload.type} ${payload.number}`,
      title: payload.title,
      policyArea: payload.policyArea?.name ?? null,
      introducedDate: payload.introducedDate ?? null,
      latestActionDate: payload.latestAction?.actionDate ?? payload.updateDate ?? null,
      latestActionText: payload.latestAction?.text ?? null,
      originChamber: payload.originChamber ?? null,
      sponsorName: payload.sponsors?.[0]?.fullName ?? null,
      sponsorBioguideId: payload.sponsors?.[0]?.bioguideId ?? null,
      sourceUrl: payload.url,
      summary: payload.summaries?.[0]?.text ?? null,
      cosponsorsCount: payload.cosponsors?.count ?? null,
      latestActions: asArray(payload.actions).slice(0, 8).map((action) => ({
        actionDate: action.actionDate ?? null,
        actionText: String(action.text ?? "").trim(),
      })),
      subjects: [
        ...(payload.subjects?.policyArea?.name ? [payload.subjects.policyArea.name] : []),
        ...asArray(payload.subjects?.legislativeSubjects).map((subject) => String(subject.name ?? "")).filter(Boolean),
      ],
    } satisfies BillDetail;
  },
  ["bill-detail"],
  { revalidate: SIX_HOURS },
);

const getMemberApiDetail = unstable_cache(
  async (bioguideId: string) => {
    const [memberData, sponsoredData, cosponsoredData] = await Promise.all([
      fetchJson<{
        member: {
          birthYear?: string;
          currentMember: boolean;
          depiction?: { imageUrl?: string };
          officialWebsiteUrl?: string;
          partyHistory?: Array<{ partyAbbreviation?: string; partyName?: string }>;
          sponsoredLegislation?: { count?: number };
          cosponsoredLegislation?: { count?: number };
          terms?: Array<{ chamber?: string; congress?: number; startYear?: number; stateCode?: string; stateName?: string }>;
          addressInformation?: { officeAddress?: string; phoneNumber?: string; city?: string; district?: string; zipCode?: number };
        };
      }>(`https://api.congress.gov/v3/member/${bioguideId}?api_key=${CONGRESS_API_KEY}`, DAY),
      fetchJson<{
        sponsoredLegislation: Array<{
          congress: number;
          introducedDate?: string;
          latestAction?: { actionDate?: string; text?: string };
          number: string;
          policyArea?: { name: string | null };
          title: string;
          type: string;
          url: string;
        }>;
      }>(`https://api.congress.gov/v3/member/${bioguideId}/sponsored-legislation?limit=12&api_key=${CONGRESS_API_KEY}`, DAY),
      fetchJson<{
        pagination?: { count?: number };
      }>(`https://api.congress.gov/v3/member/${bioguideId}/cosponsored-legislation?limit=1&api_key=${CONGRESS_API_KEY}`, DAY),
    ]);

    return {
      member: memberData.member,
      sponsoredBills: sponsoredData.sponsoredLegislation.map((bill) => ({
        congress: bill.congress,
        billType: toTitleBillType(bill.type),
        billNumber: Number(bill.number),
        idLabel: `${bill.type} ${bill.number}`,
        title: bill.title,
        policyArea: bill.policyArea?.name ?? null,
        introducedDate: bill.introducedDate ?? null,
        latestActionDate: bill.latestAction?.actionDate ?? null,
        latestActionText: bill.latestAction?.text ?? null,
        originChamber: null,
        sponsorName: null,
        sponsorBioguideId: bioguideId,
        sourceUrl: bill.url,
      })) satisfies Bill[],
      cosponsoredCount: cosponsoredData.pagination?.count ?? memberData.member.cosponsoredLegislation?.count ?? null,
    };
  },
  ["member-api-detail"],
  { revalidate: DAY },
);

export async function getAllMembers(): Promise<Member[]> {
  const house = await getHouseRoster();
  const senate = await getSenateRoster(house.congress);
  const members: Member[] = [...house.members, ...senate];

  return members.sort((a, b) => {
    if (a.stateName !== b.stateName) return a.stateName.localeCompare(b.stateName);
    if (a.chamber !== b.chamber) return a.chamber.localeCompare(b.chamber);
    return a.sortName.localeCompare(b.sortName);
  });
}

export async function getCurrentCongressNumber() {
  const { congress } = await getHouseRoster();
  return congress;
}

export async function getSiteOverview(): Promise<SiteOverview> {
  const [members, votes] = await Promise.all([getAllMembers(), getRecentVotes(8)]);
  const houseMembers = members.filter((member) => member.chamber === "house").length;
  const senateMembers = members.filter((member) => member.chamber === "senate").length;
  const missedVoteCount = votes.reduce((total, vote) => total + vote.positions.filter((position) => /not voting|not voting/i.test(position.vote)).length, 0);
  const latestVoteTimestamp = votes.map((vote) => vote.timestamp).sort().reverse()[0] ?? new Date().toISOString();

  return {
    currentCongress: await getCurrentCongressNumber(),
    houseMembers,
    senateMembers,
    totalMembers: members.length,
    statesCount: new Set(members.map((member) => member.stateCode)).size,
    recentVoteCount: votes.length,
    missedVoteCount,
    lastUpdated: latestVoteTimestamp,
  };
}

export async function getStates(): Promise<Array<{ code: string; name: string; slug: string }>> {
  const members = await getAllMembers();
  const states = Array.from(
    members.reduce((map, member) => {
      if (!map.has(member.stateCode)) {
        map.set(member.stateCode, {
          code: member.stateCode,
          name: member.stateName,
          slug: member.stateSlug,
        });
      }
      return map;
    }, new Map<string, { code: string; name: string; slug: string }>()),
  ).map(([, value]) => value);

  return states.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getMembersByState(stateSlug: string): Promise<Member[]> {
  const members = await getAllMembers();
  return members.filter((member) => member.stateSlug === stateSlug);
}

export async function getMembersByChamber(chamber: Chamber): Promise<Member[]> {
  const members = await getAllMembers();
  return members.filter((member) => member.chamber === chamber);
}

export async function getMemberBySlug(slug: string): Promise<Member | null> {
  const members = await getAllMembers();
  return members.find((member) => member.slug === slug) ?? null;
}

export async function getRecentVotes(limit = 8) {
  const [houseVotes, senateVotes] = await Promise.all([getRecentHouseVotes(limit), getRecentSenateVotes(limit)]);
  return [...houseVotes, ...senateVotes]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, limit);
}

export async function getStateOverview(stateSlug: string) {
  const members = await getMembersByState(stateSlug);
  if (members.length === 0) return null;

  const recentVotes = await getRecentVotes(10);
  const memberIds = new Set(members.map((member) => member.chamber === "house" ? member.bioguideId : member.lisMemberId).filter(Boolean));
  const relatedVotes = recentVotes
    .map((vote) => ({
      ...vote,
      delegationBreakdown: vote.positions.filter((position) => memberIds.has(position.memberId)),
    }))
    .filter((vote) => vote.delegationBreakdown.length > 0)
    .slice(0, 6);

  return {
    state: members[0].stateName,
    code: members[0].stateCode,
    slug: members[0].stateSlug,
    members,
    houseMembers: members.filter((member) => member.chamber === "house"),
    senateMembers: members.filter((member) => member.chamber === "senate"),
    relatedVotes,
    partyBreakdown: members.reduce(
      (accumulator, member) => {
        accumulator[member.partyCode] = (accumulator[member.partyCode] ?? 0) + 1;
        return accumulator;
      },
      {} as Record<string, number>,
    ),
  };
}

export async function getBills(limit = 30) {
  return getLatestBills(limit);
}

export async function getBillDetail(congress: number, billType: string, billNumber: number) {
  return getBillDetailCached(congress, billType.toLowerCase(), billNumber);
}

export async function getVoteDetail(chamber: Chamber, congress: number, session: number, rollCallNumber: number) {
  if (chamber === "house") {
    const year = new Date().getUTCFullYear();
    const sourceUrl = `https://clerk.house.gov/evs/${year}/roll${String(rollCallNumber).padStart(3, "0")}.xml`;
    const xml = await fetchText(sourceUrl, HOUR);
    return parseHouseVoteXml(xml, sourceUrl);
  }

  const sourceUrl = `https://www.senate.gov/legislative/LIS/roll_call_votes/vote${congress}${session}/vote_${congress}_${session}_${String(rollCallNumber).padStart(5, "0")}.xml`;
  const xml = await fetchText(sourceUrl, HOUR);
  return parseSenateVoteXml(xml, sourceUrl);
}

export async function getMemberPageData(slug: string) {
  const member = await getMemberBySlug(slug);
  if (!member) return null;

  const [apiDetail, recentVotes] = await Promise.all([
    getMemberApiDetail(member.bioguideId).catch(() => null),
    member.chamber === "house" ? getRecentHouseVotes(10) : getRecentSenateVotes(10),
  ]);

  const memberId = member.chamber === "house" ? member.bioguideId : member.lisMemberId;
  const voteHistory = recentVotes
    .map((vote) => {
      const position = vote.positions.find((entry) => entry.memberId === memberId);
      if (!position) return null;
      return {
        ...vote,
        position,
      };
    })
    .filter((vote): vote is Vote & { position: VotePosition } => vote !== null);

  const totalVotes = voteHistory.length;
  const missedVotes = voteHistory.filter((vote) => /not voting/i.test(vote.position.vote)).length;
  const participationRate = totalVotes > 0 ? ((totalVotes - missedVotes) / totalVotes) * 100 : null;

  const firstTermYear = apiDetail?.member.terms?.map((term) => term.startYear).filter((year): year is number => typeof year === "number").sort((a, b) => a - b)[0];
  const serviceSince = firstTermYear ? `${firstTermYear}-01-03` : member.termStartDate;

  return {
    member,
    imageUrl: apiDetail?.member.depiction?.imageUrl ?? null,
    sponsoredBills: apiDetail?.sponsoredBills ?? [],
    cosponsoredCount: apiDetail?.cosponsoredCount ?? null,
    recentVotes: voteHistory.slice(0, 8),
    totalRecentVotes: totalVotes,
    missedVotes,
    participationRate,
    serviceSince,
  };
}

export async function searchSite(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return { members: [], states: [] };
  }

  const [members, states] = await Promise.all([getAllMembers(), getStates()]);

  return {
    members: members.filter((member) => {
      const haystack = [member.fullName, member.lastName, member.stateName, member.stateCode, member.districtLabel ?? ""]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    }),
    states: states.filter((state) => {
      const haystack = `${state.name} ${state.code}`.toLowerCase();
      return haystack.includes(normalized);
    }),
  };
}

export function formatDisplayDate(value: string | null) {
  if (!value) return "Unavailable";
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(parsed));
}

export function formatPercent(value: number | null) {
  if (value == null || Number.isNaN(value)) return "Unavailable";
  return `${value.toFixed(1)}%`;
}
