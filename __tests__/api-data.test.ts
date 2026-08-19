import * as fs from "node:fs";
import * as path from "node:path";

import { describe, expect, it } from "vitest";

const API_ROOT = path.resolve("api");
function jsonFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory()
      ? jsonFiles(fullPath)
      : entry.name.endsWith(".json")
        ? [fullPath]
        : [];
  });
}

describe("generated API data", () => {
  const files = jsonFiles(API_ROOT);

  it("contains a substantial generated dataset", () => {
    expect(files.length).toBeGreaterThan(1000);
  });

  it("contains valid JSON in every API file", () => {
    for (const file of files) {
      expect(() => JSON.parse(fs.readFileSync(file, "utf8"))).not.toThrow();
    }
  });

  it("uses the WFCD CDN for every generated item image", () => {
    let itemCount = 0;
    for (const file of files) {
      const value = JSON.parse(fs.readFileSync(file, "utf8"));
      const records = Array.isArray(value) ? value : [value];
      for (const record of records) {
        if (typeof record?.imageName !== "string") continue;
        itemCount++;
        expect(record.imageName).toMatch(
          /^https:\/\/cdn\.warframestat\.us\/img\/.+\.(png|jpg|jpeg|webp)$/
        );
      }
    }
    expect(itemCount).toBeGreaterThan(1000);
  });

  it("uses the WFCD CDN for every ability image", () => {
    let abilityCount = 0;
    for (const file of files) {
      const value = JSON.parse(fs.readFileSync(file, "utf8"));
      if (!Array.isArray(value?.abilities)) continue;
      for (const ability of value.abilities) {
        if (typeof ability?.imageName !== "string") continue;
        abilityCount++;
        expect(ability.imageName).toMatch(
          /^https:\/\/cdn\.warframestat\.us\/img\/.+\.(png|jpg|jpeg|webp)$/
        );
      }
    }
    expect(abilityCount).toBeGreaterThan(100);
  });
});
