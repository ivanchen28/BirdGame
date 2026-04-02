// ── Bird Cards ──

export interface BirdCard {
  "Common name": string;
  "Scientific name": string;
  Set: string;
  Color: string;
  "Power text": string | null;
  Predator: boolean | null;
  Flocking: boolean | null;
  "Bonus card": boolean | null;
  "Victory points": number;
  "Nest type": string;
  "Egg limit": number;
  Wingspan: number;
  Forest: boolean | null;
  Grassland: boolean | null;
  Wetland: boolean | null;
  Invertebrate: number | null;
  Seed: number | null;
  Fish: number | null;
  Fruit: number | null;
  Rodent: number | null;
  Nectar: number | null;
  "Wild (food)": number | null;
  "/ (food cost)": boolean | null;
  "* (food cost)": boolean | null;
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
  "VP Average": number;
  CardType: string;
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

// ── Habitats ──

export type HabitatType = "forest" | "grassland" | "wetland";

export interface Habitat {
  type: HabitatType;
  birds: BirdCard[];
  nectar: number;
  actionCubes: number;
}

// ── Player ──

export interface Player {
  name: string;
  cubeColor: string;
  birdHand: BirdCard[];
  bonusHand: BonusCard[];
  food: FoodSupply;
  habitats: Record<HabitatType, Habitat>;
  tuckedCards: number;
  cachedFood: number;
}

export function createPlayer(name: string, cubeColor: string): Player {
  return {
    name,
    cubeColor,
    birdHand: [],
    bonusHand: [],
    food: { invertebrate: 0, seed: 0, fish: 0, fruit: 0, rodent: 0, nectar: 0 },
    habitats: {
      forest: { type: "forest", birds: [], nectar: 0, actionCubes: 0 },
      grassland: { type: "grassland", birds: [], nectar: 0, actionCubes: 0 },
      wetland: { type: "wetland", birds: [], nectar: 0, actionCubes: 0 },
    },
    tuckedCards: 0,
    cachedFood: 0,
  };
}
