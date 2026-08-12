import { describe, expect, it } from "vitest";

import { slugify } from "../utils/slugify";

describe("slugify", () => {
  it("normalizes accents, punctuation, and whitespace", () => {
    expect(slugify("  Héllo,   World!  ")).toBe("hello-world");
  });

  it("collapses repeated separators", () => {
    expect(slugify("A---B   C")).toBe("a-b-c");
  });

  it.each([
    ["", ""],
    ["   ", ""],
    ["Café & Co.", "cafe-co"],
    ["A/B (Prime)", "ab-prime"],
    ["already-slugged", "already-slugged"],
  ])("converts %j to %j", (value, expected) => {
    expect(slugify(value)).toBe(expected);
  });
});
