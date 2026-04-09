import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";
import type { Die, Player, RoundEndSpot } from "./types";

const client = createClient({
  publicApiKey: "pk_prod_YrPRZ9Jq9G6RnsNXsozxohxv-knwkFi02iqrbxoNUCZkXZifXE0ER9RKNqBUhfEw",
});

type Presence = Record<string, never>;

type Storage = {
  birdDeck: number[];
  birdTray: (number | null)[];
  bonusDeck: number[];
  birdDiscard: number[];
  bonusDiscard: number[];
  hummingbirdDeck: number[];
  hummingbirdTray: (number | null)[];
  hummingbirdDiscard: number[];
  roundEndGoalIds: number[];
  roundEndSpots: RoundEndSpot[][];
  feederDice: Die[];
  takenDice: Die[];
  player: Player;
  initialized: boolean;
};

export const { RoomProvider, useStorage, useMutation } = createRoomContext<Presence, Storage>(client);
