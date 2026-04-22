import { NextResponse } from "next/server";

import { getMemberReadModel } from "@/lib/congress/read-models";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const member = await getMemberReadModel(slug);

  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  return NextResponse.json(member);
}
