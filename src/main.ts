import { WFCD_CDN } from "./utils/cdn";
import { slugify } from "./utils/slugify";

import fs from "node:fs";
import path from "node:path";

const REMOTE_IMAGE_BASE_URL = WFCD_CDN;
const LOCAL_IMAGE_BASE_URL = "https://wfhub-api.cagatayldzz.com/img/";
const LOCAL_IMAGE_DIR = "./img";

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

const imageDownloads = new Map<string, Promise<void>>();
const missingImages = new Set<string>();
const generatedApiFiles = new Map<
  string,
  {
    item: ApiDetailItem;
    listItem: ApiItem;
    remoteImageName: string;
    fileName: string;
  }
>();

export function getImageFileName(imageName: string): string {
  return path.basename(imageName.split("?")[0]);
}

export function getLocalImageUrl(imageName: string): string {
  return `${LOCAL_IMAGE_BASE_URL}${getImageFileName(imageName)}`;
}

function downloadImage(imageName: string): Promise<void> {
  const fileName = getImageFileName(imageName);
  const existingDownload = imageDownloads.get(fileName);
  if (existingDownload) {
    return existingDownload;
  }

  const download = (async () => {
    const outputPath = path.join(LOCAL_IMAGE_DIR, fileName);
    try {
      await fs.promises.access(outputPath);
      return;
    } catch {
      // The image is not cached yet.
    }

    const response = await fetch(
      `${REMOTE_IMAGE_BASE_URL}${encodeURIComponent(fileName)}`
    );
    if (!response.ok) {
      if (response.status === 404) {
        missingImages.add(fileName);
        console.warn(`Image not found in WFCD assets: ${fileName}`);
        return;
      }

      throw new Error(
        `Unable to download image ${fileName}: ${response.status} ${response.statusText}`
      );
    }

    await fs.promises.writeFile(
      outputPath,
      Buffer.from(await response.arrayBuffer())
    );
  })();

  imageDownloads.set(fileName, download);
  return download;
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
    const fileName = getImageFileName(rawImageName);
    void downloadImage(rawImageName);

    return {
      ...(ability as RawAbility),
      imageName: getLocalImageUrl(fileName),
    };
  });
}

function restoreMissingAbilityImages(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(restoreMissingAbilityImages);
  }

  if (typeof value !== "object" || value === null) {
    return value;
  }

  const object = value as Record<string, unknown>;
  if (typeof object.imageName === "string") {
    const fileName = getImageFileName(object.imageName);
    if (missingImages.has(fileName)) {
      object.imageName = `${REMOTE_IMAGE_BASE_URL}${encodeURIComponent(fileName)}`;
    }
  }

  for (const child of Object.values(object)) {
    restoreMissingAbilityImages(child);
  }

  return object;
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
  await fs.promises.mkdir(LOCAL_IMAGE_DIR, { recursive: true });

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

    const remoteImageName = item.imageName.startsWith("http")
      ? item.imageName
      : `${REMOTE_IMAGE_BASE_URL}${encodeURIComponent(item.imageName)}`;
    const listItem: ApiItem = {
      name: item.name,
      imageName: getLocalImageUrl(item.imageName),
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
    void downloadImage(item.imageName);

    generatedApiFiles.set(path.join(apiOutputDir, `${slug}.json`), {
      item: detailItem,
      listItem,
      remoteImageName,
      fileName: getImageFileName(item.imageName),
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

  await Promise.all(imageDownloads.values());

  for (const [filePath, entry] of generatedApiFiles) {
    if (missingImages.has(entry.fileName)) {
      entry.item.imageName = entry.remoteImageName;
      entry.listItem.imageName = entry.remoteImageName;
    }

    entry.item.abilities = restoreMissingAbilityImages(
      entry.item.abilities
    ) as unknown[];

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
