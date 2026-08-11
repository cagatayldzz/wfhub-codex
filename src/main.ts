import fs from "fs";
import path from "path";

import { slugify } from "./utils/slugify";
import { Translatable } from "./utils/type";

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
  apiOutputDir: `./api/${slugify(category)}`,
  category,
}));

type ApiItem = {
  name: string;
  imageName: string;
  slug: string;
};

async function buildCategory(
  inputFile: string,
  apiOutputDir: string,
): Promise<ApiItem[]> {
  const data: Translatable[] = JSON.parse(
    await fs.promises.readFile(inputFile, "utf-8")
  );
  const used = new Set<string>();
  const apiItems: ApiItem[] = [];

  await fs.promises.mkdir(apiOutputDir, { recursive: true });

  for (const item of data) {
    const slug = slugify(item.name);
    if (used.has(slug)) {
      continue;
    }
    used.add(slug);

    if (
      typeof item.name !== "string" ||
      typeof item.imageName !== "string" ||
      !item.imageName
    ) {
      continue;
    }

    const apiItem: ApiItem = {
      name: item.name,
      imageName: item.imageName.startsWith("http")
        ? item.imageName
        : `https://raw.githubusercontent.com/WFCD/warframe-items/master/data/img/${item.imageName}`,
      slug,
    };

    apiItems.push(apiItem);

    await fs.promises.writeFile(
      path.join(apiOutputDir, `${slug}.json`),
      JSON.stringify(apiItem),
      "utf-8"
    );
  }

  return apiItems;
}

async function main(): Promise<void> {
  const results = await Promise.all(
    CONFIG.map(async ({ inputFile, apiOutputDir, category }) => ({
      category,
      items: await buildCategory(inputFile, apiOutputDir),
    }))
  );

  await fs.promises.mkdir("./api", { recursive: true });

  for (const result of results) {
    await fs.promises.writeFile(
      `./api/${slugify(result.category)}.json`,
      JSON.stringify(result.items),
      "utf-8"
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
