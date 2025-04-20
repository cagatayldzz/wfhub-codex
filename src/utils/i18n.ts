import * as fs from "fs";

import { Locale } from "@wfcd/items";

export function loadI18nData(
  i18nFile: string,
): Record<string, Record<Locale, { description: string; name: string }>> {
  console.log("Loading i18n data...");
  const rawData = fs.readFileSync(i18nFile, "utf-8");
  const i18n: Record<
    string,
    Record<Locale, { description: string; name: string }>
  > = JSON.parse(rawData);
  console.log("i18n data loaded.");
  return i18n;
}
