import * as path from "path";
import * as fs from "fs";

import type { Locale } from "@wfcd/items";

import { loadI18nData } from "./utils/i18n";
import { Translatable } from "./utils/type";

const I18N_FILE = "./node_modules/@wfcd/items/data/json/i18n.json";

const CATEGORY = [
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
];

const DATA_CONFIG: { outputFile: string; category: string }[] = CATEGORY.map(
  (category) => ({
    outputFile: `./data/${category}.json`,
    category,
  }),
);

async function filterData<T extends Translatable>(
  inputFile: string,
  outputFile: string,
  fields: (keyof T)[],
  i18nMap: Record<
    string,
    Record<Locale, { description: string; name: string }>
  >,
): Promise<void> {
  try {
    const data: T[] = JSON.parse(fs.readFileSync(inputFile, "utf-8"));

    const filteredData = data.map((item) => {
      const result: Partial<Translatable & T> = {};

      fields.forEach((field) => {
        result[field] =
          field === "imageName" && item.imageName
            ? (`https://raw.githubusercontent.com/WFCD/warframe-items/master/data/img/${item.imageName}` as T[keyof T])
            : (item[field] ?? undefined);
      });

      const i18nEntry = i18nMap[item?.uniqueName];
      result.languages = i18nEntry
        ? Object.entries(i18nEntry).map(([code, value]) => ({
            description: value.description ?? undefined,
            name: value.name ?? undefined,
            code: code as Locale,
          }))
        : [];

      return result;
    });

    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
      console.log(`Creating directory: ${outputDir}`);
      await fs.promises.mkdir(outputDir, { recursive: true });
    }

    fs.writeFileSync(
      outputFile,
      JSON.stringify(filteredData, null, 2),
      "utf-8",
    );
    console.log(`Filtered data written to "${outputFile}"`);
  } catch (error) {
    console.error(`Error processing data for "${outputFile}":`, error);
  }
}

async function main(): Promise<void> {
  const i18nMap = loadI18nData(I18N_FILE);

  await Promise.all(
    DATA_CONFIG.map(async ({ outputFile, category }) => {
      const inputFile = `./node_modules/@wfcd/items/data/json/${category}.json`;

      await filterData<Translatable>(
        inputFile,
        outputFile,
        ["uniqueName", "imageName", "name", "description", "armor", "aura"],
        i18nMap,
      );
    }),
  );
}

main();
