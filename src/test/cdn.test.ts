import { describe, expect, it } from "vitest";

import { WFCD_CDN } from "../utils/cdn";

describe("WFCD_CDN", () => {
  it("uses the WFCD image CDN", () => {
    expect(WFCD_CDN).toBe("https://cdn.warframestat.us/img/");
  });

  it("can be used to build an item image URL", () => {
    expect(`${WFCD_CDN}akimbo-slip-shot.png`).toBe(
      "https://cdn.warframestat.us/img/akimbo-slip-shot.png"
    );
  });
});
