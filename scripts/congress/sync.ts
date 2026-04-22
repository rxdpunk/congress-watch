import { getCongressDataset } from "@/lib/congress/repository";

function readFlag(name: string): boolean {
  return process.argv.includes(name);
}

function readValue(name: string): string | undefined {
  const index = process.argv.findIndex((argument) => argument === name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const mode = (readValue("--mode") ?? process.env.CONGRESS_DATA_MODE ?? "hybrid") as "seed" | "live" | "hybrid";
  const enrichHouseProfiles = readFlag("--enrich-house-profiles");
  const asJson = readFlag("--json");
  const dataset = await getCongressDataset({ mode, enrichHouseProfiles });

  if (asJson) {
    process.stdout.write(`${JSON.stringify(dataset, null, 2)}\n`);
    return;
  }

  const houseCount = dataset.memberTerms.filter((term) => term.isActive && term.chamber === "house").length;
  const senateCount = dataset.memberTerms.filter((term) => term.isActive && term.chamber === "senate").length;

  process.stdout.write(
    [
      `Mode: ${dataset.metadata.origin}`,
      `Generated at: ${dataset.metadata.generatedAt}`,
      `Current Congress: ${dataset.metadata.currentCongress}`,
      `House members: ${houseCount}`,
      `Senators: ${senateCount}`,
      `Bills tracked: ${dataset.bills.length}`,
      `Votes tracked: ${dataset.votes.length}`,
      dataset.metadata.warnings.length > 0 ? `Warnings: ${dataset.metadata.warnings.join(" | ")}` : undefined,
    ]
      .filter(Boolean)
      .join("\n") + "\n",
  );
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
  process.exitCode = 1;
});
