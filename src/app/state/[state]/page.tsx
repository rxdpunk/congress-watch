import { redirect } from "next/navigation";

export default async function LegacyStateRedirect({
  params,
}: {
  params: Promise<{ state: string }>;
}) {
  const { state } = await params;
  redirect(`/states/${state}`);
}
