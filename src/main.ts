import path from "path";
import fs from "fs";

import type { Locale } from "@wfcd/items";

import { loadI18nData } from "./utils/i18n";
import { Translatable } from "./utils/type";
import { slugify } from "./utils/slugify";

const I18N_FILE = "./node_modules/@wfcd/items/data/json/i18n.json";

const CATEGORIES = [
  "Arcanes",
  "Arch-Gun",
  "Arch-Melee",
  "Archwing",
  "Enemy",
  "Fish",
  "Gear",
  "Glyphs",
  "Melee",
  "Misc",
  "Mods",
  "Node",
  "Pets",
  "Primary",
  "Quests",
  "Railjack",
  "Relics",
  "Resources",
  "Secondary",
  "SentinelWeapons",
  "Sentinels",
  "Sigils",
  "Skins",
  "Warframes",
] as const;

const CONFIG = CATEGORIES.map((category) => ({
  inputFile: `./node_modules/@wfcd/items/data/json/${category}.json`,
  outputDir: `./data/${slugify(category)}`,
  category,
}));

async function buildCategory(
  inputFile: string,
  outputDir: string,
  fields: (keyof Translatable)[],
  i18nMap: Record<string, Record<Locale, { description: string; name: string }>>
): Promise<void> {
  const data: Translatable[] = JSON.parse(
    await fs.promises.readFile(inputFile, "utf-8")
  );
  const used = new Set<string>();

  await fs.promises.mkdir(outputDir, { recursive: true });

  for (const item of data) {
    const result: Record<
      string,
      | { description?: string; name?: string; code: Locale }[]
      | undefined
      | string
      | number
    > = {};

    for (const field of fields) {
      const value = item[field];
      if (field === "imageName" && typeof value === "string" && value) {
        result[field] =
          `https://raw.githubusercontent.com/WFCD/warframe-items/master/data/img/${value}`;
      } else {
        result[field] = value as undefined | string | number;
      }
    }

    const i18nEntry = i18nMap[item.uniqueName];
    result.languages = i18nEntry
      ? Object.entries(i18nEntry).map(([code, value]) => ({
          description: value.description ?? undefined,
          name: value.name ?? undefined,
          code: code as Locale,
        }))
      : [];

    const slug = slugify(item.name);
    if (used.has(slug)) {
      continue;
    }
    used.add(slug);

    await fs.promises.writeFile(
      path.join(outputDir, `${slug}.json`),
      JSON.stringify(result),
      "utf-8"
    );
  }
}

async function main(): Promise<void> {
  const i18nMap = await loadI18nData(I18N_FILE);

  await Promise.all(
    CONFIG.map(({ inputFile, outputDir }) =>
      buildCategory(
        inputFile,
        outputDir,
        ["uniqueName", "imageName", "name", "description", "armor", "aura"],
        i18nMap
      )
    )
  );
}

main();
