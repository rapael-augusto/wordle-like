import type { Afflatus } from "./afflatus";
import type { Dmg } from "./dmg";
import type { Race } from "./race";
import type { Rarity } from "./rarity";

export type NumericComparison = "Higher" | "Lower" | true;
export type AfflatusComparison = boolean | "Half";

export interface GuessResult {
  name: {
    value: string;
    correct: boolean;
  };
  rarity: {
    value: Rarity;
    comparison: NumericComparison;
  };
  afflatus: {
    value: Afflatus;
    correct: AfflatusComparison;
  };
  dmg_type: {
    value: Dmg;
    correct: boolean;
  };
  race: {
    value: Race;
    correct: boolean;
  };
  version: {
    value: number;
    comparison: NumericComparison;
  };
}