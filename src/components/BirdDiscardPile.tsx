import type { BirdCard } from "../types";
import { BirdCardDisplay } from "./BirdCardDisplay";

interface BirdDiscardPileProps {
  cards: BirdCard[];
  width: number;
  height: number;
}

export function BirdDiscardPile({ cards, width, height }: BirdDiscardPileProps) {
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

  return (
    <div
      className="relative rounded-lg"
      style={{
        width,
        height,
        boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
      }}
    >
      <BirdCardDisplay bird={cards[cards.length - 1]} cardHeight={height} />
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
