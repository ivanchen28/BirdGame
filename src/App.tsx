import { useCallback, useMemo, useState } from "react";
import birdsData from "../assets/data/birds.json";
import bonusData from "../assets/data/bonus.json";
import hummingbirdsData from "../assets/data/hummingbirds.json";
import { BirdCardDisplay } from "./components/BirdCardDisplay";
import { BirdDeck } from "./components/BirdDeck";
import { BirdDiscardPile } from "./components/BirdDiscardPile";
import { BirdFeeder } from "./components/BirdFeeder";
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
import { PersonalSupplyDisplay } from "./components/PersonalSupplyDisplay";
import { foodUrl, iconUrl } from "./icons";
import {
  createPlayer,
  toPlayedBird,
  type BirdCard,
  type BonusCard,
  type FoodType,
  type HabitatType,
  type HummingbirdCard,
  type Player,
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

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const HAND_CARD_HEIGHT = 220;
const HAND_CARD_WIDTH = HAND_CARD_HEIGHT * 0.655;
const BONUS_CARD_WIDTH = HAND_CARD_HEIGHT * (1 / 1.526);
const HAND_PADDING = 16;
const HAND_AREA_HEIGHT = HAND_CARD_HEIGHT + 32;

const DECK_CARD_HEIGHT = 180;
const DECK_CARD_WIDTH = DECK_CARD_HEIGHT * 0.655;
const DECK_BONUS_WIDTH = DECK_CARD_HEIGHT * (1 / 1.526);

const HUMMINGBIRD_SCALE = 44 / 57;
const DECK_HUMMINGBIRD_HEIGHT = DECK_CARD_HEIGHT * HUMMINGBIRD_SCALE;
const DECK_HUMMINGBIRD_WIDTH = DECK_HUMMINGBIRD_HEIGHT * 0.655;

function App() {
  const [deck, setDeck] = useState(() => shuffle(allBirds));
  const [bonusDeck, setBonusDeck] = useState(() => shuffle(allBonuses));
  const [player, setPlayer] = useState<Player>(() => createPlayer("Player 1", "white"));
  const [birdDiscard, setBirdDiscard] = useState<BirdCard[]>([]);
  const [bonusDiscard, setBonusDiscard] = useState<BonusCard[]>([]);
  const [hummingbirdDeck, setHummingbirdDeck] = useState(() => shuffle(allHummingbirds));
  const [hummingbirdDiscard, setHummingbirdDiscard] = useState<HummingbirdCard[]>([]);
  const [placingHummingbird, setPlacingHummingbird] = useState<HummingbirdCard | null>(null);
  const [discardModal, setDiscardModal] = useState<"bird" | "bonus" | "hummingbird" | null>(null);
  const [placingBird, setPlacingBird] = useState<BirdCard | null>(null);
  const [tuckingBird, setTuckingBird] = useState<BirdCard | null>(null);
  const [layingEggs, setLayingEggs] = useState(false);
  const [cachingFood, setCachingFood] = useState<FoodType | null>(null);
  const [viewingTucked, setViewingTucked] = useState<{ habitat: HabitatType; birdIndex: number } | null>(null);

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
    setHummingbirdDeck((prev) => prev.slice(1));
  };

  const placeHummingbird = useCallback(
    (habitat: HabitatType) => {
      if (!placingHummingbird) return;
      const card = placingHummingbird;
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
    },
    [placingHummingbird],
  );

  const cancelPlaceHummingbird = useCallback(() => {
    if (!placingHummingbird) return;
    // Put the card back on top of the deck
    setHummingbirdDeck((prev) => [placingHummingbird, ...prev]);
    setPlacingHummingbird(null);
  }, [placingHummingbird]);

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
      className="fixed inset-0 bg-gradient-to-br from-emerald-800 to-emerald-950 flex flex-col overflow-hidden"
      onClick={() => {
        setLayingEggs(false);
        setCachingFood(null);
      }}
    >
      {/* ── Main area ── */}
      <div
        className="flex-1 flex items-center justify-between p-2 overflow-hidden"
        style={{ height: `calc(100vh - ${HAND_AREA_HEIGHT}px)` }}
      >
        {/* Game board (top-left) */}
        <div className="self-start flex items-start gap-3" style={{ height: "calc(100% - 24px)" }}>
          <GameBoard
            player={player}
            placingBird={placingBird}
            onPlaceBird={playBirdToHabitat}
            onCancelPlace={() => setPlacingBird(null)}
            tuckingBird={tuckingBird}
            onTuckBird={tuckBirdBehind}
            onCancelTuck={() => setTuckingBird(null)}
            layingEggs={layingEggs}
            onLayEgg={layEggOnBird}
            onRemoveEgg={removeEggFromBird}
            cachingFood={cachingFood}
            onCacheFood={cacheFoodOnBird}
            onCancelCache={() => {
              setCachingFood(null);
            }}
            onViewTucked={(habitat, birdIndex) => setViewingTucked({ habitat, birdIndex })}
            placingHummingbird={placingHummingbird}
            onPlaceHummingbird={placeHummingbird}
            onCancelPlaceHummingbird={cancelPlaceHummingbird}
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
          />

          {/* Bird feeder + egg/food piles */}
          <div className="flex flex-col items-center justify-end gap-3 self-stretch">
            <BirdFeeder />
            {/* Egg pile button */}
            <button
              className="flex flex-col items-center gap-1 group cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setLayingEggs(!layingEggs);
              }}
            >
              <div
                className={`relative rounded-full flex items-center justify-center transition-shadow ${
                  layingEggs
                    ? "ring-2 ring-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.6)]"
                    : "group-hover:shadow-[0_0_12px_rgba(255,255,255,0.3)]"
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

            {/* Food pile buttons */}
            <div className="grid grid-cols-2 gap-2">
              {(["invertebrate", "seed", "fruit", "fish", "rodent", "nectar"] as const).map((food) => (
                <button
                  key={food}
                  className="flex flex-col items-center gap-0.5 group cursor-pointer"
                  onClick={() => gainFood(food)}
                >
                  <div
                    className="relative rounded-full flex items-center justify-center transition-shadow group-hover:shadow-[0_0_12px_rgba(255,255,255,0.3)]"
                    style={{
                      width: 44,
                      height: 44,
                      background: "rgba(0,0,0,0.35)",
                      border: "2px solid rgba(255,255,255,0.6)",
                    }}
                  >
                    <img src={foodUrl(food)} alt={food} className="h-7 drop-shadow" />
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
          </div>

          {/* Personal supply */}
          <PersonalSupplyDisplay player={player} onUseFood={removeFood} onStartCache={(food) => setCachingFood(food)} />
        </div>

        {/* Deck area (right side) */}
        <div className="flex items-center">
          {/* Card decks + discard piles stacked vertically */}
          <div className="flex flex-col items-center gap-6 ml-12">
            {/* Bird deck + discard */}
            <div className="flex items-center gap-4">
              <BirdDeck count={deck.length} width={DECK_CARD_WIDTH} height={DECK_CARD_HEIGHT} onDraw={drawCard} />
              <BirdDiscardPile
                cards={birdDiscard}
                width={DECK_CARD_WIDTH}
                height={DECK_CARD_HEIGHT}
                onClick={() => birdDiscard.length > 0 && setDiscardModal("bird")}
              />
            </div>

            {/* Bonus deck + discard */}
            <div className="flex items-center gap-4">
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

            {/* Hummingbird deck + discard */}
            <div className="flex items-center gap-4">
              <HummingbirdDeck
                count={hummingbirdDeck.length}
                width={DECK_HUMMINGBIRD_WIDTH}
                height={DECK_HUMMINGBIRD_HEIGHT}
                onDraw={drawHummingbird}
              />
              <HummingbirdDiscardPile
                cards={hummingbirdDiscard}
                width={DECK_HUMMINGBIRD_WIDTH}
                height={DECK_HUMMINGBIRD_HEIGHT}
                onClick={() => hummingbirdDiscard.length > 0 && setDiscardModal("hummingbird")}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Hand area (bottom) ── */}
      <div className="flex items-end" style={{ minHeight: HAND_AREA_HEIGHT }}>
        {/* Card dock */}
        <div className="flex-1 min-w-0">
          {dockItems.length > 0 && (
            <CardDock items={dockItems} baseHeight={HAND_CARD_HEIGHT} maxScale={1.5} padding={HAND_PADDING} />
          )}
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
