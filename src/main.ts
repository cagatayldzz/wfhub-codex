import fs from "node:fs";
import path from "node:path";

import { WFCD_CDN } from "./utils/cdn";
import { slugify } from "./utils/slugify";

const REMOTE_IMAGE_BASE_URL = WFCD_CDN;

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

type ApiDetailItem = {
  uniqueName: string | null;
  name: string;
  description: string | null;
  health: number | null;
  shield: number | null;
  armor: number | null;
  stamina: number | null;
  power: number | null;
  masteryReq: number | null;
  sprintSpeed: number | null;
  abilities: unknown[];
  sprint: number | null;
  wikiaUrl: string | null;
  releaseDate: string | null;
  imageName: string;
  slug: string;
};

type RawItem = Record<string, unknown> & {
  name?: unknown;
  imageName?: unknown;
};

type RawAbility = Record<string, unknown> & {
  imageName?: unknown;
};

const generatedApiFiles = new Map<
  string,
  {
    item: ApiDetailItem;
  }
>();

export function getImageFileName(imageName: string): string {
  return path.basename(imageName.split("?")[0]);
}

export function getImageUrl(imageName: string): string {
  return `${REMOTE_IMAGE_BASE_URL}${encodeURIComponent(getImageFileName(imageName))}`;
}

function prepareAbilities(abilities: unknown[]): unknown[] {
  return abilities.map((ability) => {
    if (
      typeof ability !== "object" ||
      ability === null ||
      typeof (ability as RawAbility).imageName !== "string" ||
      !(ability as RawAbility).imageName
    ) {
      return ability;
    }

    const rawImageName = (ability as RawAbility).imageName as string;

    return {
      ...(ability as RawAbility),
      imageName: getImageUrl(rawImageName),
    };
  });
}

async function buildCategory(
  inputFile: string,
  apiOutputDir: string
): Promise<ApiItem[]> {
  const data: RawItem[] = JSON.parse(
    await fs.promises.readFile(inputFile, "utf-8")
  );
  const used = new Set<string>();
  const apiItems: ApiItem[] = [];

  await fs.promises.mkdir(apiOutputDir, { recursive: true });

  for (const item of data) {
    if (
      typeof item.name !== "string" ||
      typeof item.imageName !== "string" ||
      !item.imageName
    ) {
      continue;
    }

    const slug = slugify(item.name);
    if (used.has(slug)) {
      continue;
    }
    used.add(slug);

    const listItem: ApiItem = {
      name: item.name,
      imageName: getImageUrl(item.imageName),
      slug,
    };

    const detailItem: ApiDetailItem = {
      uniqueName: typeof item.uniqueName === "string" ? item.uniqueName : null,
      name: item.name,
      description:
        typeof item.description === "string" ? item.description : null,
      health: typeof item.health === "number" ? item.health : null,
      shield: typeof item.shield === "number" ? item.shield : null,
      armor: typeof item.armor === "number" ? item.armor : null,
      stamina: typeof item.stamina === "number" ? item.stamina : null,
      power: typeof item.power === "number" ? item.power : null,
      masteryReq: typeof item.masteryReq === "number" ? item.masteryReq : null,
      sprintSpeed:
        typeof item.sprintSpeed === "number" ? item.sprintSpeed : null,
      abilities: Array.isArray(item.abilities)
        ? prepareAbilities(item.abilities)
        : [],
      sprint: typeof item.sprint === "number" ? item.sprint : null,
      wikiaUrl: typeof item.wikiaUrl === "string" ? item.wikiaUrl : null,
      releaseDate:
        typeof item.releaseDate === "string" ? item.releaseDate : null,
      imageName: listItem.imageName,
      slug,
    };

    apiItems.push(listItem);
    generatedApiFiles.set(path.join(apiOutputDir, `${slug}.json`), {
      item: detailItem,
    });
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

  for (const [filePath, entry] of generatedApiFiles) {
    await fs.promises.writeFile(filePath, JSON.stringify(entry.item), "utf-8");
  }

  for (const result of results) {
    await fs.promises.writeFile(
      `./api/${slugify(result.category)}.json`,
      JSON.stringify(result.items),
      "utf-8"
    );
  }
}

if (import.meta.main) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
