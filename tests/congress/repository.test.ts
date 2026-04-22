import { describe, expect, test } from "vitest";

import { getCongressDataset } from "@/lib/congress/repository";

describe("congress repository", () => {
  test("falls back to the seed dataset when the live fetch path fails", async () => {
    const dataset = await getCongressDataset({
      mode: "hybrid",
      fetchImpl: async () => {
        throw new Error("network down");
      },
    });

    expect(dataset.metadata.origin).toBe("seed");
    expect(dataset.metadata.warnings[0]).toContain("Fell back to the committed seed snapshot");
    expect(dataset.memberTerms.some((term) => term.chamber === "senate")).toBe(true);
  });
});
