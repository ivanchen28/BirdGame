import { useMemo, useState } from "react";
import birdsData from "../assets/data/birds.json";
import bonusData from "../assets/data/bonus.json";
import { BirdDisplay } from "./components/BirdDisplay";
import { BonusCardDisplay } from "./components/BonusCardDisplay";
import { CardDock } from "./components/CardDock";
import type { BirdCard } from "./types/BirdCard";
import type { BonusCard } from "./types/BonusCard";

const cardBackUrl = new URL("../assets/cards/backgrounds/bird-background.jpg", import.meta.url).href;
const bonusBackUrl = new URL("../assets/cards/backgrounds/bonus-background.jpg", import.meta.url).href;

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

function App() {
  const [deck, setDeck] = useState(() => shuffle(allBirds));
  const [hand, setHand] = useState<BirdCard[]>([]);

  const [bonusDeck, setBonusDeck] = useState(() => shuffle(allBonuses));
  const [bonusHand, setBonusHand] = useState<BonusCard[]>([]);

  const drawCard = () => {
    if (deck.length === 0) return;
    setHand((prev) => [...prev, deck[0]]);
    setDeck((prev) => prev.slice(1));
  };

  const drawBonusCard = () => {
    if (bonusDeck.length === 0) return;
    setBonusHand((prev) => [...prev, bonusDeck[0]]);
    setBonusDeck((prev) => prev.slice(1));
  };

  // Build dock items: bonus cards first, then bird cards
  const dockItems = useMemo(() => {
    const bonusItems = bonusHand.map((bonus) => ({
      key: `bonus-${bonus.id}`,
      baseWidth: BONUS_CARD_WIDTH,
      render: (h: number) => <BonusCardDisplay card={bonus} cardHeight={h} />,
    }));
    const birdItems = hand.map((bird) => ({
      key: `bird-${bird.id}`,
      baseWidth: HAND_CARD_WIDTH,
      render: (h: number) => <BirdDisplay bird={bird} cardHeight={h} />,
    }));
    return [...bonusItems, ...birdItems];
  }, [bonusHand, hand]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-emerald-800 to-emerald-950 flex flex-col overflow-hidden">
      {/* ── Deck area (center) ── */}
      <div className="flex-1 flex items-center justify-center gap-12">
        {deck.length > 0 ? (
          <button
            onClick={drawCard}
            className="relative group cursor-pointer"
            style={{ width: HAND_CARD_WIDTH, height: HAND_CARD_HEIGHT }}
          >
            {/* Stacked card backs for pile effect */}
            {[3, 2, 1, 0].map((i) => (
              <div
                key={i}
                className="absolute rounded-lg overflow-hidden"
                style={{
                  width: HAND_CARD_WIDTH,
                  height: HAND_CARD_HEIGHT,
                  top: i * -2,
                  left: i * 1.5,
                  boxShadow: i === 0 ? "0 4px 20px rgba(0,0,0,0.5)" : "0 1px 3px rgba(0,0,0,0.3)",
                  backgroundImage: `url(${cardBackUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            ))}
            {/* Hover effect */}
            <div
              className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{ boxShadow: "0 0 30px rgba(74, 186, 120, 0.4)" }}
            />
            {/* Card count badge */}
            <div
              className="absolute -top-3 -right-3 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{
                width: 36,
                height: 36,
                background: "#b45309",
                border: "2px solid #fbbf24",
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                zIndex: 10,
              }}
            >
              {deck.length}
            </div>
          </button>
        ) : (
          <div
            className="rounded-lg flex items-center justify-center"
            style={{
              width: HAND_CARD_WIDTH,
              height: HAND_CARD_HEIGHT,
              border: "2px dashed #3a9463",
              color: "#3a9463",
              fontSize: 18,
              fontFamily: "CardenioModernBold, SiliciStrong, sans-serif",
            }}
          >
            Deck Empty
          </div>
        )}

        {/* Bonus deck */}
        {bonusDeck.length > 0 ? (
          <button
            onClick={drawBonusCard}
            className="relative group cursor-pointer"
            style={{ width: BONUS_CARD_WIDTH, height: HAND_CARD_HEIGHT }}
          >
            {[3, 2, 1, 0].map((i) => (
              <div
                key={i}
                className="absolute rounded-lg overflow-hidden"
                style={{
                  width: BONUS_CARD_WIDTH,
                  height: HAND_CARD_HEIGHT,
                  top: i * -2,
                  left: i * 1.5,
                  boxShadow: i === 0 ? "0 4px 20px rgba(0,0,0,0.5)" : "0 1px 3px rgba(0,0,0,0.3)",
                  backgroundImage: `url(${bonusBackUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            ))}
            <div
              className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{ boxShadow: "0 0 30px rgba(74, 186, 120, 0.4)" }}
            />
            <div
              className="absolute -top-3 -right-3 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{
                width: 36,
                height: 36,
                background: "#0e7490",
                border: "2px solid #67e8f9",
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                zIndex: 10,
              }}
            >
              {bonusDeck.length}
            </div>
          </button>
        ) : (
          <div
            className="rounded-lg flex items-center justify-center"
            style={{
              width: BONUS_CARD_WIDTH,
              height: HAND_CARD_HEIGHT,
              border: "2px dashed #3a9463",
              color: "#3a9463",
              fontSize: 18,
              fontFamily: "CardenioModernBold, SiliciStrong, sans-serif",
            }}
          >
            Deck Empty
          </div>
        )}
      </div>

      {/* ── Hand area (bottom) ── */}
      {dockItems.length > 0 && (
        <CardDock items={dockItems} baseHeight={HAND_CARD_HEIGHT} maxScale={1.5} padding={HAND_PADDING} />
      )}
    </div>
  );
}

export default App;
