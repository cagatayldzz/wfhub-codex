import { Warframe, Locale } from "@wfcd/items";

type Languages = { description?: string; name: string; code: Locale }[];

export type Translatable = {
  description: Warframe["description"];
  sprintSpeed: Warframe["sprintSpeed"];
  uniqueName: Warframe["uniqueName"];
  imageName?: Warframe["imageName"];
  abilities: Warframe["abilities"];
  stamina: Warframe["stamina"];
  health: Warframe["health"];
  shield: Warframe["shield"];
  armor: Warframe["armor"];
  power: Warframe["power"];
  name: Warframe["name"];
  aura: Warframe["aura"];
  languages?: Languages;
};
