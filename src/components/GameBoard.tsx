import boardBg from "../../assets/board-background.jpg";
import birdBack from "../../assets/cards/backgrounds/bird-background.jpg";
import { foodUrl, habitatUrl, hummingbirdUrl, iconUrl, powerBgUrl } from "../icons";
import {
  HABITAT_TYPES,
  type BirdCard,
  type FoodType,
  type HabitatType,
  type PlayedBirdCard,
  type Player,
} from "../types";
import { PlayedBirdCardDisplay } from "./PlayedBirdCardDisplay";

const CARD_RATIO = 0.655; // width / height
const HUMMINGBIRD_SCALE = 44 / 57; // hummingbird card is smaller than normal
const EGG_COSTS = [0, 0, 1, 1, 2, 2];
const ROW_END_ICONS: { type: "die" | "egg" | "card" }[] = [{ type: "die" }, { type: "egg" }, { type: "card" }];

const HABITAT_TITLES: Record<HabitatType, string> = {
  forest: "GAIN FOOD",
  grassland: "LAY EGGS",
  wetland: "DRAW CARDS",
};

const RightArrow: React.FC<{ className?: string }> = ({ className = "h-4 w-4 text-white drop-shadow" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinejoin="miter"
  >
    <path d="M1 7h11v-5l11 10-11 10v-5H1" />
  </svg>
);

const COLUMN_ICON_COUNTS = [1, 2, 2, 2, 3];

const HABITAT_ICON: Record<HabitatType, { src: string; alt: string; extra?: string }> = {
  forest: { src: iconUrl("die"), alt: "die" },
  grassland: { src: iconUrl("egg"), alt: "egg" },
  wetland: { src: birdBack, alt: "card", extra: "rounded-sm" },
};

const BirdSlot: React.FC<{
  habitat: HabitatType;
  column: number;
  bird?: PlayedBirdCard;
  highlighted?: boolean;
  onSlotClick?: () => void;
  onRemoveEgg?: () => void;
}> = ({ habitat, column, bird, highlighted, onSlotClick, onRemoveEgg }) => {
  const iconCount = COLUMN_ICON_COUNTS[column];
  const icon = HABITAT_ICON[habitat];
  const showReset = (habitat === "forest" || habitat === "wetland") && (column === 1 || column === 3);
  const showTrade = column === 0 || column === 2 || column === 3 || column === 4;
  const tradeCount = habitat === "grassland" && column === 3 ? 2 : 1;

  if (bird) {
    return (
      <PlayedBirdCardDisplay
        bird={bird}
        cardHeight={225.5}
        highlighted={highlighted}
        onSlotClick={onSlotClick}
        onRemoveEgg={onRemoveEgg}
      />
    );
  }

  return (
    <div
      className={`relative rounded-lg border-2 bg-black/10 ${
        highlighted ? "border-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.6)] cursor-pointer" : "border-white/40"
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
          <RightArrow />
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
                    <RightArrow />
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
                    <RightArrow />
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
                    <RightArrow />
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
  tuckingBird?: BirdCard | null;
  onTuckBird?: (habitat: HabitatType, birdIndex: number) => void;
  onCancelTuck?: () => void;
  layingEggs?: boolean;
  onLayEgg?: (habitat: HabitatType, birdIndex: number) => void;
  onRemoveEgg?: (habitat: HabitatType, birdIndex: number) => void;
  cachingFood?: FoodType | null;
  onCacheFood?: (habitat: HabitatType, birdIndex: number) => void;
  onCancelCache?: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  player,
  placingBird,
  onPlaceBird,
  onCancelPlace,
  tuckingBird,
  onTuckBird,
  onCancelTuck,
  layingEggs,
  onLayEgg,
  onRemoveEgg,
  cachingFood,
  onCacheFood,
  onCancelCache,
}) => {
  // Compute which habitats have a valid empty slot for the bird being placed
  const highlightedHabitats = new Set<HabitatType>();
  if (placingBird) {
    for (const h of HABITAT_TYPES) {
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
      onClick={placingBird ? onCancelPlace : tuckingBird ? onCancelTuck : cachingFood ? onCancelCache : undefined}
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
        {/* Play a Bird - first header cell */}
        <div className="flex items-center gap-2 px-1 pt-1">
          <img src={habitatUrl("play_a_bird")} alt="play a bird" className="h-5 drop-shadow" />
          <span
            className="text-white drop-shadow whitespace-nowrap"
            style={{ fontFamily: "CardenioModernBold, SiliciStrong, sans-serif", fontSize: "1.2rem" }}
          >
            PLAY A BIRD
          </span>
          <div className="flex items-center gap-1">
            <img src={foodUrl("wild-glow")} alt="wild" className="h-4 drop-shadow" />
            <img src={foodUrl("wild-glow")} alt="wild" className="h-4 drop-shadow" />
            <RightArrow className="h-3 w-3 text-white drop-shadow" />
            <img src={foodUrl("wild-glow")} alt="wild" className="h-4 drop-shadow" />
          </div>
        </div>
        {EGG_COSTS.slice(1).map((count, col) =>
          count > 0 ? (
            <div className="w-full flex justify-center">
              <div
                key={`egg-${col + 1}`}
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
            {/* Info + Hummingbird wrapper */}
            <div key={`infohb-${row}`} className="relative flex items-stretch">
              {/* Separator line */}
              <div
                className="absolute top-0 left-1 right-1 h-0.5 bg-white/40 rounded-full"
                style={{ transform: "translateY(-50%)" }}
              />
              {/* Brown powers background - positioned via the text span below */}
              {/* Habitat info */}
              <div className="flex flex-col items-center pt-2 gap-1 px-2">
                <img
                  src={habitatUrl(`${HABITAT_TYPES[row]}-glow`)}
                  alt={HABITAT_TYPES[row]}
                  className="w-10 drop-shadow"
                />
                <span
                  className="text-white text-center leading-tight drop-shadow"
                  style={{
                    fontFamily: "CardenioModernBold, SiliciStrong, sans-serif",
                    fontSize: "1.4rem",
                    maxWidth: "4.5rem",
                  }}
                >
                  {HABITAT_TITLES[HABITAT_TYPES[row]]}
                </span>
                <div className="relative flex items-center gap-1 rounded-md border-2 border-white/30 bg-white/15 px-1.5 py-1">
                  <div className="relative w-8 h-8 flex-shrink-0">
                    {player.habitats[HABITAT_TYPES[row]].spentNectar > 0 ? (
                      <>
                        <img
                          src={foodUrl("nectar")}
                          alt="nectar"
                          className="absolute inset-0 w-8 h-8 object-contain drop-shadow"
                        />
                        <span
                          className="absolute inset-0 flex items-center justify-center text-white font-bold drop-shadow"
                          style={{
                            fontFamily: "CardenioModernBold, SiliciStrong, sans-serif",
                            fontSize: "1.1rem",
                            textShadow: "0 0 4px rgba(0,0,0,0.8)",
                          }}
                        >
                          {player.habitats[HABITAT_TYPES[row]].spentNectar}
                        </span>
                      </>
                    ) : (
                      <img src={iconUrl("spent_nectar")} alt="spent nectar" className="w-8 drop-shadow" />
                    )}
                  </div>
                  <div
                    className="text-white/80 text-center leading-tight drop-shadow"
                    style={{
                      fontFamily: "CardenioModernBold, SiliciStrong, sans-serif",
                      fontSize: "0.5rem",
                    }}
                  >
                    GAME END:
                    <br />
                    <span className="inline-flex items-center">
                      5/2 <img src={iconUrl("point")} alt="pts" className="inline pr-0.5 h-2.5 brightness-0 invert" />{" "}
                      FOR
                    </span>
                    <br />
                    MAJORITY
                  </div>
                </div>
                <div className="relative">
                  <img
                    src={powerBgUrl("brown")}
                    alt=""
                    className="absolute -left-4 h-9 object-fill pointer-events-none min-w-[218px] max-w-[218px]"
                    style={{ top: "50%", transform: "translateY(-50%)", zIndex: 0 }}
                  />
                  <span
                    className="relative text-white/80 text-center leading-tight drop-shadow px-1.5 py-0.5 block"
                    style={{
                      fontFamily: "CardenioModernBold, SiliciStrong, sans-serif",
                      fontSize: "0.75rem",
                      zIndex: 2,
                    }}
                  >
                    THEN ACTIVATE
                    <br />
                    BROWN POWERS
                  </span>
                </div>
              </div>
              {/* Hummingbird slot */}
              <div className="flex flex-col items-center pt-1">
                <div
                  className="rounded-lg border-2 border-white/40 bg-black/10 z-10"
                  style={{
                    aspectRatio: `${CARD_RATIO}`,
                    height: `${HUMMINGBIRD_SCALE * 100}%`,
                  }}
                />
                <div className="flex items-center gap-1 mt-0.5">
                  <span
                    className="text-white/80 drop-shadow"
                    style={{
                      fontFamily: "CardenioModernBold, SiliciStrong, sans-serif",
                      fontSize: "0.7rem",
                    }}
                  >
                    THEN
                  </span>
                  <img
                    src={hummingbirdUrl("hummingbird")}
                    alt="hummingbird"
                    className="h-3 drop-shadow brightness-0 invert"
                  />
                </div>
              </div>
            </div>
            {/* Bird slots */}
            {Array.from({ length: 5 }, (_, col) => {
              const h = HABITAT_TYPES[row];
              const habitatBirds = player.habitats[h].birds;
              const bird = habitatBirds[col];
              const isFirstEmpty = !bird && col === habitatBirds.length;
              const highlightForPlace = !!placingBird && isFirstEmpty && highlightedHabitats.has(h);
              const highlightForTuck = !!tuckingBird && !!bird;
              const highlightForEgg = !!layingEggs && !!bird && bird.eggsLaid < bird["Egg limit"];
              const highlightForCache = !!cachingFood && !!bird;
              const highlighted = highlightForPlace || highlightForTuck || highlightForEgg || highlightForCache;
              return (
                <BirdSlot
                  key={`bird-${row}-${col}`}
                  habitat={h}
                  column={col}
                  bird={bird}
                  highlighted={highlighted}
                  onRemoveEgg={bird && bird.eggsLaid > 0 ? () => onRemoveEgg?.(h, col) : undefined}
                  onSlotClick={
                    highlightForPlace
                      ? () => {
                          onPlaceBird?.(h);
                        }
                      : highlightForTuck
                        ? () => {
                            onTuckBird?.(h, col);
                          }
                        : highlightForEgg
                          ? () => {
                              onLayEgg?.(h, col);
                            }
                          : highlightForCache
                            ? () => {
                                onCacheFood?.(h, col);
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
