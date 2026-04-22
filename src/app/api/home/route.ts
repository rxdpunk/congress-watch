import { NextResponse } from "next/server";

import { getHomeReadModel } from "@/lib/congress/read-models";

export async function GET() {
  const home = await getHomeReadModel();
  return NextResponse.json(home);
}
