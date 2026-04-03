import { useState } from "react";
import type { BirdCard, BonusCard } from "../types";
import { BirdCardDisplay } from "./BirdCardDisplay";
import { BonusCardDisplay } from "./BonusCardDisplay";

const MODAL_CARD_HEIGHT = 320;

interface DiscardPileModalProps {
  birdCards: BirdCard[];
  bonusCards: BonusCard[];
  type: "bird" | "bonus";
  onClose: () => void;
  onShuffle: () => void;
  onAddBirdToHand: (birdId: number) => void;
  onAddBonusToHand: (bonusId: number) => void;
}

export function DiscardPileModal({
  birdCards,
  bonusCards,
  type,
  onClose,
  onShuffle,
  onAddBirdToHand,
  onAddBonusToHand,
}: DiscardPileModalProps) {
  const [selectedBird, setSelectedBird] = useState<number | null>(null);
  const [selectedBonus, setSelectedBonus] = useState<number | null>(null);

  const isBird = type === "bird";
  const title = isBird ? "Bird Discard Pile" : "Bonus Discard Pile";
  const cards = isBird ? birdCards : bonusCards;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 1000, background: "rgba(0,0,0,0.7)" }}
      onClick={onClose}
    >
      <div
        className="relative rounded-xl p-6 flex flex-col items-center"
        style={{
          background: "linear-gradient(135deg, #1a3a2a 0%, #0f2920 100%)",
          border: "2px solid #3a9463",
          boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
          maxWidth: "90vw",
          maxHeight: "85vh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between w-full mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-white text-xl" style={{ fontFamily: "CardenioModernBold, sans-serif" }}>
              {title} ({cards.length})
            </h2>
            {cards.length > 1 && (
              <button
                onClick={onShuffle}
                className="px-2.5 py-1 rounded-lg text-xs font-bold text-white cursor-pointer hover:brightness-125 transition-all"
                style={{
                  background: "#6b2121",
                  border: "1px solid #f87171",
                  fontFamily: "CardenioModernBold, sans-serif",
                  fontSize: 12,
                }}
              >
                Shuffle
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-red-400 transition-colors cursor-pointer text-2xl leading-none px-2"
            style={{ fontFamily: "sans-serif" }}
          >
            ✕
          </button>
        </div>

        {/* Cards grid */}
        <div
          className="flex flex-wrap gap-4 justify-center overflow-y-auto"
          style={{ maxHeight: "calc(85vh - 80px)", padding: "8px" }}
        >
          {cards.length === 0 && (
            <p className="text-emerald-400 text-sm" style={{ fontFamily: "CardenioModernBold, sans-serif" }}>
              No cards in discard pile
            </p>
          )}
          {isBird
            ? birdCards.map((bird) => (
                <div key={bird.id} className="relative shrink-0 hover:z-10" style={{ overflow: "visible" }}>
                  <div
                    className="cursor-pointer transition-transform hover:scale-105"
                    style={{ transformOrigin: "center center" }}
                    onClick={() => setSelectedBird(selectedBird === bird.id ? null : bird.id)}
                  >
                    <BirdCardDisplay bird={bird} cardHeight={MODAL_CARD_HEIGHT} />
                  </div>
                  {selectedBird === bird.id && (
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ background: "rgba(0,0,0,0.5)", borderRadius: 8, zIndex: 20 }}
                      onClick={() => setSelectedBird(null)}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddBirdToHand(bird.id);
                          setSelectedBird(null);
                        }}
                        className="px-3 py-1.5 rounded-lg text-sm font-bold text-white cursor-pointer"
                        style={{
                          background: "#15803d",
                          border: "2px solid #4ade80",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                          fontFamily: "CardenioModernBold, sans-serif",
                        }}
                      >
                        Add to Hand
                      </button>
                    </div>
                  )}
                </div>
              ))
            : bonusCards.map((bonus) => (
                <div key={bonus.id} className="relative shrink-0 hover:z-10" style={{ overflow: "visible" }}>
                  <div
                    className="cursor-pointer transition-transform hover:scale-105"
                    style={{ transformOrigin: "center center" }}
                    onClick={() => setSelectedBonus(selectedBonus === bonus.id ? null : bonus.id)}
                  >
                    <BonusCardDisplay card={bonus} cardHeight={MODAL_CARD_HEIGHT} />
                  </div>
                  {selectedBonus === bonus.id && (
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ background: "rgba(0,0,0,0.5)", borderRadius: 8, zIndex: 20 }}
                      onClick={() => setSelectedBonus(null)}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddBonusToHand(bonus.id);
                          setSelectedBonus(null);
                        }}
                        className="px-3 py-1.5 rounded-lg text-sm font-bold text-white cursor-pointer"
                        style={{
                          background: "#15803d",
                          border: "2px solid #4ade80",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                          fontFamily: "CardenioModernBold, sans-serif",
                        }}
                      >
                        Add to Hand
                      </button>
                    </div>
                  )}
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}
