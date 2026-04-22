import { NextResponse } from "next/server";

import { getStateReadModel } from "@/lib/congress/read-models";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ state: string }> },
) {
  const { state } = await params;
  const stateModel = await getStateReadModel(state);

  if (!stateModel) {
    return NextResponse.json({ error: "State not found" }, { status: 404 });
  }

  return NextResponse.json(stateModel);
}
