import birdsData from "../assets/data/birds.json";
import bonusData from "../assets/data/bonus.json";
import goalsData from "../assets/data/goals.json";
import hummingbirdsData from "../assets/data/hummingbirds.json";
import type { BirdCard, BonusCard, HummingbirdCard, PlayedBirdCard, PlayedBirdState, RoundEndGoal } from "./types";

const birdMap = new Map<number, BirdCard>();
for (const bird of birdsData as BirdCard[]) birdMap.set(bird.id, bird);

const bonusMap = new Map<number, BonusCard>();
for (const bonus of bonusData as BonusCard[]) bonusMap.set(bonus.id, bonus);

const hummingbirdMap = new Map<number, HummingbirdCard>();
for (const hb of hummingbirdsData as HummingbirdCard[]) hummingbirdMap.set(hb.id, hb);

const goalMap = new Map<number, RoundEndGoal>();
for (const goal of goalsData as RoundEndGoal[]) goalMap.set(goal.id, goal);

export function getBird(id: number): BirdCard {
  const bird = birdMap.get(id);
  if (!bird) throw new Error(`Bird ID ${id} not found`);
  return bird;
}

export function getBonus(id: number): BonusCard {
  const bonus = bonusMap.get(id);
  if (!bonus) throw new Error(`Bonus card ID ${id} not found`);
  return bonus;
}

export function getHummingbird(id: number): HummingbirdCard {
  const hb = hummingbirdMap.get(id);
  if (!hb) throw new Error(`Hummingbird card ID ${id} not found`);
  return hb;
}

export function getGoal(id: number): RoundEndGoal {
  const goal = goalMap.get(id);
  if (!goal) throw new Error(`Goal ID ${id} not found`);
  return goal;
}

export function resolvePlayedBird(state: PlayedBirdState): PlayedBirdCard {
  const bird = getBird(state.id);
  return {
    ...bird,
    eggsLaid: state.eggsLaid,
    tuckedCards: state.tuckedCardIds.map(getBird),
    cachedFood: state.cachedFood,
  };
}

export const allBirdIds: number[] = [...birdMap.keys()];
export const allBonusIds: number[] = [...bonusMap.keys()];
export const allHummingbirdIds: number[] = [...hummingbirdMap.keys()];
export const allGoalIds: number[] = [...goalMap.keys()];
