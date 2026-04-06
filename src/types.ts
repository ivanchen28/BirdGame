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

// ── Hummingbird Cards ──

export type HummingbirdGroup = "bee" | "brilliant" | "emerald" | "mango" | "topaz";
export const HummingbirdGroups: HummingbirdGroup[] = ["bee", "brilliant", "emerald", "mango", "topaz"];
export type HummingbirdBenefit = "nectar" | "egg" | "card" | "advance" | "row";

export interface HummingbirdCard {
  "Common name": string;
  "Scientific name": string;
  Group: HummingbirdGroup;
  Benefit: HummingbirdBenefit;
  "Beak direction": "L" | "R";
  Anatomist: string | null;
  Cartographer: string | null;
  Photographer: string | null;
  id: number;
}

/**
 * Each column on the hummingbird track has hummingbird icons at two specific rows.
 * Row indices are bottom-up: 0 = bottom (icon/start row), 8 = top (10 pts).
 * Pattern N places icons at rows N and N+4. Two columns get pattern 4, one each gets 3, 2, 1.
 * The array has 5 elements, one per group column (bee, brilliant, emerald, mango, topaz).
 */
function generateTrackPattern(): number[] {
  const patterns = [4, 4, 3, 2, 1];
  // Fisher-Yates shuffle
  for (let i = patterns.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [patterns[i], patterns[j]] = [patterns[j], patterns[i]];
  }
  return patterns;
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

// ── Played Bird Cards ──

export interface PlayedBirdCard extends BirdCard {
  eggsLaid: number;
  tuckedCards: BirdCard[];
  cachedFood: FoodSupply;
}

export function toPlayedBird(bird: BirdCard): PlayedBirdCard {
  return {
    ...bird,
    eggsLaid: 0,
    tuckedCards: [],
    cachedFood: { invertebrate: 0, seed: 0, fish: 0, fruit: 0, rodent: 0, nectar: 0 },
  };
}

// ── Food ──

export const FoodTypes = ["invertebrate", "seed", "fish", "fruit", "rodent", "nectar"] as const;
export type FoodType = (typeof FoodTypes)[number];

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

export const HabitatTypes = ["forest", "grassland", "wetland"] as const;
export type HabitatType = (typeof HabitatTypes)[number];

export interface Habitat {
  type: HabitatType;
  birds: PlayedBirdCard[];
  hummingbird?: HummingbirdCard;
  spentNectar: number;
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
  hummingbirdTrack: Record<HummingbirdGroup, number>;
  hummingbirdTrackPattern: number[];
}

export function createPlayer(name: string, cubeColor: string): Player {
  return {
    name,
    cubeColor,
    birdHand: [],
    bonusHand: [],
    food: { invertebrate: 0, seed: 0, fish: 0, fruit: 0, rodent: 0, nectar: 0 },
    hummingbirdTrack: { bee: 0, brilliant: 0, emerald: 0, mango: 0, topaz: 0 },
    hummingbirdTrackPattern: generateTrackPattern(),
    habitats: {
      forest: {
        type: "forest",
        birds: [],
        hummingbird: undefined,
        spentNectar: 0,
        actionCubes: 0,
        activeCube: undefined,
      },
      grassland: {
        type: "grassland",
        birds: [],
        hummingbird: undefined,
        spentNectar: 0,
        actionCubes: 0,
        activeCube: undefined,
      },
      wetland: {
        type: "wetland",
        birds: [],
        hummingbird: undefined,
        spentNectar: 0,
        actionCubes: 0,
        activeCube: undefined,
      },
    },
  };
}
