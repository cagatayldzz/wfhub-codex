import { describe, expect, it } from "vitest";

import { slugify } from "../src/utils/slugify";

describe("slugify", () => {
  it.each([
    ["  Héllo,   World!  ", "hello-world"],
    ["A---B   C", "a-b-c"],
    ["Café & Co.", "cafe-co"],
    ["A/B (Prime)", "ab-prime"],
    ["already-slugged", "already-slugged"],
    ["", ""],
    ["   ", ""],
    ["___", "___"],
    ["Türkçe ŞĞİÖÜ", "turkce-sgiou"],
    ["Name — Variant", "name-variant"],
  ])("converts %j to %j", (value, expected) => {
    expect(slugify(value)).toBe(expected);
  });

  it("is deterministic and idempotent for generated slugs", () => {
    const slug = slugify("  Nova Prime  ");
    expect(slugify(slug)).toBe(slug);
  });
});
