import { useCallback, useMemo, useState } from "react";
import birdsData from "../assets/data/birds.json";
import bonusData from "../assets/data/bonus.json";
import { BirdCardDisplay } from "./components/BirdCardDisplay";
import { BirdDeck } from "./components/BirdDeck";
import { BirdDiscardPile } from "./components/BirdDiscardPile";
import { BirdFeeder } from "./components/BirdFeeder";
import { BonusCardDisplay } from "./components/BonusCardDisplay";
import { BonusDeck } from "./components/BonusDeck";
import { BonusDiscardPile } from "./components/BonusDiscardPile";
import { CardDock } from "./components/CardDock";
import { CardWithDiscard } from "./components/CardWithDiscard";
import { createPlayer, type BirdCard, type BonusCard, type Player } from "./types";

const allBirds: BirdCard[] = birdsData as BirdCard[];
const allBonuses: BonusCard[] = bonusData as BonusCard[];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const HAND_CARD_HEIGHT = 260;
const HAND_CARD_WIDTH = HAND_CARD_HEIGHT * 0.655;
const BONUS_CARD_WIDTH = HAND_CARD_HEIGHT * (1 / 1.526);
const HAND_PADDING = 16;

const DECK_CARD_HEIGHT = 180;
const DECK_CARD_WIDTH = DECK_CARD_HEIGHT * 0.655;
const DECK_BONUS_WIDTH = DECK_CARD_HEIGHT * (1 / 1.526);

function App() {
  const [deck, setDeck] = useState(() => shuffle(allBirds));
  const [bonusDeck, setBonusDeck] = useState(() => shuffle(allBonuses));
  const [player, setPlayer] = useState<Player>(() => createPlayer("Player 1", "white"));
  const [birdDiscard, setBirdDiscard] = useState<BirdCard[]>([]);
  const [bonusDiscard, setBonusDiscard] = useState<BonusCard[]>([]);

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
        <CardWithDiscard width={HAND_CARD_WIDTH} height={h} onDiscard={() => discardBird(bird.id)}>
          <BirdCardDisplay bird={bird} cardHeight={h} />
        </CardWithDiscard>
      ),
    }));
    return [...bonusItems, ...birdItems];
  }, [player.bonusHand, player.birdHand, discardBird, discardBonus]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-emerald-800 to-emerald-950 flex flex-col overflow-hidden">
      {/* ── Deck area (center) ── */}
      <div className="flex-1 flex items-center justify-end pr-12">
        {/* Bird Feeder */}
        <BirdFeeder />

        {/* Card decks + discard piles stacked vertically */}
        <div className="flex flex-col items-center gap-6 ml-12">
          {/* Bird deck + discard */}
          <div className="flex items-center gap-4">
            <BirdDeck count={deck.length} width={DECK_CARD_WIDTH} height={DECK_CARD_HEIGHT} onDraw={drawCard} />
            <BirdDiscardPile cards={birdDiscard} width={DECK_CARD_WIDTH} height={DECK_CARD_HEIGHT} />
          </div>

          {/* Bonus deck + discard */}
          <div className="flex items-center gap-4">
            <BonusDeck
              count={bonusDeck.length}
              width={DECK_BONUS_WIDTH}
              height={DECK_CARD_HEIGHT}
              onDraw={drawBonusCard}
            />
            <BonusDiscardPile cards={bonusDiscard} width={DECK_BONUS_WIDTH} height={DECK_CARD_HEIGHT} />
          </div>
        </div>
      </div>

      {/* ── Hand area (bottom) ── */}
      {dockItems.length > 0 && (
        <CardDock items={dockItems} baseHeight={HAND_CARD_HEIGHT} maxScale={1.5} padding={HAND_PADDING} />
      )}
    </div>
  );
}

export default App;
