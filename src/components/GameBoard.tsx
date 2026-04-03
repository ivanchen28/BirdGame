import boardBg from "../../assets/board-background.jpg";
import birdBack from "../../assets/cards/backgrounds/bird-background.jpg";
import { foodUrl, habitatUrl, iconUrl } from "../icons";
import type { BirdCard, HabitatType, Player } from "../types";
import { BirdCardDisplay } from "./BirdCardDisplay";

const CARD_RATIO = 0.655; // width / height
const HUMMINGBIRD_SCALE = 44 / 57; // hummingbird card is smaller than normal

// Egg cost per bird column (0-indexed): cols 1,2 = 1 egg; cols 3,4 = 2 eggs
const EGG_COSTS = [0, 0, 1, 1, 2, 2];

// Icons displayed at the end of each habitat row (4 each)
const ROW_END_ICONS: { type: "die" | "egg" | "card" }[] = [{ type: "die" }, { type: "egg" }, { type: "card" }];

const HABITATS = ["forest", "grassland", "wetland"] as const;
type Habitat = (typeof HABITATS)[number];

const COLUMN_ICON_COUNTS = [1, 2, 2, 2, 3];

const HABITAT_ICON: Record<Habitat, { src: string; alt: string; extra?: string }> = {
  forest: { src: iconUrl("die"), alt: "die" },
  grassland: { src: iconUrl("egg"), alt: "egg" },
  wetland: { src: birdBack, alt: "card", extra: "rounded-sm" },
};

const BirdSlot: React.FC<{
  habitat: Habitat;
  column: number;
  bird?: BirdCard;
  highlighted?: boolean;
  onSlotClick?: () => void;
}> = ({ habitat, column, bird, highlighted, onSlotClick }) => {
  const iconCount = COLUMN_ICON_COUNTS[column];
  const icon = HABITAT_ICON[habitat];
  const showReset = (habitat === "forest" || habitat === "wetland") && (column === 1 || column === 3);
  const showTrade = column === 0 || column === 2 || column === 3 || column === 4;
  const tradeCount = habitat === "grassland" && column === 3 ? 2 : 1;

  if (bird) {
    return (
      <div className="rounded-lg overflow-hidden" style={{ width: 147.7, height: 225.5 }}>
        <BirdCardDisplay bird={bird} cardHeight={225.5} />
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-lg border-2 bg-black/10 ${
        highlighted ? "border-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.6)] cursor-pointer" : "border-white/25"
      }`}
      style={{ aspectRatio: `${CARD_RATIO}` }}
      onClick={
        highlighted
          ? (e) => {
              e.stopPropagation();
              onSlotClick?.();
            }
          : undefined
      }
    >
      <img
        src={habitatUrl(`${habitat}-glow`)}
        alt={habitat}
        className="absolute left-1/2 -translate-x-1/2 w-[25%] drop-shadow"
        style={{ top: "15%" }}
      />
      {showReset && (
        <div className="absolute inset-x-0 flex items-center justify-center gap-1" style={{ top: "35%" }}>
          <img src={foodUrl("wild-glow")} alt="wild" className="h-4 drop-shadow" />
          <svg
            className="h-4 w-4 text-white drop-shadow"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="miter"
          >
            <path d="M1 7h11v-5l11 10-11 10v-5H1" />
          </svg>
          <div className="relative">
            {habitat === "wetland" ? (
              <img
                src={birdBack}
                alt="card"
                className="h-4 rounded-sm drop-shadow"
                style={{ aspectRatio: `${CARD_RATIO}` }}
              />
            ) : (
              <img src={iconUrl("die")} alt="die" className="h-4 drop-shadow" />
            )}
            <svg
              className="absolute inset-0 m-auto w-2.5 h-2.5 text-white drop-shadow rotate-90"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 4v6h6" />
              <path d="M1 10a11 11 0 1 1 2.18 8" />
            </svg>
          </div>
        </div>
      )}
      <div className="absolute inset-x-0 flex justify-center" style={{ top: "47%" }}>
        <div className="flex flex-wrap justify-center gap-2">
          {Array.from({ length: iconCount }, (_, i) => (
            <img key={i} src={icon.src} alt={icon.alt} className={`h-9 drop-shadow ${icon.extra ?? ""}`} />
          ))}
        </div>
      </div>
      {showTrade && (
        <>
          <div className="absolute inset-x-4" style={{ top: "70%" }}>
            <hr className="border-white/50 border-t-2" />
          </div>
          <div className="absolute inset-x-0 flex flex-col items-center justify-center gap-2" style={{ top: "75%" }}>
            {Array.from({ length: tradeCount }, (_, t) => (
              <div key={t} className="flex items-center justify-center gap-1">
                {habitat === "forest" && (
                  <>
                    <img
                      src={birdBack}
                      alt="card"
                      className="h-5 rounded-sm drop-shadow"
                      style={{ aspectRatio: `${CARD_RATIO}` }}
                    />
                    <svg
                      className="h-4 w-4 text-white drop-shadow"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinejoin="miter"
                    >
                      <path d="M1 7h11v-5l11 10-11 10v-5H1" />
                    </svg>
                    <img src={iconUrl("die")} alt="die" className="h-5 drop-shadow" />
                  </>
                )}
                {habitat === "grassland" && (
                  <>
                    <img
                      src={birdBack}
                      alt="card"
                      className="h-5 rounded-sm drop-shadow"
                      style={{ aspectRatio: `${CARD_RATIO}` }}
                    />
                    <svg
                      className="h-5 w-2 text-white -mx-0.5"
                      viewBox="0 0 8 20"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <line x1="7" y1="1" x2="1" y2="19" />
                    </svg>
                    <img src={foodUrl("wild-glow")} alt="wild" className="h-5 drop-shadow" />
                    <svg
                      className="h-4 w-4 text-white drop-shadow"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinejoin="miter"
                    >
                      <path d="M1 7h11v-5l11 10-11 10v-5H1" />
                    </svg>
                    <img src={iconUrl("egg")} alt="egg" className="h-5 drop-shadow" />
                  </>
                )}
                {habitat === "wetland" && (
                  <>
                    <img src={iconUrl("egg")} alt="egg" className="h-5 drop-shadow" />
                    <svg
                      className="h-5 w-2 text-white -mx-0.5"
                      viewBox="0 0 8 20"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <line x1="7" y1="1" x2="1" y2="19" />
                    </svg>
                    <img src={foodUrl("nectar")} alt="nectar" className="h-5 drop-shadow" />
                    <svg
                      className="h-4 w-4 text-white drop-shadow"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinejoin="miter"
                    >
                      <path d="M1 7h11v-5l11 10-11 10v-5H1" />
                    </svg>
                    <img
                      src={birdBack}
                      alt="card"
                      className="h-5 rounded-sm drop-shadow"
                      style={{ aspectRatio: `${CARD_RATIO}` }}
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

interface GameBoardProps {
  player: Player;
  placingBird?: BirdCard | null;
  onPlaceBird?: (habitat: HabitatType) => void;
  onCancelPlace?: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({ player, placingBird, onPlaceBird, onCancelPlace }) => {
  // Compute which habitats have a valid empty slot for the bird being placed
  const highlightedHabitats = new Set<HabitatType>();
  if (placingBird) {
    for (const h of HABITATS) {
      const key = (h.charAt(0).toUpperCase() + h.slice(1)) as "Forest" | "Grassland" | "Wetland";
      if (placingBird[key] && player.habitats[h].birds.length < 5) {
        highlightedHabitats.add(h);
      }
    }
  }

  return (
    <div
      className="relative rounded-xl overflow-hidden shadow-lg"
      style={{
        height: "720px",
        backgroundImage: `url(${boardBg})`,
        backgroundSize: "cover",
        backgroundPosition: "left center",
      }}
      onClick={placingBird ? onCancelPlace : undefined}
    >
      {/* Layout: unified grid with hummingbird + bird columns */}
      <div
        className="h-full grid gap-1 px-1 pb-1"
        style={{
          gridTemplateRows: `4% repeat(3, 31.5%)`,
          gridTemplateColumns: `auto repeat(${5}, auto) auto`,
        }}
      >
        {/* Egg cost header row */}
        {EGG_COSTS.map((count, col) =>
          count > 0 ? (
            <div className="w-full flex justify-center">
              <div
                key={`egg-${col}`}
                className="flex justify-center gap-0.5 -mt-0.5 pt-2 bg-black/10 rounded-b w-[50px]"
              >
                {Array.from({ length: count }, (_, i) => (
                  <img key={i} src={iconUrl("egg")} alt="egg" className="h-5 drop-shadow" />
                ))}
              </div>
            </div>
          ) : (
            <div />
          ),
        )}
        <div /> {/* empty cell in header for row-end column */}
        {Array.from({ length: 3 }, (_, row) => (
          <>
            {/* Hummingbird slot */}
            <div key={`hb-${row}`} className="flex items-start">
              <div
                className="rounded-lg border-2 border-white/25 bg-black/10"
                style={{
                  aspectRatio: `${CARD_RATIO}`,
                  height: `${HUMMINGBIRD_SCALE * 100}%`,
                }}
              />
            </div>
            {/* Bird slots */}
            {Array.from({ length: 5 }, (_, col) => {
              const h = HABITATS[row];
              const habitatBirds = player.habitats[h].birds;
              const bird = habitatBirds[col];
              const isFirstEmpty = !bird && col === habitatBirds.length;
              const highlighted = !!placingBird && isFirstEmpty && highlightedHabitats.has(h);
              return (
                <BirdSlot
                  key={`bird-${row}-${col}`}
                  habitat={h}
                  column={col}
                  bird={bird}
                  highlighted={highlighted}
                  onSlotClick={
                    highlighted
                      ? () => {
                          onPlaceBird?.(h);
                        }
                      : undefined
                  }
                />
              );
            })}
            {/* Row-end icons */}
            <div className="flex flex-col items-center justify-center gap-1">
              {Array.from({ length: 4 }, (_, i) => {
                const icon = ROW_END_ICONS[row];
                if (icon.type === "die") {
                  return <img key={i} src={iconUrl("die")} alt="die" className="h-6 drop-shadow" />;
                }
                if (icon.type === "egg") {
                  return <img key={i} src={iconUrl("egg")} alt="egg" className="h-6 drop-shadow" />;
                }
                return (
                  <img
                    key={i}
                    src={birdBack}
                    alt="card"
                    className="h-6 rounded-sm drop-shadow"
                    style={{ aspectRatio: `${CARD_RATIO}` }}
                  />
                );
              })}
            </div>
          </>
        ))}
      </div>
    </div>
  );
};
