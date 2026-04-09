import { useCallback, useMemo, useState } from "react";
import birdsData from "../assets/data/birds.json";
import bonusData from "../assets/data/bonus.json";
import goalsData from "../assets/data/goals.json";
import hummingbirdsData from "../assets/data/hummingbirds.json";
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
import { RoundEndGoalBoard } from "./components/RoundEndGoalBoard";
import { foodUrl, iconUrl } from "./icons";
import {
  createPlayer,
  createRoundEndGoalBoardState,
  toPlayedBird,
  type BirdCard,
  type BonusCard,
  type FoodType,
  type HabitatType,
  type HummingbirdCard,
  type HummingbirdGroup,
  type Player,
  type RoundEndGoal,
  type RoundEndGoalBoardState,
} from "./types";

const FOOD_DISPLAY_NAMES: Record<FoodType, string> = {
  invertebrate: "WORM",
  seed: "WHEAT",
  fruit: "BERRY",
  fish: "FISH",
  rodent: "RAT",
  nectar: "NECTAR",
};

const allBirds: BirdCard[] = birdsData as BirdCard[];
const allBonuses: BonusCard[] = bonusData as BonusCard[];
const allHummingbirds: HummingbirdCard[] = hummingbirdsData as HummingbirdCard[];
const allGoals: RoundEndGoal[] = goalsData as RoundEndGoal[];

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

function App() {
  const [initialDeck] = useState(() => shuffle(allBirds));
  const [deck, setDeck] = useState(() => initialDeck.slice(3));
  const [birdTray, setBirdTray] = useState<(BirdCard | null)[]>(() => initialDeck.slice(0, 3));
  const [bonusDeck, setBonusDeck] = useState(() => shuffle(allBonuses));
  const [player, setPlayer] = useState<Player>(() => createPlayer("Player 1", "white"));
  const [birdDiscard, setBirdDiscard] = useState<BirdCard[]>([]);
  const [bonusDiscard, setBonusDiscard] = useState<BonusCard[]>([]);
  const [initialHummingbirdDeck] = useState(() => shuffle(allHummingbirds));
  const [hummingbirdDeck, setHummingbirdDeck] = useState(() => initialHummingbirdDeck.slice(5));
  const [hummingbirdTray, setHummingbirdTray] = useState<(HummingbirdCard | null)[]>(() =>
    initialHummingbirdDeck.slice(0, 5),
  );
  const [hummingbirdDiscard, setHummingbirdDiscard] = useState<HummingbirdCard[]>([]);
  const [placingHummingbird, setPlacingHummingbird] = useState<HummingbirdCard | null>(null);
  const [placingHummingbirdSource, setPlacingHummingbirdSource] = useState<"deck" | number | null>(null);
  const [discardModal, setDiscardModal] = useState<"bird" | "bonus" | "hummingbird" | null>(null);
  const [placingBird, setPlacingBird] = useState<BirdCard | null>(null);
  const [tuckingBird, setTuckingBird] = useState<BirdCard | null>(null);
  const [layingEggs, setLayingEggs] = useState(false);
  const [cachingFood, setCachingFood] = useState<FoodType | null>(null);
  const [viewingTucked, setViewingTucked] = useState<{ habitat: HabitatType; birdIndex: number } | null>(null);
  const [migratingBird, setMigratingBird] = useState<{ habitat: HabitatType; birdIndex: number } | null>(null);
  const [placingCube, setPlacingCube] = useState(false);
  const [roundEndBoard, setRoundEndBoard] = useState<RoundEndGoalBoardState>(() => {
    const shuffled = shuffle(allGoals);
    return createRoundEndGoalBoardState(shuffled.slice(0, 4));
  });

  const playBirdToHabitat = useCallback(
    (habitat: HabitatType) => {
      if (!placingBird) return;
      const bird = placingBird;
      setPlayer((prev) => ({
        ...prev,
        birdHand: prev.birdHand.filter((b) => b.id !== bird.id),
        habitats: {
          ...prev.habitats,
          [habitat]: {
            ...prev.habitats[habitat],
            birds: [...prev.habitats[habitat].birds, toPlayedBird(bird)],
          },
        },
      }));
      setPlacingBird(null);
    },
    [placingBird],
  );

  const tuckBirdBehind = useCallback(
    (habitat: HabitatType, birdIndex: number) => {
      if (!tuckingBird) return;
      const card = tuckingBird;
      setPlayer((prev) => {
        const birds = [...prev.habitats[habitat].birds];
        const target = birds[birdIndex];
        birds[birdIndex] = {
          ...target,
          tuckedCards: [...target.tuckedCards, card],
        };
        return {
          ...prev,
          birdHand: prev.birdHand.filter((b) => b.id !== card.id),
          habitats: {
            ...prev.habitats,
            [habitat]: {
              ...prev.habitats[habitat],
              birds,
            },
          },
        };
      });
      setTuckingBird(null);
    },
    [tuckingBird],
  );

  const layEggOnBird = useCallback((habitat: HabitatType, birdIndex: number) => {
    setPlayer((prev) => {
      const birds = [...prev.habitats[habitat].birds];
      const target = birds[birdIndex];
      birds[birdIndex] = { ...target, eggsLaid: target.eggsLaid + 1 };
      return {
        ...prev,
        habitats: {
          ...prev.habitats,
          [habitat]: { ...prev.habitats[habitat], birds },
        },
      };
    });
  }, []);

  const removeEggFromBird = useCallback((habitat: HabitatType, birdIndex: number) => {
    setPlayer((prev) => {
      const birds = [...prev.habitats[habitat].birds];
      const target = birds[birdIndex];
      if (target.eggsLaid <= 0) return prev;
      birds[birdIndex] = { ...target, eggsLaid: target.eggsLaid - 1 };
      return {
        ...prev,
        habitats: {
          ...prev.habitats,
          [habitat]: { ...prev.habitats[habitat], birds },
        },
      };
    });
  }, []);

  const gainFood = useCallback((foodType: FoodType) => {
    setPlayer((prev) => ({
      ...prev,
      food: { ...prev.food, [foodType]: prev.food[foodType] + 1 },
    }));
  }, []);

  const removeFood = useCallback((foodType: FoodType) => {
    setPlayer((prev) => {
      if (prev.food[foodType] <= 0) return prev;
      return { ...prev, food: { ...prev.food, [foodType]: prev.food[foodType] - 1 } };
    });
  }, []);

  const cacheFoodOnBird = useCallback(
    (habitat: HabitatType, birdIndex: number) => {
      if (!cachingFood) return;
      const foodType = cachingFood;
      setPlayer((prev) => {
        if (prev.food[foodType] <= 0) return prev;
        const birds = [...prev.habitats[habitat].birds];
        const target = birds[birdIndex];
        birds[birdIndex] = {
          ...target,
          cachedFood: { ...target.cachedFood, [foodType]: target.cachedFood[foodType] + 1 },
        };
        return {
          ...prev,
          food: { ...prev.food, [foodType]: prev.food[foodType] - 1 },
          habitats: {
            ...prev.habitats,
            [habitat]: { ...prev.habitats[habitat], birds },
          },
        };
      });
      setCachingFood(null);
    },
    [cachingFood],
  );

  const unTuck = useCallback(
    (cardId: number) => {
      if (!viewingTucked) return;
      setPlayer((prev) => {
        const birds = [...prev.habitats[viewingTucked.habitat].birds];
        const target = birds[viewingTucked.birdIndex];
        const card = target.tuckedCards.find((c) => c.id === cardId);
        if (!card) return prev;
        birds[viewingTucked.birdIndex] = {
          ...target,
          tuckedCards: target.tuckedCards.filter((c) => c.id !== cardId),
        };
        return {
          ...prev,
          birdHand: [...prev.birdHand, card],
          habitats: {
            ...prev.habitats,
            [viewingTucked.habitat]: { ...prev.habitats[viewingTucked.habitat], birds },
          },
        };
      });
      const remaining = player.habitats[viewingTucked.habitat].birds[viewingTucked.birdIndex].tuckedCards.length;
      if (remaining <= 1) setViewingTucked(null);
    },
    [viewingTucked, player.habitats],
  );

  // Start migrating a played bird — highlights rightmost empty slots in other habitats
  const startMigrate = useCallback((habitat: HabitatType, birdIndex: number) => {
    setMigratingBird({ habitat, birdIndex });
  }, []);

  // Complete migration: move bird (with tucked cards, cached food, eggs) to rightmost slot of target habitat
  const completeMigrate = useCallback(
    (targetHabitat: HabitatType) => {
      if (!migratingBird) return;
      const { habitat: srcHabitat, birdIndex } = migratingBird;
      setPlayer((prev) => {
        const srcBirds = [...prev.habitats[srcHabitat].birds];
        const bird = srcBirds[birdIndex];
        if (!bird) return prev;
        srcBirds.splice(birdIndex, 1);
        const destBirds = [...prev.habitats[targetHabitat].birds, bird];
        return {
          ...prev,
          habitats: {
            ...prev.habitats,
            [srcHabitat]: { ...prev.habitats[srcHabitat], birds: srcBirds },
            [targetHabitat]: { ...prev.habitats[targetHabitat], birds: destBirds },
          },
        };
      });
      setMigratingBird(null);
    },
    [migratingBird],
  );

  const placeActionCube = useCallback((habitat: HabitatType | "playABird") => {
    setPlayer((prev) => {
      if (prev.actionCubes <= 0) return prev;
      if (habitat === "playABird") {
        return {
          ...prev,
          actionCubes: prev.actionCubes - 1,
          playABirdCubes: prev.playABirdCubes + 1,
        };
      }
      if (prev.habitats[habitat].activeCube !== undefined) return prev;
      const birdCount = prev.habitats[habitat].birds.length;
      const slot = birdCount < 5 ? birdCount + 1 : 6;
      return {
        ...prev,
        actionCubes: prev.actionCubes - 1,
        habitats: {
          ...prev.habitats,
          [habitat]: {
            ...prev.habitats[habitat],
            activeCube: slot,
          },
        },
      };
    });
    setPlacingCube(false);
  }, []);

  const handleCubeClick = useCallback((habitat: HabitatType, e: React.MouseEvent) => {
    setPlayer((prev) => {
      const current = prev.habitats[habitat].activeCube;
      if (current === undefined) return prev;
      if (e.shiftKey) {
        // Shift-click: move right, or return to supply from end column
        if (current >= 6) {
          return {
            ...prev,
            actionCubes: prev.actionCubes + 1,
            habitats: {
              ...prev.habitats,
              [habitat]: { ...prev.habitats[habitat], activeCube: undefined },
            },
          };
        }
        return {
          ...prev,
          habitats: {
            ...prev.habitats,
            [habitat]: { ...prev.habitats[habitat], activeCube: current + 1 },
          },
        };
      } else {
        // Click: move left, or add to habitat's used cubes from slot 1
        if (current <= 1) {
          return {
            ...prev,
            habitats: {
              ...prev.habitats,
              [habitat]: {
                ...prev.habitats[habitat],
                activeCube: undefined,
                actionCubes: prev.habitats[habitat].actionCubes + 1,
              },
            },
          };
        }
        return {
          ...prev,
          habitats: {
            ...prev.habitats,
            [habitat]: { ...prev.habitats[habitat], activeCube: current - 1 },
          },
        };
      }
    });
  }, []);

  // Return a played bird to hand, discarding all resources on it
  const returnPlayedBirdToHand = useCallback(
    (habitat: HabitatType, birdIndex: number) => {
      const bird = player.habitats[habitat].birds[birdIndex];
      if (!bird) return;
      const { eggsLaid: _, tuckedCards, cachedFood: __, ...baseBird } = bird;
      setPlayer((prev) => {
        const birds = [...prev.habitats[habitat].birds];
        birds.splice(birdIndex, 1);
        return {
          ...prev,
          birdHand: [...prev.birdHand, baseBird as BirdCard],
          habitats: {
            ...prev.habitats,
            [habitat]: { ...prev.habitats[habitat], birds },
          },
        };
      });
      if (tuckedCards.length > 0) {
        setBirdDiscard((prev) => [...prev, ...tuckedCards]);
      }
    },
    [player.habitats],
  );

  // Discard a played bird and all its resources
  const discardPlayedBird = useCallback(
    (habitat: HabitatType, birdIndex: number) => {
      const bird = player.habitats[habitat].birds[birdIndex];
      if (!bird) return;
      const { eggsLaid: _, tuckedCards, cachedFood: __, ...baseBird } = bird;
      setPlayer((prev) => {
        const birds = [...prev.habitats[habitat].birds];
        birds.splice(birdIndex, 1);
        return {
          ...prev,
          habitats: {
            ...prev.habitats,
            [habitat]: { ...prev.habitats[habitat], birds },
          },
        };
      });
      setBirdDiscard((prev) => [...prev, baseBird as BirdCard, ...tuckedCards]);
    },
    [player.habitats],
  );

  const discardBird = useCallback(
    (birdId: number) => {
      const bird = player.birdHand.find((b) => b.id === birdId);
      if (!bird) return;
      setPlayer((prev) => ({ ...prev, birdHand: prev.birdHand.filter((b) => b.id !== birdId) }));
      setBirdDiscard((prev) => [...prev, bird]);
    },
    [player.birdHand],
  );

  const discardBonus = useCallback(
    (bonusId: number) => {
      const bonus = player.bonusHand.find((b) => b.id === bonusId);
      if (!bonus) return;
      setPlayer((prev) => ({ ...prev, bonusHand: prev.bonusHand.filter((b) => b.id !== bonusId) }));
      setBonusDiscard((prev) => [...prev, bonus]);
    },
    [player.bonusHand],
  );

  const drawCard = () => {
    if (deck.length === 0) return;
    const card = deck[0];
    setPlayer((prev) => ({ ...prev, birdHand: [...prev.birdHand, card] }));
    setDeck((prev) => prev.slice(1));
  };

  const trayAddToHand = useCallback(
    (index: number) => {
      const card = birdTray[index];
      if (!card) return;
      setPlayer((prev) => ({ ...prev, birdHand: [...prev.birdHand, card] }));
      setBirdTray((prev) => {
        const next = [...prev];
        next[index] = null;
        return next;
      });
    },
    [birdTray],
  );

  const trayDiscard = useCallback(
    (index: number) => {
      const card = birdTray[index];
      if (!card) return;
      setBirdDiscard((prev) => [...prev, card]);
      setBirdTray((prev) => {
        const next = [...prev];
        next[index] = null;
        return next;
      });
    },
    [birdTray],
  );

  const trayRefill = useCallback(() => {
    setBirdTray((prev) => {
      const next = [...prev];
      let taken = 0;
      for (let i = 0; i < next.length; i++) {
        if (next[i] === null && taken < deck.length) {
          next[i] = deck[taken];
          taken++;
        }
      }
      setDeck((d) => d.slice(taken));
      return next;
    });
  }, [deck]);

  const trayReset = useCallback(() => {
    // Discard all remaining tray cards, then refill all slots
    const discarded = birdTray.filter((c): c is BirdCard => c !== null);
    if (discarded.length > 0) {
      setBirdDiscard((d) => [...d, ...discarded]);
    }
    const count = birdTray.length;
    const available = Math.min(count, deck.length);
    const next: (BirdCard | null)[] = [];
    for (let i = 0; i < count; i++) {
      next.push(i < available ? deck[i] : null);
    }
    setBirdTray(next);
    setDeck((d) => d.slice(available));
  }, [birdTray, deck]);

  const drawBonusCard = () => {
    if (bonusDeck.length === 0) return;
    const card = bonusDeck[0];
    setPlayer((prev) => ({ ...prev, bonusHand: [...prev.bonusHand, card] }));
    setBonusDeck((prev) => prev.slice(1));
  };

  const drawHummingbird = () => {
    if (hummingbirdDeck.length === 0) return;
    const card = hummingbirdDeck[0];
    setPlacingHummingbird(card);
    setPlacingHummingbirdSource("deck");
  };

  const hummingbirdTraySelect = useCallback(
    (index: number) => {
      const card = hummingbirdTray[index];
      if (!card) return;
      setPlacingHummingbird(card);
      setPlacingHummingbirdSource(index);
    },
    [hummingbirdTray],
  );

  const hummingbirdTrayRefill = useCallback(() => {
    setHummingbirdTray((prev) => {
      const next = [...prev];
      let taken = 0;
      for (let i = 0; i < next.length; i++) {
        if (next[i] === null && taken < hummingbirdDeck.length) {
          next[i] = hummingbirdDeck[taken];
          taken++;
        }
      }
      setHummingbirdDeck((d) => d.slice(taken));
      return next;
    });
  }, [hummingbirdDeck]);

  const hummingbirdTrayReset = useCallback(() => {
    const discarded = hummingbirdTray.filter((c): c is HummingbirdCard => c !== null);
    if (discarded.length > 0) {
      setHummingbirdDiscard((d) => [...d, ...discarded]);
    }
    const count = hummingbirdTray.length;
    const available = Math.min(count, hummingbirdDeck.length);
    const next: (HummingbirdCard | null)[] = [];
    for (let i = 0; i < count; i++) {
      next.push(i < available ? hummingbirdDeck[i] : null);
    }
    setHummingbirdTray(next);
    setHummingbirdDeck((d) => d.slice(available));
  }, [hummingbirdTray, hummingbirdDeck]);

  const placeHummingbird = useCallback(
    (habitat: HabitatType) => {
      if (!placingHummingbird) return;
      const card = placingHummingbird;
      // Remove from the source now that placement is confirmed
      if (placingHummingbirdSource === "deck") {
        setHummingbirdDeck((prev) => prev.slice(1));
      } else if (typeof placingHummingbirdSource === "number") {
        const idx = placingHummingbirdSource;
        setHummingbirdTray((prev) => {
          const next = [...prev];
          next[idx] = null;
          return next;
        });
      }
      setPlayer((prev) => ({
        ...prev,
        habitats: {
          ...prev.habitats,
          [habitat]: {
            ...prev.habitats[habitat],
            hummingbird: card,
          },
        },
      }));
      setPlacingHummingbird(null);
      setPlacingHummingbirdSource(null);
    },
    [placingHummingbird, placingHummingbirdSource],
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

  const discardHummingbird = useCallback(
    (habitat: HabitatType) => {
      const hb = player.habitats[habitat].hummingbird;
      if (!hb) return;
      setHummingbirdDiscard((d) => [...d, hb]);
      setPlayer((prev) => ({
        ...prev,
        habitats: {
          ...prev.habitats,
          [habitat]: { ...prev.habitats[habitat], hummingbird: null },
        },
      }));
    },
    [player],
  );

  const moveHummingbird = useCallback((group: HummingbirdGroup, delta: number) => {
    setPlayer((prev) => ({
      ...prev,
      hummingbirdTrack: {
        ...prev.hummingbirdTrack,
        [group]: prev.hummingbirdTrack[group] + delta,
      },
    }));
  }, []);

  const addBirdToHand = useCallback(
    (birdId: number) => {
      const bird = birdDiscard.find((b) => b.id === birdId);
      if (!bird) return;
      setBirdDiscard((prev) => prev.filter((b) => b.id !== birdId));
      setPlayer((prev) => ({ ...prev, birdHand: [...prev.birdHand, bird] }));
    },
    [birdDiscard],
  );

  const addBonusToHand = useCallback(
    (bonusId: number) => {
      const bonus = bonusDiscard.find((b) => b.id === bonusId);
      if (!bonus) return;
      setBonusDiscard((prev) => prev.filter((b) => b.id !== bonusId));
      setPlayer((prev) => ({ ...prev, bonusHand: [...prev.bonusHand, bonus] }));
    },
    [bonusDiscard],
  );

  // Build dock items: bonus cards first, then bird cards
  const dockItems = useMemo(() => {
    const bonusItems = player.bonusHand.map((bonus) => ({
      key: `bonus-${bonus.id}`,
      baseWidth: BONUS_CARD_WIDTH,
      render: (h: number) => (
        <CardWithDiscard width={BONUS_CARD_WIDTH} height={h} onDiscard={() => discardBonus(bonus.id)}>
          <BonusCardDisplay card={bonus} cardHeight={h} />
        </CardWithDiscard>
      ),
    }));
    const birdItems = player.birdHand.map((bird) => ({
      key: `bird-${bird.id}`,
      baseWidth: HAND_CARD_WIDTH,
      render: (h: number) => (
        <CardWithDiscard
          width={HAND_CARD_WIDTH}
          height={h}
          onDiscard={() => discardBird(bird.id)}
          onPlay={() => setPlacingBird(bird)}
          onTuck={() => setTuckingBird(bird)}
          activeAction={placingBird?.id === bird.id ? "play" : tuckingBird?.id === bird.id ? "tuck" : null}
          onCancelAction={() => {
            setPlacingBird(null);
            setTuckingBird(null);
          }}
        >
          <BirdCardDisplay bird={bird} cardHeight={h} />
        </CardWithDiscard>
      ),
    }));
    return [...bonusItems, ...birdItems];
  }, [player.bonusHand, player.birdHand, discardBird, discardBonus, placingBird, tuckingBird]);

  return (
    <div
      className="fixed inset-0 bg-gradient-to-br from-emerald-800 to-emerald-950 flex overflow-hidden"
      onClick={dismissAll}
    >
      {/* ── Left side: game board row + card hand ── */}
      <div className="flex-1 flex flex-col py-2 px-5 overflow-hidden min-w-0">
        {/* Game board + side column row */}
        <div className="flex items-start gap-4">
          <GameBoard
            player={player}
            placingBird={placingBird}
            onPlaceBird={playBirdToHabitat}
            tuckingBird={tuckingBird}
            onTuckBird={tuckBirdBehind}
            layingEggs={layingEggs}
            onLayEgg={layEggOnBird}
            onRemoveEgg={removeEggFromBird}
            cachingFood={cachingFood}
            onCacheFood={cacheFoodOnBird}
            onViewTucked={(habitat, birdIndex) => setViewingTucked({ habitat, birdIndex })}
            migratingBird={migratingBird}
            onMigrate={startMigrate}
            onCompleteMigrate={completeMigrate}
            onReturnToHand={returnPlayedBirdToHand}
            onDiscardPlayed={discardPlayedBird}
            placingHummingbird={placingHummingbird}
            onPlaceHummingbird={placeHummingbird}
            onDiscardHummingbird={discardHummingbird}
            onNectarChange={(habitat, delta) => {
              setPlayer((prev) => {
                const current = prev.habitats[habitat].spentNectar;
                const next = Math.max(0, current + delta);
                if (next === current) return prev;
                return {
                  ...prev,
                  habitats: {
                    ...prev.habitats,
                    [habitat]: { ...prev.habitats[habitat], spentNectar: next },
                  },
                };
              });
            }}
            onUseFood={removeFood}
            onStartCache={(food) => setCachingFood(food)}
            placingCube={placingCube}
            onPlaceCubeToggle={() => setPlacingCube((prev) => !prev)}
            onPlaceCube={placeActionCube}
            onCubeClick={handleCubeClick}
            onReturnUsedCube={(habitat) => {
              if (habitat === "playABird") {
                setPlayer((prev) => {
                  if (prev.playABirdCubes <= 0) return prev;
                  return {
                    ...prev,
                    actionCubes: prev.actionCubes + 1,
                    playABirdCubes: prev.playABirdCubes - 1,
                  };
                });
                return;
              }
              setPlayer((prev) => {
                const h = prev.habitats[habitat];
                if (h.actionCubes <= 0) return prev;
                return {
                  ...prev,
                  actionCubes: prev.actionCubes + 1,
                  habitats: {
                    ...prev.habitats,
                    [habitat]: { ...h, actionCubes: h.actionCubes - 1 },
                  },
                };
              });
            }}
          />

          {/* Bird feeder + Food piles + Eggs + Hummingbird track */}
          <div className="flex flex-col items-stretch gap-2 self-start">
            <BirdFeeder size={186} />
            {/* Food pile buttons */}
            <div className="grid grid-cols-3 gap-1 justify-items-center px-2 py-1">
              {(["invertebrate", "seed", "fruit", "fish", "rodent", "nectar"] as const).map((food) => (
                <button
                  key={food}
                  className="flex flex-col items-center gap-0.5 group cursor-pointer"
                  onClick={() => gainFood(food)}
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
              className="flex flex-col items-center gap-1 group cursor-pointer self-center"
              onClick={(e) => {
                e.stopPropagation();
                setLayingEggs(!layingEggs);
              }}
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
            <HummingbirdTrack player={player} onMove={moveHummingbird} />
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
                  />
                  <BonusDiscardPile
                    cards={bonusDiscard}
                    width={DECK_BONUS_WIDTH}
                    height={DECK_CARD_HEIGHT}
                    onClick={() => bonusDiscard.length > 0 && setDiscardModal("bonus")}
                  />
                </div>
                <div className="flex items-start gap-4">
                  <BirdDeck count={deck.length} width={DECK_CARD_WIDTH} height={DECK_CARD_HEIGHT} onDraw={drawCard} />
                  <BirdDiscardPile
                    cards={birdDiscard}
                    width={DECK_CARD_WIDTH}
                    height={DECK_CARD_HEIGHT}
                    onClick={() => birdDiscard.length > 0 && setDiscardModal("bird")}
                  />
                </div>
              </div>
              <RoundEndGoalBoard
                state={roundEndBoard}
                onReroll={() => {
                  const shuffled = shuffle(allGoals);
                  setRoundEndBoard(createRoundEndGoalBoardState(shuffled.slice(0, 4)));
                }}
                placingCube={placingCube}
                onPlaceCube={(round, placement) => {
                  setPlayer((prev) => {
                    if (prev.actionCubes <= 0) return prev;
                    return { ...prev, actionCubes: prev.actionCubes - 1 };
                  });
                  setRoundEndBoard((prev) => {
                    const spots = prev.spots.map((r) => r.map((s) => ({ ...s, cubeColors: [...s.cubeColors] })));
                    spots[round][placement].cubeColors.push(player.cubeColor);
                    return { ...prev, spots };
                  });
                  setPlacingCube(false);
                }}
                onRemoveCube={(round, placement, cubeIndex) => {
                  const color = roundEndBoard.spots[round]?.[placement]?.cubeColors[cubeIndex];
                  if (!color) return;
                  if (color === player.cubeColor) {
                    setPlayer((prev) => ({ ...prev, actionCubes: prev.actionCubes + 1 }));
                  }
                  setRoundEndBoard((prev) => {
                    const spots = prev.spots.map((r) => r.map((s) => ({ ...s, cubeColors: [...s.cubeColors] })));
                    spots[round][placement].cubeColors.splice(cubeIndex, 1);
                    return { ...prev, spots };
                  });
                }}
              />
            </div>
            <div className="flex items-start gap-3">
              <BirdTray
                cards={birdTray}
                cardWidth={DECK_CARD_WIDTH}
                cardHeight={DECK_CARD_HEIGHT}
                onAddToHand={trayAddToHand}
                onDiscard={trayDiscard}
                onRefill={trayRefill}
                onReset={trayReset}
              />
              <div className="flex flex-col items-center gap-3 pt-1">
                <HummingbirdDeck
                  count={hummingbirdDeck.length}
                  width={DECK_HUMMINGBIRD_WIDTH}
                  height={DECK_HUMMINGBIRD_HEIGHT}
                  onDraw={drawHummingbird}
                />
                <HummingbirdDiscardPile
                  cards={hummingbirdDiscard}
                  width={DECK_HUMMINGBIRD_WIDTH}
                  onClick={() => hummingbirdDiscard.length > 0 && setDiscardModal("hummingbird")}
                />
              </div>
            </div>
            <HummingbirdTray
              cards={hummingbirdTray}
              cardWidth={DECK_HUMMINGBIRD_WIDTH}
              cardHeight={DECK_HUMMINGBIRD_HEIGHT}
              onSelect={hummingbirdTraySelect}
              onRefill={hummingbirdTrayRefill}
              onReset={hummingbirdTrayReset}
            />
          </div>
        </div>

        {/* ── Hand area (below game board) ── */}
        <div className="flex items-end" style={{ minHeight: HAND_AREA_HEIGHT }}>
          <div className="flex-1 min-w-0">
            {dockItems.length > 0 && <CardDock items={dockItems} baseHeight={HAND_CARD_HEIGHT} maxScale={1.8} />}
          </div>
        </div>
      </div>

      {/* Discard pile modal */}
      {discardModal === "bird" && (
        <CardListModal
          title="Bird Discard Pile"
          cards={birdDiscard}
          renderCard={(card, h) => <BirdCardDisplay bird={card as BirdCard} cardHeight={h} />}
          onClose={() => setDiscardModal(null)}
          onShuffle={() => setBirdDiscard((prev) => shuffle([...prev]))}
          onAddToHand={(id) => {
            addBirdToHand(id);
            if (birdDiscard.length <= 1) setDiscardModal(null);
          }}
        />
      )}
      {discardModal === "bonus" && (
        <CardListModal
          title="Bonus Discard Pile"
          cards={bonusDiscard}
          renderCard={(card, h) => <BonusCardDisplay card={card as BonusCard} cardHeight={h} />}
          onClose={() => setDiscardModal(null)}
          onShuffle={() => setBonusDiscard((prev) => shuffle([...prev]))}
          onAddToHand={(id) => {
            addBonusToHand(id);
            if (bonusDiscard.length <= 1) setDiscardModal(null);
          }}
        />
      )}
      {discardModal === "hummingbird" && (
        <CardListModal
          title="Hummingbird Discard Pile"
          cards={hummingbirdDiscard}
          renderCard={(card, h) => <HummingbirdCardDisplay card={card as HummingbirdCard} cardHeight={h} />}
          onClose={() => setDiscardModal(null)}
          onShuffle={() => setHummingbirdDiscard((prev) => shuffle([...prev]))}
        />
      )}
      {/* Tucked cards modal */}
      {viewingTucked &&
        (() => {
          const bird = player.habitats[viewingTucked.habitat].birds[viewingTucked.birdIndex];
          if (!bird) return null;
          return (
            <CardListModal
              title={`Tucked under ${bird["Common name"]}`}
              cards={bird.tuckedCards}
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
