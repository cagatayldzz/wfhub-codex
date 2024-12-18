import * as path from "path";
import * as fs from "fs";

import type { Warframe, Category, Weapon, Locale } from "warframe-items";

import { loadI18nData } from "./utils/i18n";
import { Translatable } from "./utils/type";

const I18N_FILE = `./node_modules/warframe-items/data/json/i18n.json`;

const DATAS: { category: Category; outputFile: string }[] = [
  { outputFile: "./data/warframes.json", category: "Warframes" },
  { outputFile: "./data/primary.json", category: "Primary" },
];

async function filterData<T extends Translatable>(
  inputFile: string,
  outputFile: string,
  fields: (keyof T)[],
  i18nMap: Record<
    string,
    Record<Locale, { description: string; name: string }>
  >,
) {
  try {
    const data: T[] = JSON.parse(fs.readFileSync(inputFile, "utf-8"));

    const filteredData = data.map((item) => {
      const result: Partial<Translatable & T> = {};
      fields.forEach((field) => {
        if (field === "imageName" && item.imageName) {
          (result as any)[field] =
            `https://raw.githubusercontent.com/WFCD/warframe-items/master/data/img/${item.imageName}`;
        } else {
          (result as any)[field] = item[field] ?? "N/A";
        }
      });

      const i18nEntry = i18nMap[item?.uniqueName];
      if (i18nEntry) {
        result.languages = Object.entries(i18nEntry).map(([code, value]) => ({
          description: value.description || "N/A",
          name: value.name || "N/A",
          code: code as Locale,
        }));
      } else {
        result.languages = [];
      }

      return result;
    });

    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(
      outputFile,
      JSON.stringify(filteredData, null, 2),
      "utf-8",
    );
    console.log(`Filtered data is written to "${outputFile}"`);
  } catch (error) {
    console.error(
      `Error occurred during data processing (${outputFile}):`,
      error,
    );
  }
}

function main() {
  const i18nMap = loadI18nData(I18N_FILE);

  DATAS.forEach(async ({ outputFile, category }) => {
    const inputFile = `./node_modules/warframe-items/data/json/${category}.json`;

    if (category === "Warframes") {
      await filterData<Warframe>(
        inputFile,
        outputFile,
        ["description", "uniqueName", "imageName", "armor", "name", "aura"],
        i18nMap,
      );
    } else if (category === "Primary") {
      await filterData<Weapon>(
        inputFile,
        outputFile,
        ["description", "uniqueName", "imageName", "name"],
        i18nMap,
      );
    }
  });
}

main();
