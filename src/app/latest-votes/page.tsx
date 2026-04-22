import { redirect } from "next/navigation";

export default function LatestVotesRedirect() {
  redirect("/votes");
}
