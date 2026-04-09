import { describe, expect, it } from "vitest";

import { slugify } from "./slugify";

describe("slugify", () => {
  it("normalizes accents, punctuation, and whitespace", () => {
    expect(slugify("  Héllo,   World!  ")).toBe("hello-world");
  });

  it("collapses repeated separators", () => {
    expect(slugify("A---B   C")).toBe("a-b-c");
  });
});
