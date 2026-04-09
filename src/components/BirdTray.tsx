import { useState } from "react";
import trayBg from "../../assets/bird-tray-background.png";
import type { BirdCard } from "../types";
import { BirdCardDisplay } from "./BirdCardDisplay";
import { CardListModal } from "./CardListModal";

interface BirdTrayProps {
  cards: (BirdCard | null)[];
  cardWidth: number;
  cardHeight: number;
  onAddToHand: (index: number) => void;
  onDiscard: (index: number) => void;
  onRefill: () => void;
  onReset: () => void;
  disabled?: boolean;
}

export function BirdTray({
  cards,
  cardWidth,
  cardHeight,
  onAddToHand,
  onDiscard,
  onRefill,
  onReset,
  disabled,
}: BirdTrayProps) {
  const [menuIndex, setMenuIndex] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  return (
    <div
      className="flex items-stretch gap-0 rounded-lg p-1 bg-cover bg-center self-center"
      style={{
        backgroundImage: `url(${trayBg})`,
        border: "2px solid rgba(255,255,255,0.3)",
      }}
    >
      <div className="flex items-start gap-2">
        {cards.map((card, i) => (
          <div key={card?.id ?? `empty-${i}`} className="relative">
            {card ? (
              <div
                className={`rounded-lg transition-shadow ${disabled ? "cursor-default" : "cursor-pointer hover:ring-2 hover:ring-yellow-400 hover:shadow-[0_0_12px_rgba(250,204,21,0.6)]"}`}
                onClick={
                  disabled
                    ? undefined
                    : (e) => {
                        e.stopPropagation();
                        setMenuIndex(menuIndex === i ? null : i);
                      }
                }
              >
                <BirdCardDisplay bird={card} cardHeight={cardHeight} />
              </div>
            ) : (
              <div
                className="rounded-lg border-2 border-dashed border-white/30 flex items-center justify-center"
                style={{ width: cardWidth, height: cardHeight }}
              >
                <span className="text-white/30 text-xs">Empty</span>
              </div>
            )}

            {/* Overlay menu */}
            {menuIndex === i && card && (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.5)", borderRadius: 8, zIndex: 20 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuIndex(null);
                }}
              >
                <div className="flex flex-col gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToHand(i);
                      setMenuIndex(null);
                    }}
                    className="px-3 py-1.5 rounded-lg text-sm font-bold text-white cursor-pointer"
                    style={{
                      background: "#166534",
                      border: "2px solid #4ade80",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                      fontFamily: "CardenioModernBold, sans-serif",
                    }}
                  >
                    Add to Hand
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDiscard(i);
                      setMenuIndex(null);
                    }}
                    className="px-3 py-1.5 rounded-lg text-sm font-bold text-white cursor-pointer"
                    style={{
                      background: "#991b1b",
                      border: "2px solid #f87171",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                      fontFamily: "CardenioModernBold, sans-serif",
                    }}
                  >
                    Discard
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1 ml-1 justify-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRefill();
          }}
          className="px-1 py-2 rounded text-[0.6rem] font-bold text-white/80 cursor-pointer transition-colors hover:text-white hover:bg-white/15"
          style={{
            background: "rgba(0,0,0,0.3)",
            fontFamily: "CardenioModernBold, sans-serif",
            writingMode: "vertical-rl",
          }}
        >
          Refill
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReset();
          }}
          className="px-1 py-2 rounded text-[0.6rem] font-bold text-white/80 cursor-pointer transition-colors hover:text-white hover:bg-white/15"
          style={{
            background: "rgba(0,0,0,0.3)",
            fontFamily: "CardenioModernBold, sans-serif",
            writingMode: "vertical-rl",
          }}
        >
          Reset
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowModal(true);
          }}
          className="px-1 py-2 rounded text-[0.6rem] font-bold text-white/80 cursor-pointer transition-colors hover:text-white hover:bg-white/15"
          style={{
            background: "rgba(0,0,0,0.3)",
            fontFamily: "CardenioModernBold, sans-serif",
            writingMode: "vertical-rl",
          }}
        >
          View
        </button>
      </div>

      {showModal && (
        <CardListModal
          title="Bird Tray"
          cards={cards.filter((c): c is BirdCard => c !== null)}
          renderCard={(card, h) => <BirdCardDisplay bird={card as BirdCard} cardHeight={h} />}
          onClose={() => setShowModal(false)}
          onAddToHand={(cardId) => {
            const idx = cards.findIndex((c) => c?.id === cardId);
            if (idx !== -1) {
              onAddToHand(idx);
              if (cards.filter((c) => c !== null).length <= 1) setShowModal(false);
            }
          }}
          onDiscard={(cardId) => {
            const idx = cards.findIndex((c) => c?.id === cardId);
            if (idx !== -1) {
              onDiscard(idx);
              if (cards.filter((c) => c !== null).length <= 1) setShowModal(false);
            }
          }}
        />
      )}
    </div>
  );
}
