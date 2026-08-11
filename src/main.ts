import fs from "fs";
import path from "path";

import { slugify } from "./utils/slugify";
import { Translatable } from "./utils/type";

const REMOTE_IMAGE_BASE_URL =
  "https://raw.githubusercontent.com/WFCD/warframe-items/master/data/img/";
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

const imageDownloads = new Map<string, Promise<void>>();
const missingImages = new Set<string>();
const generatedApiFiles = new Map<
  string,
  { item: ApiItem; remoteImageName: string; fileName: string }
>();

function getImageFileName(imageName: string): string {
  return path.basename(imageName.split("?")[0]);
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
  await fs.promises.mkdir(LOCAL_IMAGE_DIR, { recursive: true });

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

    const remoteImageName = item.imageName.startsWith("http")
      ? item.imageName
      : `${REMOTE_IMAGE_BASE_URL}${encodeURIComponent(item.imageName)}`;
    const apiItem: ApiItem = {
      name: item.name,
      imageName: `${LOCAL_IMAGE_BASE_URL}${getImageFileName(item.imageName)}`,
      slug,
    };

    apiItems.push(apiItem);
    downloadImage(item.imageName);

    generatedApiFiles.set(path.join(apiOutputDir, `${slug}.json`), {
      item: apiItem,
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

  for (const result of results) {
    await fs.promises.writeFile(
      `./api/${slugify(result.category)}.json`,
      JSON.stringify(result.items),
      "utf-8"
    );
  }

  await Promise.all(imageDownloads.values());

  for (const [filePath, entry] of generatedApiFiles) {
    if (missingImages.has(entry.fileName)) {
      entry.item.imageName = entry.remoteImageName;
    }

    await fs.promises.writeFile(filePath, JSON.stringify(entry.item), "utf-8");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
