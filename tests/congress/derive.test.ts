import { describe, expect, test } from "vitest";

import { deriveHomeReadModel, deriveMemberReadModel, deriveStateReadModel } from "@/lib/congress/derive";
import { getSeedCongressDataset } from "@/lib/congress/repository";

describe("congress derivations", () => {
  test("builds a home read model from the committed seed snapshot", () => {
    const dataset = getSeedCongressDataset();
    const home = deriveHomeReadModel(dataset);

    expect(home.overviewStats.find((stat) => stat.label === "Current senators")?.value).toBe("100");
    expect(home.overviewStats.find((stat) => stat.label === "Current House members")?.value).toBe("431");
    expect(home.featuredStates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "AZ" }),
        expect.objectContaining({ code: "GA" }),
        expect.objectContaining({ code: "MI" }),
        expect.objectContaining({ code: "PA" }),
      ]),
    );
    expect(home.recentVotes.length).toBeGreaterThan(0);
    expect(home.featuredBills.length).toBeGreaterThan(0);
  });

  test("builds a state read model for Arizona", () => {
    const dataset = getSeedCongressDataset();
    const arizona = deriveStateReadModel(dataset, "AZ");

    expect(arizona).not.toBeNull();
    expect(arizona?.stateCode).toBe("AZ");
    expect(arizona?.stats.senators).toBe(2);
    expect(arizona?.stats.representatives).toBeGreaterThan(0);
    expect(arizona?.memberCards.some((member) => member.name.includes("Gallego"))).toBe(true);
  });

  test("builds a member read model for a seeded featured member", () => {
    const dataset = getSeedCongressDataset();
    const member = deriveMemberReadModel(dataset, "ruben-gallego-az");

    expect(member).not.toBeNull();
    expect(member?.memberCard.name).toBe("Ruben Gallego");
    expect(member?.stats.totalVotes).toBeGreaterThan(0);
    expect(member?.sponsorships[0]?.number).toBe("S. 2495");
  });
});
