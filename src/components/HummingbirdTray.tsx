import trayBg from "../../assets/bird-tray-background.png";
import type { HummingbirdCard } from "../types";
import { HummingbirdCardDisplay } from "./HummingbirdCardDisplay";

interface HummingbirdTrayProps {
  cards: (HummingbirdCard | null)[];
  cardWidth: number;
  cardHeight: number;
  onSelect: (index: number) => void;
  onRefill: () => void;
  onReset: () => void;
}

export function HummingbirdTray({ cards, cardWidth, cardHeight, onSelect, onRefill, onReset }: HummingbirdTrayProps) {
  return (
    <div
      className="flex flex-col items-center gap-2 rounded-lg p-2 bg-cover bg-center"
      style={{
        backgroundImage: `url(${trayBg})`,
        border: "2px solid rgba(255,255,255,0.3)",
      }}
    >
      <div className="flex items-start gap-2.5">
        {cards.map((card, i) => (
          <div key={card?.id ?? `empty-${i}`} className="relative">
            {card ? (
              <div
                className="cursor-pointer rounded-lg transition-shadow hover:ring-2 hover:ring-yellow-400 hover:shadow-[0_0_12px_rgba(250,204,21,0.6)]"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(i);
                }}
              >
                <HummingbirdCardDisplay card={card} cardHeight={cardHeight} />
              </div>
            ) : (
              <div
                className="rounded-lg border-2 border-dashed border-white/30 flex items-center justify-center"
                style={{ width: cardWidth, height: cardHeight }}
              >
                <span className="text-white/30 text-xs">Empty</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRefill();
          }}
          className="px-2 py-1 rounded text-[0.6rem] font-bold text-white/80 cursor-pointer transition-colors hover:text-white hover:bg-white/15"
          style={{
            background: "rgba(0,0,0,0.3)",
            fontFamily: "CardenioModernBold, sans-serif",
          }}
        >
          Refill
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReset();
          }}
          className="px-2 py-1 rounded text-[0.6rem] font-bold text-white/80 cursor-pointer transition-colors hover:text-white hover:bg-white/15"
          style={{
            background: "rgba(0,0,0,0.3)",
            fontFamily: "CardenioModernBold, sans-serif",
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
