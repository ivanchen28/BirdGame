import { useState } from "react";
import trayBg from "../../assets/bird-tray-background.png";
import type { HummingbirdCard } from "../types";
import { CardListModal } from "./CardListModal";
import { HummingbirdCardDisplay } from "./HummingbirdCardDisplay";

interface HummingbirdTrayProps {
  slots: HummingbirdCard[][];
  cardWidth: number;
  cardHeight: number;
  onSelect: (index: number) => void;
  onRefill: () => void;
  onReset: () => void;
  disabled?: boolean;
  returningHummingbird?: boolean;
  onReturnToSlot?: (index: number) => void;
}

export function HummingbirdTray({
  slots,
  cardWidth,
  cardHeight,
  onSelect,
  onRefill,
  onReset,
  disabled,
  returningHummingbird,
  onReturnToSlot,
}: HummingbirdTrayProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div
      className="flex items-stretch gap-0 rounded-lg p-1 bg-cover bg-center"
      style={{
        backgroundImage: `url(${trayBg})`,
        border: "2px solid rgba(255,255,255,0.3)",
      }}
    >
      <div className="flex items-start gap-2">
        {slots.map((slot, i) => {
          const topCard = slot.length > 0 ? slot[slot.length - 1] : null;
          const stackCount = slot.length;
          const isHighlighted = !!returningHummingbird;

          return (
            <div key={topCard?.id ?? `empty-${i}`} className="relative">
              {topCard ? (
                <div className="relative">
                  <div
                    className={`relative rounded-lg transition-shadow ${
                      isHighlighted
                        ? "ring-2 ring-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.6)] cursor-pointer"
                        : disabled
                          ? "cursor-default"
                          : "cursor-pointer hover:ring-2 hover:ring-yellow-400 hover:shadow-[0_0_12px_rgba(250,204,21,0.6)]"
                    }`}
                    style={{ zIndex: stackCount }}
                    onClick={
                      isHighlighted
                        ? (e) => {
                            e.stopPropagation();
                            onReturnToSlot?.(i);
                          }
                        : disabled
                          ? undefined
                          : (e) => {
                              e.stopPropagation();
                              onSelect(i);
                            }
                    }
                  >
                    <HummingbirdCardDisplay card={topCard} cardHeight={cardHeight} />
                  </div>
                  {stackCount > 1 && (
                    <div
                      className="absolute bg-black/50 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center"
                      style={{ zIndex: stackCount + 1, top: 4, right: 4 }}
                    >
                      {stackCount}
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className={`rounded-lg border-2 flex items-center justify-center ${
                    isHighlighted
                      ? "border-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.6)] cursor-pointer bg-black/20"
                      : "border-dashed border-white/30"
                  }`}
                  style={{ width: cardWidth, height: cardHeight }}
                  onClick={
                    isHighlighted
                      ? (e) => {
                          e.stopPropagation();
                          onReturnToSlot?.(i);
                        }
                      : undefined
                  }
                >
                  {!isHighlighted && (
                    <span className="text-white/30 text-xs" style={{ fontFamily: "CardenioModernBold, sans-serif" }}>
                      Empty
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
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
          title="Hummingbird Tray"
          cards={slots.map((slot) => slot[slot.length - 1]).filter(Boolean)}
          renderCard={(card, h) => <HummingbirdCardDisplay card={card as HummingbirdCard} cardHeight={h} />}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
