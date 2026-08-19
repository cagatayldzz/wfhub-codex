import { describe, expect, it } from "vitest";

import { getImageFileName, getLocalImageUrl } from "../src/main";

describe("image URL helpers", () => {
  it.each([
    ["Itzal.png", "Itzal.png"],
    ["https://cdn.example.test/img/Itzal.png", "Itzal.png"],
    ["https://cdn.example.test/img/Itzal.png?v=2", "Itzal.png"],
    ["nested/path/Ability.jpg?cache=false", "Ability.jpg"],
  ])("extracts %j as %j", (input, expected) => {
    expect(getImageFileName(input)).toBe(expected);
  });

  it("normalizes both remote URLs and filenames to the project CDN", () => {
    expect(getLocalImageUrl("https://cdn.example.test/ArchLine.png?v=1")).toBe(
      "https://wfhub-api.cagatayldzz.com/img/ArchLine.png"
    );
  });

  it("preserves image extensions and URL-safe basename behavior", () => {
    expect(getImageFileName("https://cdn.example.test/icon.webp")).toBe(
      "icon.webp"
    );
    expect(getLocalImageUrl("icon.jpg")).toMatch(
      /^https:\/\/wfhub-api\.cagatayldzz\.com\/img\/icon\.jpg$/
    );
  });
});
