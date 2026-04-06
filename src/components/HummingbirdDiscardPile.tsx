import type { HummingbirdCard } from "../types";

interface HummingbirdDiscardPileProps {
  cards: HummingbirdCard[];
  width: number;
  onClick?: () => void;
}

export function HummingbirdDiscardPile({ cards, width, onClick }: HummingbirdDiscardPileProps) {
  return (
    <button
      className="rounded-lg flex items-center justify-center gap-1.5 px-2 py-1 text-center cursor-pointer transition-colors hover:bg-white/15"
      style={{
        width,
        border: "2px solid rgba(255,255,255,0.3)",
        background: "rgba(0,0,0,0.3)",
        fontFamily: "CardenioModernBold, sans-serif",
        fontSize: "0.55rem",
        color: "rgba(255,255,255,0.8)",
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      <span>Discarded Hummingbirds</span>
      <span
        className="rounded-full flex items-center justify-center text-white font-bold"
        style={{
          minWidth: 18,
          height: 18,
          background: "#6b7280",
          border: "1.5px solid #d1d5db",
          fontSize: "0.6rem",
          padding: "0 4px",
        }}
      >
        {cards.length}
      </span>
    </button>
  );
}
