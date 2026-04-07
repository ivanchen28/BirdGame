import { useEffect, useRef, useState } from "react";
import { foodUrl, iconUrl } from "../icons";
import type { FoodSupply, FoodType, PlayedBirdCard } from "../types";
import { BirdCardDisplay } from "./BirdCardDisplay";

const cardBackUrl = new URL("../../assets/cards/backgrounds/bird-background.jpg", import.meta.url).href;

const CARD_RATIO = 0.655;

function totalCachedFood(food: FoodSupply): number {
  return food.invertebrate + food.seed + food.fish + food.fruit + food.rodent + food.nectar;
}

interface PlayedBirdCardDisplayProps {
  bird: PlayedBirdCard;
  cardHeight: number;
  highlighted?: boolean;
  onSlotClick?: () => void;
  onRemoveEgg?: () => void;
  onViewTucked?: () => void;
  onMigrate?: () => void;
  onReturnToHand?: () => void;
  onDiscardPlayed?: () => void;
}

export function PlayedBirdCardDisplay({
  bird,
  cardHeight,
  highlighted,
  onSlotClick,
  onRemoveEgg,
  onViewTucked,
  onMigrate,
  onReturnToHand,
  onDiscardPlayed,
}: PlayedBirdCardDisplayProps) {
  const cardWidth = cardHeight * CARD_RATIO;
  const tuckedCount = bird.tuckedCards.length;
  const stackLayers = Math.min(tuckedCount, 3);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [menuOpen]);

  return (
    <div
      className={`relative ${highlighted ? "cursor-pointer" : ""}`}
      style={{ width: cardWidth, height: cardHeight }}
      onClick={
        highlighted
          ? (e) => {
              e.stopPropagation();
              onSlotClick?.();
            }
          : undefined
      }
    >
      {/* Tucked card backs behind the bird */}
      {stackLayers > 0 &&
        Array.from({ length: stackLayers }, (_, i) => {
          const offset = (stackLayers - i) * 2;
          return (
            <div
              key={`tuck-${i}`}
              className="absolute rounded-lg overflow-hidden"
              style={{
                width: cardWidth,
                height: cardHeight,
                top: -offset,
                left: offset,
                backgroundImage: `url(${cardBackUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
              }}
            />
          );
        })}

      {/* Main card */}
      <div
        className={`absolute rounded-lg overflow-hidden ${highlighted ? "ring-2 ring-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.6)]" : ""}`}
        style={{
          width: cardWidth,
          height: cardHeight,
          top: 0,
          left: 0,
          boxShadow: highlighted ? undefined : "0 4px 12px rgba(0,0,0,0.4)",
        }}
      >
        <BirdCardDisplay bird={bird} cardHeight={cardHeight} />

        {/* ── Played bird overlays ── */}

        {/* Eggs laid - centered on card, 2 per row */}
        {bird.eggsLaid > 0 && (
          <div
            className="absolute flex flex-wrap justify-center content-start"
            style={{
              top: "30%",
              left: "25%",
              width: "50%",
              gap: cardHeight * 0.02,
            }}
          >
            {Array.from({ length: bird.eggsLaid }, (_, i) => (
              <img
                key={i}
                src={iconUrl("egg")}
                alt="egg"
                className="drop-shadow-lg cursor-pointer hover:brightness-125 transition-all"
                style={{
                  width: `calc(50% - ${cardHeight * 0.02}px)`,
                  maxWidth: cardHeight * 0.12,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveEgg?.();
                }}
              />
            ))}
          </div>
        )}
        {bird.tuckedCards.length > 0 && (
          <div
            className="absolute flex items-center gap-0.5 cursor-pointer hover:brightness-125 transition-all"
            style={{
              top: "20%",
              right: "5%",
            }}
            onClick={(e) => {
              e.stopPropagation();
              onViewTucked?.();
            }}
          >
            <div className="relative">
              <img
                src={cardBackUrl}
                alt="tucked"
                className="rounded-sm drop-shadow-lg"
                style={{ height: cardHeight * 0.12, aspectRatio: `${CARD_RATIO}` }}
              />
              <span
                className="absolute inset-0 flex items-center justify-center text-white drop-shadow"
                style={{
                  fontSize: cardHeight * 0.06,
                  textShadow: "0 0 4px rgba(0,0,0,0.9)",
                }}
              >
                {bird.tuckedCards.length}
              </span>
            </div>
          </div>
        )}

        {/* Bird action menu */}
        <div ref={menuRef} className="absolute" style={{ bottom: "2%", right: "3%" }}>
          <button
            className="flex items-center justify-center rounded-full hover:bg-white/20 transition-colors cursor-pointer"
            style={{ width: cardHeight * 0.07, height: cardHeight * 0.07 }}
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#888"
              strokeWidth={1.5}
              style={{ width: cardHeight * 0.045, height: cardHeight * 0.045 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          {menuOpen && (
            <div
              className="absolute z-50 flex flex-col rounded-lg shadow-lg overflow-hidden"
              style={{
                bottom: "110%",
                right: 0,
                background: "rgba(0,0,0,0.85)",
                border: "1px solid rgba(255,255,255,0.3)",
                minWidth: "max-content",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="text-white/90 hover:text-yellow-400 px-3 py-1.5 hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap text-left"
                style={{
                  fontFamily: "CardenioModernBold, SiliciStrong, sans-serif",
                  fontSize: "0.65rem",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onMigrate?.();
                }}
              >
                MIGRATE
              </button>
              <div className="h-px bg-white/20" />
              <button
                className="text-white/90 hover:text-yellow-400 px-3 py-1.5 hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap text-left"
                style={{
                  fontFamily: "CardenioModernBold, SiliciStrong, sans-serif",
                  fontSize: "0.65rem",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onReturnToHand?.();
                }}
              >
                RETURN TO HAND
              </button>
              <div className="h-px bg-white/20" />
              <button
                className="text-white/90 hover:text-red-400 px-3 py-1.5 hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap text-left"
                style={{
                  fontFamily: "CardenioModernBold, SiliciStrong, sans-serif",
                  fontSize: "0.65rem",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onDiscardPlayed?.();
                }}
              >
                DISCARD
              </button>
            </div>
          )}
        </div>
      </div>

      {totalCachedFood(bird.cachedFood) > 0 && (
        <CachedFoodIndicator
          cachedFood={bird.cachedFood}
          cardHeight={cardHeight}
          hasTucked={bird.tuckedCards.length > 0}
        />
      )}
    </div>
  );
}

function CachedFoodIndicator({
  cachedFood,
  cardHeight,
  hasTucked,
}: {
  cachedFood: FoodSupply;
  cardHeight: number;
  hasTucked: boolean;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const entries = (Object.entries(cachedFood) as [FoodType, number][]).filter(([, n]) => n > 0);

  return (
    <div
      className="absolute"
      style={{
        top: hasTucked ? "34%" : "20%",
        right: "4%",
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <img src={foodUrl("wild")} alt="cached food" className="drop-shadow-lg" style={{ height: cardHeight * 0.09 }} />
      <span
        className="absolute inset-0 flex items-center justify-center text-white pointer-events-none"
        style={{
          fontSize: cardHeight * 0.06,
          textShadow: "0 0 4px rgba(0,0,0,0.9)",
        }}
      >
        {totalCachedFood(cachedFood)}
      </span>

      {showTooltip && (
        <div
          className="absolute z-50 rounded-lg px-2.5 py-1.5 shadow-lg flex items-center gap-2 w-max"
          style={{
            bottom: "110%",
            right: "50%",
            transform: "translateX(50%)",
            background: "rgba(0,0,0,0.85)",
            border: "1px solid rgba(255,255,255,0.3)",
          }}
        >
          {entries.map(([food, count]) => (
            <div key={food} className="flex items-center gap-1 py-0.5">
              <img src={foodUrl(food)} alt={food} className="h-4 drop-shadow" />
              <span
                className="text-white font-bold"
                style={{
                  fontFamily: "CardenioModernBold, SiliciStrong, sans-serif",
                  fontSize: "0.7rem",
                }}
              >
                ×{count}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
