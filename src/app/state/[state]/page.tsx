import { redirect } from "next/navigation";

import { getStates } from "@/lib/congress-data";

export default async function LegacyStateRedirect({
  params,
}: {
  params: Promise<{ state: string }>;
}) {
  const { state } = await params;
  const states = await getStates();
  const normalizedState = state.trim().toLowerCase();
  const normalizedName = normalizedState.replace(/-/g, " ");

  const match = states.find((entry) => {
    return (
      entry.slug === normalizedState ||
      entry.code.toLowerCase() === normalizedState ||
      entry.name.toLowerCase() === normalizedName
    );
  });

  redirect(`/states/${match?.slug ?? normalizedState}`);
}
