import { Locale } from "warframe-items";

type Languages = { description: string; name: string; code: Locale }[];

export type Translatable = {
  languages?: Languages;
  imageName?: string;
  uniqueName: string;
};
