import { Locale } from "warframe-items";

type Languages = { description?: string; name: string; code: Locale }[];

export type Translatable = {
  languages?: Languages;
  description: string;
  imageName?: string;
  uniqueName: string;
  armor: number;
  name: string;
  aura: string;
};
