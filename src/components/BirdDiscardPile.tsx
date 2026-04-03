import type { BirdCard } from "../types";
import { BirdCardDisplay } from "./BirdCardDisplay";

const cardBackUrl = new URL("../../assets/cards/backgrounds/bird-background.jpg", import.meta.url).href;

interface BirdDiscardPileProps {
  cards: BirdCard[];
  width: number;
  height: number;
  onClick?: () => void;
}

export function BirdDiscardPile({ cards, width, height, onClick }: BirdDiscardPileProps) {
  if (cards.length === 0) {
    return (
      <div
        className="rounded-lg flex items-center justify-center text-center px-2"
        style={{
          width,
          height,
          border: "2px dashed #3a9463",
          color: "#3a9463",
          fontSize: 13,
          fontFamily: "CardenioModernBold, sans-serif",
        }}
      >
        Discarded Birds
      </div>
    );
  }

  const pileCount = Math.min(cards.length - 1, 3);
  const pileIndices = Array.from({ length: pileCount }, (_, i) => pileCount - i);

  return (
    <div className="relative cursor-pointer" style={{ width, height }} onClick={onClick}>
      {pileIndices.map((i) => (
        <div
          key={i}
          className="absolute rounded-lg overflow-hidden"
          style={{
            width,
            height,
            top: i * -2,
            left: i * 1.5,
            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
            backgroundImage: `url(${cardBackUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      ))}
      <div
        className="absolute rounded-lg"
        style={{
          width,
          height,
          top: 0,
          left: 0,
          boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
        }}
      >
        <BirdCardDisplay bird={cards[cards.length - 1]} cardHeight={height} />
      </div>
      <div
        className="absolute -top-3 -right-3 rounded-full flex items-center justify-center text-white font-bold text-sm"
        style={{
          width: 36,
          height: 36,
          background: "#6b2121",
          border: "2px solid #f87171",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          zIndex: 10,
        }}
      >
        {cards.length}
      </div>
    </div>
  );
}
