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

// ── Round End Goals ──

export interface RoundEndGoal {
  Goal: string;
  id: number;
}

/** A single placement spot on the round end goal board. Tracks which player colors have cubes here. */
export type RoundEndSpot = {
  cubeColors: string[];
};

/** State for the entire round end goal board: 4 rounds × 4 placement spots, plus the goals. */
export interface RoundEndGoalBoardState {
  goals: RoundEndGoal[];
  /** spots[round][placement] — round 0-3, placement 0-3 (1st, 2nd, 3rd, 0pt) */
  spots: RoundEndSpot[][];
}

export function createRoundEndGoalBoardState(goals: RoundEndGoal[]): RoundEndGoalBoardState {
  return {
    goals,
    spots: Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => ({ cubeColors: [] }))),
  };
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

// ── Played Bird State (ID-based, for game state storage) ──

export type PlayedBirdState = {
  id: number;
  eggsLaid: number;
  tuckedCardIds: number[];
  cachedFood: FoodSupply;
};

export function toPlayedBirdState(birdId: number): PlayedBirdState {
  return {
    id: birdId,
    eggsLaid: 0,
    tuckedCardIds: [],
    cachedFood: { invertebrate: 0, seed: 0, fish: 0, fruit: 0, rodent: 0, nectar: 0 },
  };
}

// ── Food ──

export const FoodTypes = ["invertebrate", "seed", "fish", "fruit", "rodent", "nectar"] as const;
export type FoodType = (typeof FoodTypes)[number];

export type FoodSupply = {
  invertebrate: number;
  seed: number;
  fish: number;
  fruit: number;
  rodent: number;
  nectar: number;
};

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

export type Die = {
  id: number;
  possibleFaces: DieFace[];
  currentFace: DieFace;
  isNectar: boolean;
};

export const BaseFaces: DieFace[] = ["invertebrateSeed", "invertebrate", "seed", "fish", "rodent", "fruit"];
export const NectarFaces: DieFace[] = [
  "invertebrateSeed",
  "invertebrate",
  "seedNectar",
  "fish",
  "rodent",
  "fruitNectar",
];

export function createDie(id: number, isNectar: boolean): Die {
  const possibleFaces = isNectar ? NectarFaces : BaseFaces;
  return {
    id,
    possibleFaces,
    currentFace: possibleFaces[Math.floor(Math.random() * possibleFaces.length)],
    isNectar,
  };
}

/** Creates the standard feeder set: 2 base dice + 3 nectar dice. */
export function createFeederDice(): Die[] {
  return [
    rollDie(createDie(0, false)),
    rollDie(createDie(1, false)),
    rollDie(createDie(2, true)),
    rollDie(createDie(3, true)),
    rollDie(createDie(4, true)),
  ];
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

export type Habitat = {
  type: HabitatType;
  birds: PlayedBirdState[];
  hummingbird: number | null;
  spentNectar: number;
  actionCubes: number;
  activeCube: number | null;
};

// ── Player ──

export type Player = {
  name: string;
  cubeColor: string;
  actionCubes: number;
  playABirdCubes: number;
  birdHand: number[];
  bonusHand: number[];
  food: FoodSupply;
  habitats: Record<HabitatType, Habitat>;
  hummingbirdTrack: Record<HummingbirdGroup, number>;
  hummingbirdTrackPattern: number[];
};

export function createPlayer(name: string, cubeColor: string): Player {
  return {
    name,
    cubeColor,
    actionCubes: 8,
    playABirdCubes: 0,
    birdHand: [],
    bonusHand: [],
    food: { invertebrate: 0, seed: 0, fish: 0, fruit: 0, rodent: 0, nectar: 0 },
    hummingbirdTrack: { bee: 0, brilliant: 0, emerald: 0, mango: 0, topaz: 0 },
    hummingbirdTrackPattern: generateTrackPattern(),
    habitats: {
      forest: {
        type: "forest",
        birds: [],
        hummingbird: null,
        spentNectar: 0,
        actionCubes: 0,
        activeCube: null,
      },
      grassland: {
        type: "grassland",
        birds: [],
        hummingbird: null,
        spentNectar: 0,
        actionCubes: 0,
        activeCube: null,
      },
      wetland: {
        type: "wetland",
        birds: [],
        hummingbird: null,
        spentNectar: 0,
        actionCubes: 0,
        activeCube: null,
      },
    },
  };
}

// ── Player Slots ──

export const PLAYER_SLOTS = ["player1", "player2", "player3", "player4"] as const;
export type PlayerSlot = (typeof PLAYER_SLOTS)[number];
export const MAX_PLAYERS = PLAYER_SLOTS.length;
