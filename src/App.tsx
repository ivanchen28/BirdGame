import { useCallback, useMemo, useState } from "react";
import birdBackUrl from "../assets/cards/backgrounds/bird-background.jpg";
import bonusBackUrl from "../assets/cards/backgrounds/bonus-background.jpg";
import {
  allBirdIds,
  allBonusIds,
  allGoalIds,
  allHummingbirdIds,
  getBird,
  getBonus,
  getGoal,
  getHummingbird,
} from "./cardLookup";
import { BirdCardDisplay } from "./components/BirdCardDisplay";
import { BirdDeck } from "./components/BirdDeck";
import { BirdDiscardPile } from "./components/BirdDiscardPile";
import { BirdFeeder } from "./components/BirdFeeder";
import { BirdTray } from "./components/BirdTray";
import { BonusCardDisplay } from "./components/BonusCardDisplay";
import { BonusDeck } from "./components/BonusDeck";
import { BonusDiscardPile } from "./components/BonusDiscardPile";
import { CardDock } from "./components/CardDock";
import { CardListModal } from "./components/CardListModal";
import { CardWithDiscard } from "./components/CardWithDiscard";
import { GameBoard } from "./components/GameBoard";
import { HummingbirdCardDisplay } from "./components/HummingbirdCardDisplay";
import { HummingbirdDeck } from "./components/HummingbirdDeck";
import { HummingbirdDiscardPile } from "./components/HummingbirdDiscardPile";
import { HummingbirdTrack } from "./components/HummingbirdTrack";
import { HummingbirdTray } from "./components/HummingbirdTray";
import { Lobby } from "./components/Lobby";
import { RoundEndGoalBoard } from "./components/RoundEndGoalBoard";
import { foodUrl, iconUrl } from "./icons";
import { initialPresence, RoomProvider, useMutation, useStorage } from "./liveblocks.config";
import {
  createDie,
  rollDie,
  toPlayedBirdState,
  type BirdCard,
  type BonusCard,
  type FoodType,
  type HabitatType,
  type HummingbirdCard,
  type HummingbirdGroup,
  type Player,
  type RoundEndSpot,
} from "./types";

const FOOD_DISPLAY_NAMES: Record<FoodType, string> = {
  invertebrate: "WORM",
  seed: "WHEAT",
  fruit: "BERRY",
  fish: "FISH",
  rodent: "RAT",
  nectar: "NECTAR",
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const HAND_CARD_HEIGHT = 185;
const HAND_CARD_WIDTH = HAND_CARD_HEIGHT * 0.655;
const BONUS_CARD_WIDTH = HAND_CARD_HEIGHT * (1 / 1.526);
const HAND_AREA_HEIGHT = HAND_CARD_HEIGHT + 12;

const DECK_CARD_HEIGHT = 180;
const DECK_CARD_WIDTH = DECK_CARD_HEIGHT * 0.655;
const DECK_BONUS_WIDTH = DECK_CARD_HEIGHT * (1 / 1.526);

const HUMMINGBIRD_SCALE = 44 / 57;
const DECK_HUMMINGBIRD_HEIGHT = DECK_CARD_HEIGHT * HUMMINGBIRD_SCALE;
const DECK_HUMMINGBIRD_WIDTH = DECK_HUMMINGBIRD_HEIGHT * 0.655;

const DICE_COUNT = 5;

function createInitialStorage() {
  const shuffledBirds = shuffle(allBirdIds);
  const shuffledBonus = shuffle(allBonusIds);
  const shuffledHummingbirds = shuffle(allHummingbirdIds);
  const shuffledGoals = shuffle(allGoalIds);
  const initialDice = Array.from({ length: DICE_COUNT }, (_, i) => rollDie(createDie(i, false)));

  return {
    gamePhase: "lobby" as const,
    birdDeck: shuffledBirds.slice(3),
    birdTray: shuffledBirds.slice(0, 3) as (number | null)[],
    bonusDeck: shuffledBonus,
    birdDiscard: [] as number[],
    bonusDiscard: [] as number[],
    hummingbirdDeck: shuffledHummingbirds.slice(5),
    hummingbirdTray: shuffledHummingbirds.slice(0, 5) as (number | null)[],
    hummingbirdDiscard: [] as number[],
    roundEndGoalIds: shuffledGoals.slice(0, 4),
    roundEndSpots: Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => ({ cubeColors: [] as string[] }))),
    feederDice: initialDice,
    takenDice: [] as typeof initialDice,
    players: {} as Record<string, Player>,
    initialized: true,
  };
}

function App() {
  const [playerName, setPlayerName] = useState<string | null>(() => localStorage.getItem("wingspan-playerName"));

  const handleJoin = (name: string) => {
    if (name) {
      localStorage.setItem("wingspan-playerName", name);
      setPlayerName(name);
    } else {
      localStorage.removeItem("wingspan-playerName");
      setPlayerName(null);
    }
  };

  return (
    <RoomProvider id="wingspan-game-v2" initialPresence={initialPresence} initialStorage={createInitialStorage()}>
      <GameLoader playerName={playerName} onJoin={handleJoin} />
    </RoomProvider>
  );
}

function GameLoader({ playerName, onJoin }: { playerName: string | null; onJoin: (name: string) => void }) {
  const isReady = useStorage((root) => root.initialized);
  const gamePhase = useStorage((root) => root.gamePhase);
  const [enteredGame, setEnteredGame] = useState(false);

  if (isReady == null) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-800 to-emerald-950 flex items-center justify-center">
        <div className="text-white text-xl font-semibold">Connecting…</div>
      </div>
    );
  }

  if (gamePhase === "playing" && enteredGame && playerName) {
    return <Game currentPlayerId={playerName} />;
  }

  return <Lobby playerName={playerName} onJoin={onJoin} onEnterGame={() => setEnteredGame(true)} />;
}

function Game({ currentPlayerId }: { currentPlayerId: string }) {
  // ── Read synced state from Liveblocks ──
  const allPlayers = useStorage((root) => root.players) as Record<string, Player> | null;
  const player = useStorage((root) => root.players[currentPlayerId] as Player)!;
  const deck = useStorage((root) => root.birdDeck)!;
  const birdTray = useStorage((root) => root.birdTray)!;
  const bonusDeck = useStorage((root) => root.bonusDeck)!;
  const birdDiscard = useStorage((root) => root.birdDiscard)!;
  const bonusDiscard = useStorage((root) => root.bonusDiscard)!;
  const hummingbirdDeck = useStorage((root) => root.hummingbirdDeck)!;
  const hummingbirdTray = useStorage((root) => root.hummingbirdTray)!;
  const hummingbirdDiscard = useStorage((root) => root.hummingbirdDiscard)!;
  const roundEndGoalIds = useStorage((root) => root.roundEndGoalIds)!;
  const roundEndSpots = useStorage((root) => root.roundEndSpots)!;

  // ── Board viewing state ──
  const [viewingPlayerId, setViewingPlayerId] = useState<string>(currentPlayerId);
  const isViewingOther = viewingPlayerId !== currentPlayerId;
  const viewedPlayer = allPlayers?.[viewingPlayerId] ?? player;
  const playerNames = allPlayers ? Object.keys(allPlayers) : [];

  // ── Local UI state (not synced) ──
  const [placingHummingbird, setPlacingHummingbird] = useState<number | null>(null);
  const [placingHummingbirdSource, setPlacingHummingbirdSource] = useState<"deck" | number | null>(null);
  const [discardModal, setDiscardModal] = useState<"bird" | "bonus" | "hummingbird" | null>(null);
  const [placingBird, setPlacingBird] = useState<number | null>(null);
  const [tuckingBird, setTuckingBird] = useState<number | null>(null);
  const [layingEggs, setLayingEggs] = useState(false);
  const [cachingFood, setCachingFood] = useState<FoodType | null>(null);
  const [viewingTucked, setViewingTucked] = useState<{ habitat: HabitatType; birdIndex: number } | null>(null);
  const [migratingBird, setMigratingBird] = useState<{ habitat: HabitatType; birdIndex: number } | null>(null);
  const [placingCube, setPlacingCube] = useState(false);

  // Helper to read current player from storage within mutations
  const pid = currentPlayerId;

  // ── Synced mutations ──

  const playBirdToHabitat = useMutation(
    ({ storage }, habitat: HabitatType) => {
      if (!placingBird) return;
      const birdId = placingBird;
      const p = storage.get("players")[pid];
      storage.set("players", {
        ...storage.get("players"),
        [pid]: {
          ...p,
          birdHand: p.birdHand.filter((id: number) => id !== birdId),
          habitats: {
            ...p.habitats,
            [habitat]: {
              ...p.habitats[habitat],
              birds: [...p.habitats[habitat].birds, toPlayedBirdState(birdId)],
            },
          },
        },
      });
      setPlacingBird(null);
    },
    [placingBird, pid],
  );

  const tuckBirdBehind = useMutation(
    ({ storage }, habitat: HabitatType, birdIndex: number) => {
      if (!tuckingBird) return;
      const cardId = tuckingBird;
      const p = storage.get("players")[pid];
      const birds = [...p.habitats[habitat].birds];
      const target = birds[birdIndex];
      birds[birdIndex] = {
        ...target,
        tuckedCardIds: [...target.tuckedCardIds, cardId],
      };
      storage.set("players", {
        ...storage.get("players"),
        [pid]: {
          ...p,
          birdHand: p.birdHand.filter((id: number) => id !== cardId),
          habitats: {
            ...p.habitats,
            [habitat]: { ...p.habitats[habitat], birds },
          },
        },
      });
      setTuckingBird(null);
    },
    [tuckingBird, pid],
  );

  const layEggOnBird = useMutation(
    ({ storage }, habitat: HabitatType, birdIndex: number) => {
      const p = storage.get("players")[pid];
      const birds = [...p.habitats[habitat].birds];
      const target = birds[birdIndex];
      birds[birdIndex] = { ...target, eggsLaid: target.eggsLaid + 1 };
      storage.set("players", {
        ...storage.get("players"),
        [pid]: {
          ...p,
          habitats: { ...p.habitats, [habitat]: { ...p.habitats[habitat], birds } },
        },
      });
    },
    [pid],
  );

  const removeEggFromBird = useMutation(
    ({ storage }, habitat: HabitatType, birdIndex: number) => {
      const p = storage.get("players")[pid];
      const birds = [...p.habitats[habitat].birds];
      const target = birds[birdIndex];
      if (target.eggsLaid <= 0) return;
      birds[birdIndex] = { ...target, eggsLaid: target.eggsLaid - 1 };
      storage.set("players", {
        ...storage.get("players"),
        [pid]: {
          ...p,
          habitats: { ...p.habitats, [habitat]: { ...p.habitats[habitat], birds } },
        },
      });
    },
    [pid],
  );

  const gainFood = useMutation(
    ({ storage }, foodType: FoodType) => {
      const p = storage.get("players")[pid];
      storage.set("players", {
        ...storage.get("players"),
        [pid]: { ...p, food: { ...p.food, [foodType]: p.food[foodType] + 1 } },
      });
    },
    [pid],
  );

  const removeFood = useMutation(
    ({ storage }, foodType: FoodType) => {
      const p = storage.get("players")[pid];
      if (p.food[foodType] <= 0) return;
      storage.set("players", {
        ...storage.get("players"),
        [pid]: { ...p, food: { ...p.food, [foodType]: p.food[foodType] - 1 } },
      });
    },
    [pid],
  );

  const cacheFoodOnBird = useMutation(
    ({ storage }, habitat: HabitatType, birdIndex: number) => {
      if (!cachingFood) return;
      const foodType = cachingFood;
      const p = storage.get("players")[pid];
      if (p.food[foodType] <= 0) return;
      const birds = [...p.habitats[habitat].birds];
      const target = birds[birdIndex];
      birds[birdIndex] = {
        ...target,
        cachedFood: { ...target.cachedFood, [foodType]: target.cachedFood[foodType] + 1 },
      };
      storage.set("players", {
        ...storage.get("players"),
        [pid]: {
          ...p,
          food: { ...p.food, [foodType]: p.food[foodType] - 1 },
          habitats: { ...p.habitats, [habitat]: { ...p.habitats[habitat], birds } },
        },
      });
      setCachingFood(null);
    },
    [cachingFood, pid],
  );

  const unTuck = useMutation(
    ({ storage }, cardId: number) => {
      if (!viewingTucked) return;
      const p = storage.get("players")[pid];
      const birds = [...p.habitats[viewingTucked.habitat].birds];
      const target = birds[viewingTucked.birdIndex];
      if (!target.tuckedCardIds.includes(cardId)) return;
      birds[viewingTucked.birdIndex] = {
        ...target,
        tuckedCardIds: target.tuckedCardIds.filter((id: number) => id !== cardId),
      };
      storage.set("players", {
        ...storage.get("players"),
        [pid]: {
          ...p,
          birdHand: [...p.birdHand, cardId],
          habitats: {
            ...p.habitats,
            [viewingTucked.habitat]: { ...p.habitats[viewingTucked.habitat], birds },
          },
        },
      });
      const remaining = birds[viewingTucked.birdIndex].tuckedCardIds.length;
      if (remaining <= 0) setViewingTucked(null);
    },
    [viewingTucked, pid],
  );

  const startMigrate = useCallback((habitat: HabitatType, birdIndex: number) => {
    setMigratingBird({ habitat, birdIndex });
  }, []);

  const completeMigrate = useMutation(
    ({ storage }, targetHabitat: HabitatType) => {
      if (!migratingBird) return;
      const { habitat: srcHabitat, birdIndex } = migratingBird;
      const p = storage.get("players")[pid];
      const srcBirds = [...p.habitats[srcHabitat].birds];
      const bird = srcBirds[birdIndex];
      if (!bird) return;
      srcBirds.splice(birdIndex, 1);
      const destBirds = [...p.habitats[targetHabitat].birds, bird];
      storage.set("players", {
        ...storage.get("players"),
        [pid]: {
          ...p,
          habitats: {
            ...p.habitats,
            [srcHabitat]: { ...p.habitats[srcHabitat], birds: srcBirds },
            [targetHabitat]: { ...p.habitats[targetHabitat], birds: destBirds },
          },
        },
      });
      setMigratingBird(null);
    },
    [migratingBird, pid],
  );

  const placeActionCube = useMutation(
    ({ storage }, habitat: HabitatType | "playABird") => {
      const p = storage.get("players")[pid];
      if (p.actionCubes <= 0) return;
      if (habitat === "playABird") {
        storage.set("players", {
          ...storage.get("players"),
          [pid]: {
            ...p,
            actionCubes: p.actionCubes - 1,
            playABirdCubes: p.playABirdCubes + 1,
          },
        });
      } else {
        if (p.habitats[habitat].activeCube !== null) return;
        const birdCount = p.habitats[habitat].birds.length;
        const slot = birdCount < 5 ? birdCount + 1 : 6;
        storage.set("players", {
          ...storage.get("players"),
          [pid]: {
            ...p,
            actionCubes: p.actionCubes - 1,
            habitats: {
              ...p.habitats,
              [habitat]: { ...p.habitats[habitat], activeCube: slot },
            },
          },
        });
      }
      setPlacingCube(false);
    },
    [pid],
  );

  const handleCubeClick = useMutation(
    ({ storage }, habitat: HabitatType, shiftKey: boolean) => {
      const p = storage.get("players")[pid];
      const current = p.habitats[habitat].activeCube;
      if (current == null) return;
      if (shiftKey) {
        if (current >= 6) {
          storage.set("players", {
            ...storage.get("players"),
            [pid]: {
              ...p,
              actionCubes: p.actionCubes + 1,
              habitats: { ...p.habitats, [habitat]: { ...p.habitats[habitat], activeCube: null } },
            },
          });
        } else {
          storage.set("players", {
            ...storage.get("players"),
            [pid]: {
              ...p,
              habitats: { ...p.habitats, [habitat]: { ...p.habitats[habitat], activeCube: current + 1 } },
            },
          });
        }
      } else {
        if (current <= 1) {
          storage.set("players", {
            ...storage.get("players"),
            [pid]: {
              ...p,
              habitats: {
                ...p.habitats,
                [habitat]: {
                  ...p.habitats[habitat],
                  activeCube: null,
                  actionCubes: p.habitats[habitat].actionCubes + 1,
                },
              },
            },
          });
        } else {
          storage.set("players", {
            ...storage.get("players"),
            [pid]: {
              ...p,
              habitats: { ...p.habitats, [habitat]: { ...p.habitats[habitat], activeCube: current - 1 } },
            },
          });
        }
      }
    },
    [pid],
  );

  const returnPlayedBirdToHand = useMutation(
    ({ storage }, habitat: HabitatType, birdIndex: number) => {
      const p = storage.get("players")[pid];
      const birdState = p.habitats[habitat].birds[birdIndex];
      if (!birdState) return;
      const birds = [...p.habitats[habitat].birds];
      birds.splice(birdIndex, 1);
      storage.set("players", {
        ...storage.get("players"),
        [pid]: {
          ...p,
          birdHand: [...p.birdHand, birdState.id],
          habitats: { ...p.habitats, [habitat]: { ...p.habitats[habitat], birds } },
        },
      });
      if (birdState.tuckedCardIds.length > 0) {
        const discard = storage.get("birdDiscard");
        storage.set("birdDiscard", [...discard, ...birdState.tuckedCardIds]);
      }
    },
    [pid],
  );

  const discardPlayedBird = useMutation(
    ({ storage }, habitat: HabitatType, birdIndex: number) => {
      const p = storage.get("players")[pid];
      const birdState = p.habitats[habitat].birds[birdIndex];
      if (!birdState) return;
      const birds = [...p.habitats[habitat].birds];
      birds.splice(birdIndex, 1);
      storage.set("players", {
        ...storage.get("players"),
        [pid]: {
          ...p,
          habitats: { ...p.habitats, [habitat]: { ...p.habitats[habitat], birds } },
        },
      });
      const discard = storage.get("birdDiscard");
      storage.set("birdDiscard", [...discard, birdState.id, ...birdState.tuckedCardIds]);
    },
    [pid],
  );

  const discardBird = useMutation(
    ({ storage }, birdId: number) => {
      const p = storage.get("players")[pid];
      if (!p.birdHand.includes(birdId)) return;
      storage.set("players", {
        ...storage.get("players"),
        [pid]: { ...p, birdHand: p.birdHand.filter((id: number) => id !== birdId) },
      });
      const discard = storage.get("birdDiscard");
      storage.set("birdDiscard", [...discard, birdId]);
    },
    [pid],
  );

  const discardBonus = useMutation(
    ({ storage }, bonusId: number) => {
      const p = storage.get("players")[pid];
      if (!p.bonusHand.includes(bonusId)) return;
      storage.set("players", {
        ...storage.get("players"),
        [pid]: { ...p, bonusHand: p.bonusHand.filter((id: number) => id !== bonusId) },
      });
      const discard = storage.get("bonusDiscard");
      storage.set("bonusDiscard", [...discard, bonusId]);
    },
    [pid],
  );

  const drawCard = useMutation(
    ({ storage }) => {
      const d = storage.get("birdDeck");
      if (d.length === 0) return;
      const cardId = d[0];
      storage.set("birdDeck", d.slice(1));
      const p = storage.get("players")[pid];
      storage.set("players", { ...storage.get("players"), [pid]: { ...p, birdHand: [...p.birdHand, cardId] } });
    },
    [pid],
  );

  const trayAddToHand = useMutation(
    ({ storage }, index: number) => {
      const tray = storage.get("birdTray");
      const cardId = tray[index];
      if (cardId == null) return;
      const p = storage.get("players")[pid];
      storage.set("players", { ...storage.get("players"), [pid]: { ...p, birdHand: [...p.birdHand, cardId] } });
      const next = [...tray];
      next[index] = null;
      storage.set("birdTray", next);
    },
    [pid],
  );

  const trayDiscard = useMutation(({ storage }, index: number) => {
    const tray = storage.get("birdTray");
    const cardId = tray[index];
    if (cardId == null) return;
    const discard = storage.get("birdDiscard");
    storage.set("birdDiscard", [...discard, cardId]);
    const next = [...tray];
    next[index] = null;
    storage.set("birdTray", next);
  }, []);

  const trayRefill = useMutation(({ storage }) => {
    const tray = [...storage.get("birdTray")];
    const d = storage.get("birdDeck");
    let taken = 0;
    for (let i = 0; i < tray.length; i++) {
      if (tray[i] === null && taken < d.length) {
        tray[i] = d[taken];
        taken++;
      }
    }
    storage.set("birdTray", tray);
    storage.set("birdDeck", d.slice(taken));
  }, []);

  const trayReset = useMutation(({ storage }) => {
    const tray = storage.get("birdTray");
    const d = storage.get("birdDeck");
    const discard = storage.get("birdDiscard");
    const discarded = tray.filter((c): c is number => c !== null);
    if (discarded.length > 0) {
      storage.set("birdDiscard", [...discard, ...discarded]);
    }
    const count = tray.length;
    const available = Math.min(count, d.length);
    const next: (number | null)[] = [];
    for (let i = 0; i < count; i++) {
      next.push(i < available ? d[i] : null);
    }
    storage.set("birdTray", next);
    storage.set("birdDeck", d.slice(available));
  }, []);

  const drawBonusCard = useMutation(
    ({ storage }) => {
      const d = storage.get("bonusDeck");
      if (d.length === 0) return;
      const cardId = d[0];
      storage.set("bonusDeck", d.slice(1));
      const p = storage.get("players")[pid];
      storage.set("players", { ...storage.get("players"), [pid]: { ...p, bonusHand: [...p.bonusHand, cardId] } });
    },
    [pid],
  );

  const drawHummingbird = useCallback(() => {
    if (hummingbirdDeck.length === 0) return;
    const cardId = hummingbirdDeck[0];
    setPlacingHummingbird(cardId);
    setPlacingHummingbirdSource("deck");
  }, [hummingbirdDeck]);

  const hummingbirdTraySelect = useCallback(
    (index: number) => {
      const cardId = hummingbirdTray[index];
      if (cardId == null) return;
      setPlacingHummingbird(cardId);
      setPlacingHummingbirdSource(index);
    },
    [hummingbirdTray],
  );

  const hummingbirdTrayRefill = useMutation(({ storage }) => {
    const tray = [...storage.get("hummingbirdTray")];
    const d = storage.get("hummingbirdDeck");
    let taken = 0;
    for (let i = 0; i < tray.length; i++) {
      if (tray[i] === null && taken < d.length) {
        tray[i] = d[taken];
        taken++;
      }
    }
    storage.set("hummingbirdTray", tray);
    storage.set("hummingbirdDeck", d.slice(taken));
  }, []);

  const hummingbirdTrayReset = useMutation(({ storage }) => {
    const tray = storage.get("hummingbirdTray");
    const d = storage.get("hummingbirdDeck");
    const discard = storage.get("hummingbirdDiscard");
    const discarded = tray.filter((c): c is number => c !== null);
    if (discarded.length > 0) {
      storage.set("hummingbirdDiscard", [...discard, ...discarded]);
    }
    const count = tray.length;
    const available = Math.min(count, d.length);
    const next: (number | null)[] = [];
    for (let i = 0; i < count; i++) {
      next.push(i < available ? d[i] : null);
    }
    storage.set("hummingbirdTray", next);
    storage.set("hummingbirdDeck", d.slice(available));
  }, []);

  const placeHummingbird = useMutation(
    ({ storage }, habitat: HabitatType) => {
      if (!placingHummingbird) return;
      const cardId = placingHummingbird;
      if (placingHummingbirdSource === "deck") {
        const d = storage.get("hummingbirdDeck");
        storage.set("hummingbirdDeck", d.slice(1));
      } else if (typeof placingHummingbirdSource === "number") {
        const tray = [...storage.get("hummingbirdTray")];
        tray[placingHummingbirdSource] = null;
        storage.set("hummingbirdTray", tray);
      }
      const p = storage.get("players")[pid];
      storage.set("players", {
        ...storage.get("players"),
        [pid]: {
          ...p,
          habitats: {
            ...p.habitats,
            [habitat]: { ...p.habitats[habitat], hummingbird: cardId },
          },
        },
      });
      setPlacingHummingbird(null);
      setPlacingHummingbirdSource(null);
    },
    [placingHummingbird, placingHummingbirdSource, pid],
  );

  const cancelPlaceHummingbird = useCallback(() => {
    if (!placingHummingbird) return;
    setPlacingHummingbird(null);
    setPlacingHummingbirdSource(null);
  }, [placingHummingbird]);

  const dismissAll = useCallback(() => {
    setPlacingBird(null);
    setTuckingBird(null);
    setLayingEggs(false);
    setCachingFood(null);
    setMigratingBird(null);
    setPlacingCube(false);
    cancelPlaceHummingbird();
  }, [cancelPlaceHummingbird]);

  const discardHummingbird = useMutation(
    ({ storage }, habitat: HabitatType) => {
      const p = storage.get("players")[pid];
      const hbId = p.habitats[habitat].hummingbird;
      if (hbId == null) return;
      const discard = storage.get("hummingbirdDiscard");
      storage.set("hummingbirdDiscard", [...discard, hbId]);
      storage.set("players", {
        ...storage.get("players"),
        [pid]: {
          ...p,
          habitats: { ...p.habitats, [habitat]: { ...p.habitats[habitat], hummingbird: null } },
        },
      });
    },
    [pid],
  );

  const moveHummingbird = useMutation(
    ({ storage }, group: HummingbirdGroup, delta: number) => {
      const p = storage.get("players")[pid];
      storage.set("players", {
        ...storage.get("players"),
        [pid]: {
          ...p,
          hummingbirdTrack: { ...p.hummingbirdTrack, [group]: p.hummingbirdTrack[group] + delta },
        },
      });
    },
    [pid],
  );

  const addBirdToHand = useMutation(
    ({ storage }, birdId: number) => {
      const discard = storage.get("birdDiscard");
      if (!discard.includes(birdId)) return;
      storage.set(
        "birdDiscard",
        discard.filter((id: number) => id !== birdId),
      );
      const p = storage.get("players")[pid];
      storage.set("players", { ...storage.get("players"), [pid]: { ...p, birdHand: [...p.birdHand, birdId] } });
    },
    [pid],
  );

  const addBonusToHand = useMutation(
    ({ storage }, bonusId: number) => {
      const discard = storage.get("bonusDiscard");
      if (!discard.includes(bonusId)) return;
      storage.set(
        "bonusDiscard",
        discard.filter((id: number) => id !== bonusId),
      );
      const p = storage.get("players")[pid];
      storage.set("players", { ...storage.get("players"), [pid]: { ...p, bonusHand: [...p.bonusHand, bonusId] } });
    },
    [pid],
  );

  const onNectarChange = useMutation(
    ({ storage }, habitat: HabitatType, delta: number) => {
      const p = storage.get("players")[pid];
      const current = p.habitats[habitat].spentNectar;
      const next = Math.max(0, current + delta);
      if (next === current) return;
      storage.set("players", {
        ...storage.get("players"),
        [pid]: {
          ...p,
          habitats: { ...p.habitats, [habitat]: { ...p.habitats[habitat], spentNectar: next } },
        },
      });
    },
    [pid],
  );

  const onReturnUsedCube = useMutation(
    ({ storage }, habitat: HabitatType | "playABird") => {
      const p = storage.get("players")[pid];
      if (habitat === "playABird") {
        if (p.playABirdCubes <= 0) return;
        storage.set("players", {
          ...storage.get("players"),
          [pid]: {
            ...p,
            actionCubes: p.actionCubes + 1,
            playABirdCubes: p.playABirdCubes - 1,
          },
        });
        return;
      }
      const h = p.habitats[habitat];
      if (h.actionCubes <= 0) return;
      storage.set("players", {
        ...storage.get("players"),
        [pid]: {
          ...p,
          actionCubes: p.actionCubes + 1,
          habitats: { ...p.habitats, [habitat]: { ...h, actionCubes: h.actionCubes - 1 } },
        },
      });
    },
    [pid],
  );

  const onRoundEndReroll = useMutation(({ storage }) => {
    storage.set("roundEndGoalIds", shuffle(allGoalIds).slice(0, 4));
    storage.set(
      "roundEndSpots",
      Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => ({ cubeColors: [] as string[] }))),
    );
  }, []);

  const onRoundEndPlaceCube = useMutation(
    ({ storage }, round: number, placement: number) => {
      const p = storage.get("players")[pid];
      if (p.actionCubes <= 0) return;
      storage.set("players", { ...storage.get("players"), [pid]: { ...p, actionCubes: p.actionCubes - 1 } });
      const spots = storage.get("roundEndSpots");
      const newSpots = spots.map((r: RoundEndSpot[]) =>
        r.map((s: RoundEndSpot) => ({ ...s, cubeColors: [...s.cubeColors] })),
      );
      newSpots[round][placement].cubeColors.push(p.cubeColor);
      storage.set("roundEndSpots", newSpots);
      setPlacingCube(false);
    },
    [pid],
  );

  const onRoundEndRemoveCube = useMutation(
    ({ storage }, round: number, placement: number, cubeIndex: number) => {
      const spots = storage.get("roundEndSpots");
      const color = spots[round]?.[placement]?.cubeColors[cubeIndex];
      if (!color) return;
      const p = storage.get("players")[pid];
      if (color === p.cubeColor) {
        storage.set("players", { ...storage.get("players"), [pid]: { ...p, actionCubes: p.actionCubes + 1 } });
      }
      const newSpots = spots.map((r: RoundEndSpot[]) =>
        r.map((s: RoundEndSpot) => ({ ...s, cubeColors: [...s.cubeColors] })),
      );
      newSpots[round][placement].cubeColors.splice(cubeIndex, 1);
      storage.set("roundEndSpots", newSpots);
    },
    [pid],
  );

  const shuffleBirdDiscard = useMutation(({ storage }) => {
    storage.set("birdDiscard", shuffle([...storage.get("birdDiscard")]));
  }, []);

  const shuffleBonusDiscard = useMutation(({ storage }) => {
    storage.set("bonusDiscard", shuffle([...storage.get("bonusDiscard")]));
  }, []);

  const shuffleHummingbirdDiscard = useMutation(({ storage }) => {
    storage.set("hummingbirdDiscard", shuffle([...storage.get("hummingbirdDiscard")]));
  }, []);

  // Build dock items: bonus cards first, then bird cards
  const dockItems = useMemo(() => {
    const bonusItems = player.bonusHand.map((bonusId: number) => {
      const bonus = getBonus(bonusId);
      return {
        key: `bonus-${bonusId}`,
        baseWidth: BONUS_CARD_WIDTH,
        render: (h: number) => (
          <CardWithDiscard width={BONUS_CARD_WIDTH} height={h} onDiscard={() => discardBonus(bonusId)}>
            <BonusCardDisplay card={bonus} cardHeight={h} />
          </CardWithDiscard>
        ),
      };
    });
    const birdItems = player.birdHand.map((birdId: number) => {
      const bird = getBird(birdId);
      return {
        key: `bird-${birdId}`,
        baseWidth: HAND_CARD_WIDTH,
        render: (h: number) => (
          <CardWithDiscard
            width={HAND_CARD_WIDTH}
            height={h}
            onDiscard={() => discardBird(birdId)}
            onPlay={() => setPlacingBird(birdId)}
            onTuck={() => setTuckingBird(birdId)}
            activeAction={placingBird === birdId ? "play" : tuckingBird === birdId ? "tuck" : null}
            onCancelAction={() => {
              setPlacingBird(null);
              setTuckingBird(null);
            }}
          >
            <BirdCardDisplay bird={bird} cardHeight={h} />
          </CardWithDiscard>
        ),
      };
    });
    return [...bonusItems, ...birdItems];
  }, [player.bonusHand, player.birdHand, discardBird, discardBonus, placingBird, tuckingBird]);

  return (
    <div
      className="fixed inset-0 bg-gradient-to-br from-emerald-800 to-emerald-950 flex overflow-hidden"
      onClick={dismissAll}
    >
      {/* ── Left side: game board row + card hand ── */}
      <div className="flex-1 flex flex-col py-2 px-5 overflow-hidden min-w-0">
        {/* Player tabs */}
        <div className="flex items-center gap-1 mb-1">
          {playerNames.map((name) => {
            const p = allPlayers![name];
            const isActive = name === viewingPlayerId;
            const isSelf = name === currentPlayerId;
            return (
              <button
                key={name}
                onClick={(e) => {
                  e.stopPropagation();
                  setViewingPlayerId(name);
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-t-lg text-sm font-semibold transition-all cursor-pointer ${
                  isActive ? "bg-white/20 text-white" : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70"
                }`}
              >
                <div className="w-3 h-3 rounded-full border border-white/40" style={{ backgroundColor: p.cubeColor }} />
                <span>{p.name}</span>
                {isSelf && <span className="text-white/30 text-xs">(you)</span>}
              </button>
            );
          })}
        </div>

        {/* Game board + side column row */}
        <div className="flex items-start gap-4">
          <GameBoard
            player={viewedPlayer}
            readOnly={isViewingOther}
            placingBird={isViewingOther ? null : placingBird}
            onPlaceBird={isViewingOther ? undefined : playBirdToHabitat}
            tuckingBird={isViewingOther ? null : tuckingBird}
            onTuckBird={isViewingOther ? undefined : tuckBirdBehind}
            layingEggs={isViewingOther ? false : layingEggs}
            onLayEgg={isViewingOther ? undefined : layEggOnBird}
            onRemoveEgg={isViewingOther ? undefined : removeEggFromBird}
            cachingFood={isViewingOther ? null : cachingFood}
            onCacheFood={isViewingOther ? undefined : cacheFoodOnBird}
            onViewTucked={isViewingOther ? undefined : (habitat, birdIndex) => setViewingTucked({ habitat, birdIndex })}
            migratingBird={isViewingOther ? null : migratingBird}
            onMigrate={isViewingOther ? undefined : startMigrate}
            onCompleteMigrate={isViewingOther ? undefined : completeMigrate}
            onReturnToHand={isViewingOther ? undefined : returnPlayedBirdToHand}
            onDiscardPlayed={isViewingOther ? undefined : discardPlayedBird}
            placingHummingbird={isViewingOther ? null : placingHummingbird}
            onPlaceHummingbird={isViewingOther ? undefined : placeHummingbird}
            onDiscardHummingbird={isViewingOther ? undefined : discardHummingbird}
            onNectarChange={isViewingOther ? undefined : onNectarChange}
            onUseFood={isViewingOther ? () => {} : removeFood}
            onStartCache={isViewingOther ? () => {} : (food) => setCachingFood(food)}
            placingCube={isViewingOther ? false : placingCube}
            onPlaceCubeToggle={isViewingOther ? undefined : () => setPlacingCube((prev) => !prev)}
            onPlaceCube={isViewingOther ? undefined : placeActionCube}
            onCubeClick={
              isViewingOther
                ? undefined
                : (habitat: HabitatType, e: React.MouseEvent) => handleCubeClick(habitat, e.shiftKey)
            }
            onReturnUsedCube={isViewingOther ? undefined : onReturnUsedCube}
          />

          {/* Bird feeder + Food piles + Eggs + Hummingbird track */}
          <div className="flex flex-col items-stretch gap-2 self-start">
            <BirdFeeder size={186} disabled={isViewingOther} />
            {/* Food pile buttons */}
            <div className="grid grid-cols-3 gap-1 justify-items-center px-2 py-1">
              {(["invertebrate", "seed", "fruit", "fish", "rodent", "nectar"] as const).map((food) => (
                <button
                  key={food}
                  className={`flex flex-col items-center gap-0.5 group ${isViewingOther ? "opacity-40 cursor-default" : "cursor-pointer"}`}
                  onClick={isViewingOther ? undefined : () => gainFood(food)}
                  disabled={isViewingOther}
                >
                  <div
                    className="relative rounded-full flex items-center justify-center transition-all group-hover:ring-2 group-hover:ring-yellow-400 group-hover:shadow-[0_0_12px_rgba(250,204,21,0.6)]"
                    style={{
                      width: 50,
                      height: 50,
                      background: "rgba(0,0,0,0.35)",
                      border: "2px solid rgba(255,255,255,0.6)",
                    }}
                  >
                    <img src={foodUrl(food)} alt={food} className="h-8 drop-shadow" />
                  </div>
                  <span
                    className="text-white/80 drop-shadow"
                    style={{
                      fontFamily: "CardenioModernBold, SiliciStrong, sans-serif",
                      fontSize: "0.5rem",
                    }}
                  >
                    {FOOD_DISPLAY_NAMES[food]}
                  </span>
                </button>
              ))}
            </div>
            {/* Egg pile button */}
            <button
              className={`flex flex-col items-center gap-1 group self-center ${isViewingOther ? "opacity-40 cursor-default" : "cursor-pointer"}`}
              disabled={isViewingOther}
              onClick={
                isViewingOther
                  ? undefined
                  : (e) => {
                      e.stopPropagation();
                      setLayingEggs(!layingEggs);
                    }
              }
            >
              <div
                className={`relative rounded-full flex items-center justify-center transition-shadow ${
                  layingEggs
                    ? "ring-2 ring-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.6)]"
                    : "group-hover:ring-2 group-hover:ring-yellow-400 group-hover:shadow-[0_0_12px_rgba(250,204,21,0.6)]"
                }`}
                style={{
                  width: 52,
                  height: 52,
                  background: "rgba(0,0,0,0.35)",
                  border: layingEggs ? undefined : "2px solid rgba(255,255,255,0.6)",
                }}
              >
                <img src={iconUrl("egg")} alt="lay egg" className="h-8 drop-shadow" />
              </div>
              <span
                className="text-white/80 drop-shadow"
                style={{
                  fontFamily: "CardenioModernBold, SiliciStrong, sans-serif",
                  fontSize: "0.65rem",
                }}
              >
                {layingEggs ? "CANCEL" : "LAY EGGS"}
              </span>
            </button>
            <HummingbirdTrack player={viewedPlayer} onMove={isViewingOther ? undefined : moveHummingbird} />
          </div>

          {/* Card decks + discard piles + end of round goals */}
          <div className="flex flex-col gap-4 self-start pt-4 items-start">
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-4">
                  <BonusDeck
                    count={bonusDeck.length}
                    width={DECK_BONUS_WIDTH}
                    height={DECK_CARD_HEIGHT}
                    onDraw={drawBonusCard}
                    disabled={isViewingOther}
                  />
                  <BonusDiscardPile
                    cards={bonusDiscard.map(getBonus)}
                    width={DECK_BONUS_WIDTH}
                    height={DECK_CARD_HEIGHT}
                    onClick={() => bonusDiscard.length > 0 && setDiscardModal("bonus")}
                  />
                </div>
                <div className="flex items-start gap-4">
                  <BirdDeck
                    count={deck.length}
                    width={DECK_CARD_WIDTH}
                    height={DECK_CARD_HEIGHT}
                    onDraw={drawCard}
                    disabled={isViewingOther}
                  />
                  <BirdDiscardPile
                    cards={birdDiscard.map(getBird)}
                    width={DECK_CARD_WIDTH}
                    height={DECK_CARD_HEIGHT}
                    onClick={() => birdDiscard.length > 0 && setDiscardModal("bird")}
                  />
                </div>
              </div>
              <RoundEndGoalBoard
                state={{ goals: roundEndGoalIds.map(getGoal), spots: roundEndSpots }}
                onReroll={onRoundEndReroll}
                placingCube={placingCube}
                onPlaceCube={onRoundEndPlaceCube}
                onRemoveCube={onRoundEndRemoveCube}
              />
            </div>
            <div className="flex items-start gap-3">
              <BirdTray
                cards={birdTray.map((id: number | null) => (id != null ? getBird(id) : null))}
                cardWidth={DECK_CARD_WIDTH}
                cardHeight={DECK_CARD_HEIGHT}
                onAddToHand={trayAddToHand}
                onDiscard={trayDiscard}
                onRefill={trayRefill}
                onReset={trayReset}
                disabled={isViewingOther}
              />
              <div className="flex flex-col items-center gap-3 pt-1">
                <HummingbirdDeck
                  count={hummingbirdDeck.length}
                  width={DECK_HUMMINGBIRD_WIDTH}
                  height={DECK_HUMMINGBIRD_HEIGHT}
                  onDraw={drawHummingbird}
                  disabled={isViewingOther}
                />
                <HummingbirdDiscardPile
                  cards={hummingbirdDiscard.map(getHummingbird)}
                  width={DECK_HUMMINGBIRD_WIDTH}
                  onClick={() => hummingbirdDiscard.length > 0 && setDiscardModal("hummingbird")}
                />
              </div>
            </div>
            <HummingbirdTray
              cards={hummingbirdTray.map((id: number | null) => (id != null ? getHummingbird(id) : null))}
              cardWidth={DECK_HUMMINGBIRD_WIDTH}
              cardHeight={DECK_HUMMINGBIRD_HEIGHT}
              onSelect={hummingbirdTraySelect}
              onRefill={hummingbirdTrayRefill}
              onReset={hummingbirdTrayReset}
              disabled={isViewingOther}
            />
          </div>
        </div>

        {/* ── Hand area (below game board) ── */}
        <div className="flex items-end" style={{ minHeight: HAND_AREA_HEIGHT }}>
          <div className="flex-1 min-w-0">
            {isViewingOther ? (
              <div className="flex items-end gap-1 px-2 pb-1">
                {viewedPlayer.bonusHand.map((_id: number, i: number) => (
                  <img
                    key={`bonus-back-${i}`}
                    src={bonusBackUrl}
                    alt="bonus card"
                    className="rounded-lg shadow-md"
                    style={{ height: HAND_CARD_HEIGHT, width: BONUS_CARD_WIDTH }}
                  />
                ))}
                {viewedPlayer.birdHand.map((_id: number, i: number) => (
                  <img
                    key={`bird-back-${i}`}
                    src={birdBackUrl}
                    alt="bird card"
                    className="rounded-lg shadow-md"
                    style={{ height: HAND_CARD_HEIGHT, width: HAND_CARD_WIDTH }}
                  />
                ))}
              </div>
            ) : (
              dockItems.length > 0 && <CardDock items={dockItems} baseHeight={HAND_CARD_HEIGHT} maxScale={1.8} />
            )}
          </div>
        </div>
      </div>

      {/* Discard pile modal */}
      {discardModal === "bird" && (
        <CardListModal
          title="Bird Discard Pile"
          cards={birdDiscard.map(getBird)}
          renderCard={(card, h) => <BirdCardDisplay bird={card as BirdCard} cardHeight={h} />}
          onClose={() => setDiscardModal(null)}
          onShuffle={shuffleBirdDiscard}
          onAddToHand={(id) => {
            addBirdToHand(id);
            if (birdDiscard.length <= 1) setDiscardModal(null);
          }}
        />
      )}
      {discardModal === "bonus" && (
        <CardListModal
          title="Bonus Discard Pile"
          cards={bonusDiscard.map(getBonus)}
          renderCard={(card, h) => <BonusCardDisplay card={card as BonusCard} cardHeight={h} />}
          onClose={() => setDiscardModal(null)}
          onShuffle={shuffleBonusDiscard}
          onAddToHand={(id) => {
            addBonusToHand(id);
            if (bonusDiscard.length <= 1) setDiscardModal(null);
          }}
        />
      )}
      {discardModal === "hummingbird" && (
        <CardListModal
          title="Hummingbird Discard Pile"
          cards={hummingbirdDiscard.map(getHummingbird)}
          renderCard={(card, h) => <HummingbirdCardDisplay card={card as HummingbirdCard} cardHeight={h} />}
          onClose={() => setDiscardModal(null)}
          onShuffle={shuffleHummingbirdDiscard}
        />
      )}
      {/* Tucked cards modal */}
      {viewingTucked &&
        (() => {
          const birdState = player.habitats[viewingTucked.habitat].birds[viewingTucked.birdIndex];
          if (!birdState) return null;
          const birdCard = getBird(birdState.id);
          const tuckedCards = birdState.tuckedCardIds.map(getBird);
          return (
            <CardListModal
              title={`Tucked under ${birdCard["Common name"]}`}
              cards={tuckedCards}
              renderCard={(card, h) => <BirdCardDisplay bird={card as BirdCard} cardHeight={h} />}
              onClose={() => setViewingTucked(null)}
              onAddToHand={unTuck}
            />
          );
        })()}
    </div>
  );
}

export default App;
