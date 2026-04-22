import { NextResponse } from "next/server";

import { deriveBillCards } from "@/lib/congress/derive";
import { getCongressDataset } from "@/lib/congress/repository";

export async function GET() {
  const dataset = await getCongressDataset();

  return NextResponse.json({
    generatedAt: dataset.metadata.generatedAt,
    sourceMode: dataset.metadata.origin,
    bills: deriveBillCards(dataset),
  });
}
