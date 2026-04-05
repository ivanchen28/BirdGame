// ── Bird Cards ──

export interface BirdCard {
  "Common name": string;
  "Scientific name": string;
  Set: string;
  Color: string;
  "Power text": string | null;
  Predator: boolean;
  Flocking: boolean;
  "Bonus card": boolean;
  "Victory points": number;
  "Nest type": string;
  "Egg limit": number;
  Wingspan: number;
  Forest: boolean;
  Grassland: boolean;
  Wetland: boolean;
  Food: string[];
  OrFoodCost: boolean;
  AlternateFoodCost: boolean;
  "Total food cost": number;
  "Beak direction": string | null;
  id: number;
  "Native name": string | null;
  "Flavor text": string | null;
  "North America": boolean | null;
  "Central America": boolean | null;
  "South America": boolean | null;
  Europe: boolean | null;
  Asia: boolean | null;
  Africa: boolean | null;
  Oceania: boolean | null;
  Anatomist: boolean | null;
  Cartographer: boolean | null;
  Historian: boolean | null;
  Photographer: boolean | null;
}

// ── Bonus Cards ──

export interface BonusCard {
  id: number;
  "Bonus card": string;
  Set: string;
  Automa: string | null;
  Condition: string;
  "Explanatory text": string | null;
  VP: string | null;
  "%": number | string;
  Note: string | null;
  rulings: { text: string; source: string }[];
}

// ── Food ──

export type FoodType = "invertebrate" | "seed" | "fish" | "fruit" | "rodent" | "nectar";

export interface FoodSupply {
  invertebrate: number;
  seed: number;
  fish: number;
  fruit: number;
  rodent: number;
  nectar: number;
}

// ── Dice ──

export type DieFace =
  | "invertebrateSeed"
  | "invertebrate"
  | "seed"
  | "fish"
  | "rodent"
  | "fruit"
  | "seedNectar"
  | "fruitNectar";

export interface Die {
  id: number;
  possibleFaces: DieFace[];
  currentFace: DieFace;
  isNectar: boolean;
}

const BASE_FACES: DieFace[] = ["invertebrateSeed", "invertebrate", "seed", "fish", "rodent", "fruit"];
const NECTAR_FACES: DieFace[] = ["invertebrateSeed", "invertebrate", "seedNectar", "fish", "rodent", "fruitNectar"];

export function createDie(id: number, isNectar: boolean): Die {
  const possibleFaces = isNectar ? NECTAR_FACES : BASE_FACES;
  return {
    id,
    possibleFaces,
    currentFace: possibleFaces[Math.floor(Math.random() * possibleFaces.length)],
    isNectar,
  };
}

export function rollDie(die: Die): Die {
  return {
    ...die,
    currentFace: die.possibleFaces[Math.floor(Math.random() * die.possibleFaces.length)],
  };
}

// ── Habitats ──

export type HabitatType = "forest" | "grassland" | "wetland";

export interface Habitat {
  type: HabitatType;
  birds: BirdCard[];
  nectar: number;
  actionCubes: number;
  activeCube?: number;
}

// ── Player ──

export interface Player {
  name: string;
  cubeColor: string;
  birdHand: BirdCard[];
  bonusHand: BonusCard[];
  food: FoodSupply;
  habitats: Record<HabitatType, Habitat>;
}

export function createPlayer(name: string, cubeColor: string): Player {
  return {
    name,
    cubeColor,
    birdHand: [],
    bonusHand: [],
    food: { invertebrate: 0, seed: 0, fish: 0, fruit: 0, rodent: 0, nectar: 0 },
    habitats: {
      forest: { type: "forest", birds: [], nectar: 0, actionCubes: 0, activeCube: undefined },
      grassland: { type: "grassland", birds: [], nectar: 0, actionCubes: 0, activeCube: undefined },
      wetland: { type: "wetland", birds: [], nectar: 0, actionCubes: 0, activeCube: undefined },
    },
  };
}
