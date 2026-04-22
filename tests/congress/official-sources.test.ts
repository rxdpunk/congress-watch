import { describe, expect, test } from "vitest";

import { fetchLiveHouseRoster } from "@/lib/congress/official/house";
import { fetchLiveSenateRoster } from "@/lib/congress/official/senate";

function responseOf(body: string) {
  return new Response(body, {
    status: 200,
    headers: {
      "content-type": "text/html",
    },
  });
}

describe("official roster sources", () => {
  test("parses the House member list HTML", async () => {
    const html = `
      <table>
        <tr>
          <td>
            <a href="/members/A000381" aria-label="Ansari, Yassamin   , state: Arizona (AZ) , district: 3rd , party: Democrat">Ansari</a>
          </td>
        </tr>
        <tr>
          <td>
            <a href="/members/S001211" aria-label="Stanton, Greg   , state: Arizona (AZ) , district: 4th , party: Democrat">Stanton</a>
          </td>
        </tr>
      </table>
    `;

    const data = await fetchLiveHouseRoster(async () => responseOf(html));

    expect(data.members).toHaveLength(2);
    expect(data.memberTerms[0]?.district).toBe(3);
    expect(data.memberTerms[1]?.seatLabel).toContain("4th District");
  });

  test("parses the Senate contact and committee feeds", async () => {
    const contactXml = `
      <contact_information>
        <member>
          <first_name>Ruben</first_name>
          <last_name>Gallego</last_name>
          <party>D</party>
          <state>AZ</state>
          <website>https://www.gallego.senate.gov/</website>
          <class>Class I</class>
          <bioguide_id>G000574</bioguide_id>
        </member>
      </contact_information>
    `;
    const membershipXml = `
      <senators>
        <senator lis_member_id="S432">
          <name>
            <first>Ruben</first>
            <last>Gallego</last>
          </name>
          <party>D</party>
          <state>AZ</state>
          <bioguideId>G000574</bioguideId>
          <committees>
            <committee code="SSVA00">Committee on Veterans' Affairs</committee>
            <committee code="SSGA00">Committee on Homeland Security and Governmental Affairs</committee>
          </committees>
        </senator>
      </senators>
    `;

    const responses = [responseOf(contactXml), responseOf(membershipXml)];
    const data = await fetchLiveSenateRoster(async () => {
      const next = responses.shift();
      if (!next) {
        throw new Error("No response queued");
      }

      return next;
    });

    expect(data.members).toHaveLength(1);
    expect(data.members[0]?.slug).toBe("ruben-gallego-az");
    expect(data.memberTerms[0]?.senateClass).toBe(1);
    expect(data.committeeAssignments.map((assignment) => assignment.committeeName)).toEqual(
      expect.arrayContaining(["Committee on Veterans' Affairs", "Committee on Homeland Security and Governmental Affairs"]),
    );
  });
});
