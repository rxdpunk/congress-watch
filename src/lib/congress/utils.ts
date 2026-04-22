import { CURRENT_CONGRESS } from "@/lib/congress/constants";
import type { ChamberCode } from "@/lib/congress/domain";

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function createMemberSlug(params: {
  firstName: string;
  lastName: string;
  stateCode: string;
  chamber: ChamberCode;
  district?: number;
}): string {
  const base = slugify(`${params.firstName} ${params.lastName}`);
  if (params.chamber === "house" && params.district) {
    return `${base}-${params.stateCode.toLowerCase()}-${String(params.district).padStart(2, "0")}`;
  }

  return `${base}-${params.stateCode.toLowerCase()}`;
}

export function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export function formatPercentage(value: number | null): string {
  if (value === null) {
    return "Data unavailable";
  }

  return `${value.toFixed(1)}%`;
}

export function formatDurationBetween(startDate: string, endDate = new Date().toISOString()): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const totalMonths = Math.max(
    0,
    (end.getUTCFullYear() - start.getUTCFullYear()) * 12 + (end.getUTCMonth() - start.getUTCMonth()),
  );
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (years === 0) {
    return `${months} month${months === 1 ? "" : "s"}`;
  }

  if (months === 0) {
    return `${years} year${years === 1 ? "" : "s"}`;
  }

  return `${years} year${years === 1 ? "" : "s"}, ${months} month${months === 1 ? "" : "s"}`;
}

export function currentSenateTermWindow(senateClass: 1 | 2 | 3): {
  termStartDate: string;
  termEndDate: string;
} {
  if (senateClass === 1) {
    return {
      termStartDate: "2025-01-03",
      termEndDate: "2031-01-03",
    };
  }

  if (senateClass === 2) {
    return {
      termStartDate: "2021-01-03",
      termEndDate: "2027-01-03",
    };
  }

  return {
    termStartDate: "2023-01-03",
    termEndDate: "2029-01-03",
  };
}

export function currentHouseTermWindow(): { termStartDate: string; termEndDate: string } {
  return {
    termStartDate: "2025-01-03",
    termEndDate: "2027-01-03",
  };
}

export function districtNumberFromLabel(label: string): number | undefined {
  const normalized = normalizeWhitespace(label).toLowerCase();

  if (normalized === "at large") {
    return undefined;
  }

  const match = normalized.match(/^(\d+)/);
  if (!match) {
    return undefined;
  }

  return Number(match[1]);
}

export function slugToStateCode(input: string): string {
  return input.trim().slice(0, 2).toUpperCase();
}

export function buildBillId(billType: string, billNumber: number, congressNumber = CURRENT_CONGRESS): string {
  return `${congressNumber}-${billType.toLowerCase()}-${billNumber}`;
}
