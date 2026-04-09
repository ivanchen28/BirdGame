import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";
import type { Die, Player, RoundEndSpot } from "./types";

const client = createClient({
  publicApiKey: "pk_prod_YrPRZ9Jq9G6RnsNXsozxohxv-knwkFi02iqrbxoNUCZkXZifXE0ER9RKNqBUhfEw",
});

type Presence = {
  name: string | null;
  color: string | null;
};

const initialPresence: Presence = { name: null, color: null };

type Storage = {
  gamePhase: "lobby" | "playing";
  birdDeck: number[];
  birdTray: (number | null)[];
  bonusDeck: number[];
  birdDiscard: number[];
  bonusDiscard: number[];
  hummingbirdDeck: number[];
  hummingbirdTray: number[][];
  hummingbirdDiscard: number[];
  roundEndGoalIds: number[];
  roundEndSpots: RoundEndSpot[][];
  feederDice: Die[];
  takenDice: Die[];
  players: Record<string, Player>;
  initialized: boolean;
};

export const { RoomProvider, useStorage, useMutation, useUpdateMyPresence, useOthers, useSelf } = createRoomContext<
  Presence,
  Storage
>(client);

export { initialPresence };
export type { Presence };
