import { NextResponse } from "next/server";

import { getBills, getRecentVotes, getSiteOverview, getStates } from "@/lib/congress-data";

export async function GET() {
  const [overview, states, votes, bills] = await Promise.all([
    getSiteOverview(),
    getStates(),
    getRecentVotes(12),
    getBills(12),
  ]);

  return NextResponse.json({
    ok: true,
    warmed: {
      states: states.length,
      votes: votes.length,
      bills: bills.length,
    },
    overview,
    refreshedAt: new Date().toISOString(),
  });
}
