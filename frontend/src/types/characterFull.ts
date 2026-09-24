import type { Afflatus } from "./afflatus";
import type { Rarity } from "./rarity";

export interface CharacterFull {
  name: string;
  slug: string;
  afflatus: Afflatus;
  rarity: Rarity;
  version: number;
}
