import { describe, expect, it } from "vitest";

import { WFCD_CDN } from "../src/utils/cdn";

describe("WFCD_CDN", () => {
  it("points to the WFCD image CDN", () => {
    expect(WFCD_CDN).toBe("https://cdn.warframestat.us/img/");
  });

  it("ends with a slash for safe filename concatenation", () => {
    expect(WFCD_CDN.endsWith("/")).toBe(true);
    expect(`${WFCD_CDN}Itzal.png`).toBe(
      "https://cdn.warframestat.us/img/Itzal.png"
    );
  });
});
