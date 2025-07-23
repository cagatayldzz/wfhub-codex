import * as fs from "fs";

import { Locale } from "@wfcd/items";

export async function loadI18nData(
  i18nFile: string,
): Promise<
  Record<string, Record<Locale, { description: string; name: string }>>
> {
  console.log("Loading i18n data...");
  const rawData = await fs.promises.readFile(i18nFile, "utf-8");
  console.log("i18n data loaded.");
  return JSON.parse(rawData);
}
