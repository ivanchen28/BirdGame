import { foodUrl, iconUrl } from "../icons";
import type { FoodSupply, PlayedBirdCard } from "../types";
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
}

export function PlayedBirdCardDisplay({
  bird,
  cardHeight,
  highlighted,
  onSlotClick,
  onRemoveEgg,
}: PlayedBirdCardDisplayProps) {
  const cardWidth = cardHeight * CARD_RATIO;
  const tuckedCount = bird.tuckedCards.length;
  const stackLayers = Math.min(tuckedCount, 3);

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

        {/* Tucked cards indicator - right side */}
        {bird.tuckedCards.length > 0 && (
          <div
            className="absolute flex items-center gap-0.5 pointer-events-none"
            style={{
              bottom: "12%",
              right: "4%",
            }}
          >
            <div className="relative">
              <img
                src={cardBackUrl}
                alt="tucked"
                className="rounded-sm drop-shadow-lg"
                style={{ height: cardHeight * 0.08, aspectRatio: `${CARD_RATIO}` }}
              />
              <span
                className="absolute inset-0 flex items-center justify-center text-white font-bold drop-shadow"
                style={{
                  fontSize: cardHeight * 0.04,
                  textShadow: "0 0 4px rgba(0,0,0,0.9)",
                }}
              >
                {bird.tuckedCards.length}
              </span>
            </div>
          </div>
        )}

        {/* Cached food indicator - right side, above tucked */}
        {totalCachedFood(bird.cachedFood) > 0 && (
          <div
            className="absolute flex items-center gap-0.5 pointer-events-none"
            style={{
              bottom: bird.tuckedCards.length > 0 ? "22%" : "12%",
              right: "4%",
            }}
          >
            <div className="relative">
              <img
                src={foodUrl("wild")}
                alt="cached food"
                className="drop-shadow-lg"
                style={{ height: cardHeight * 0.08 }}
              />
              <span
                className="absolute inset-0 flex items-center justify-center text-white font-bold drop-shadow"
                style={{
                  fontSize: cardHeight * 0.04,
                  textShadow: "0 0 4px rgba(0,0,0,0.9)",
                }}
              >
                {totalCachedFood(bird.cachedFood)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
