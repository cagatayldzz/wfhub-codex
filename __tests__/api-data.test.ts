import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const API_ROOT = path.resolve("api");
const IMAGE_ROOT = path.resolve("img");
const LOCAL_IMAGE_PREFIX = "https://wfhub-api.cagatayldzz.com/img/";

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

function imageFileFromUrl(imageName: string): string {
  return path.join(IMAGE_ROOT, path.basename(imageName.split("?")[0]));
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

  it("uses local CDN URLs for every generated item image", () => {
    let itemCount = 0;
    for (const file of files) {
      const value = JSON.parse(fs.readFileSync(file, "utf8"));
      const records = Array.isArray(value) ? value : [value];
      for (const record of records) {
        if (typeof record?.imageName !== "string") continue;
        itemCount++;
        expect(record.imageName).toMatch(/^https:\/\//);
        if (record.imageName.startsWith(LOCAL_IMAGE_PREFIX)) {
          expect(fs.existsSync(imageFileFromUrl(record.imageName))).toBe(true);
        }
      }
    }
    expect(itemCount).toBeGreaterThan(1000);
  });

  it("uses local CDN URLs and existing files for every ability image", () => {
    let abilityCount = 0;
    for (const file of files) {
      const value = JSON.parse(fs.readFileSync(file, "utf8"));
      if (!Array.isArray(value?.abilities)) continue;
      for (const ability of value.abilities) {
        if (typeof ability?.imageName !== "string") continue;
        abilityCount++;
        expect(ability.imageName).toMatch(
          /^https:\/\/wfhub-api\.cagatayldzz\.com\/img\//
        );
        expect(fs.existsSync(imageFileFromUrl(ability.imageName))).toBe(true);
      }
    }
    expect(abilityCount).toBeGreaterThan(100);
  });
});
