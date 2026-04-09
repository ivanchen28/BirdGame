import boardBg from "../../assets/board-background.jpg";
import birdBack from "../../assets/cards/backgrounds/bird-background.jpg";
import { getBird, getHummingbird, resolvePlayedBird } from "../cardLookup";
import { foodUrl, habitatUrl, hummingbirdUrl, iconUrl, powerBgUrl } from "../icons";
import { HabitatTypes, type FoodType, type HabitatType, type PlayedBirdCard, type Player } from "../types";
import { ActionCube } from "./ActionCube";
import { CardWithDiscard } from "./CardWithDiscard";
import { HummingbirdCardDisplay } from "./HummingbirdCardDisplay";
import { PersonalSupplyDisplay } from "./PersonalSupplyDisplay";
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
  onViewTucked?: () => void;
  onMigrate?: () => void;
  onReturnToHand?: () => void;
  onDiscardPlayed?: () => void;
  actionCube?: { color: string };
  onCubeClick?: (e: React.MouseEvent) => void;
}> = ({
  habitat,
  column,
  bird,
  highlighted,
  onSlotClick,
  onRemoveEgg,
  onViewTucked,
  onMigrate,
  onReturnToHand,
  onDiscardPlayed,
  actionCube,
  onCubeClick,
}) => {
  const iconCount = COLUMN_ICON_COUNTS[column];
  const icon = HABITAT_ICON[habitat];
  const showReset = (habitat === "forest" || habitat === "wetland") && (column === 1 || column === 3);
  const showTrade = column === 0 || column === 2 || column === 3 || column === 4;
  const tradeCount = habitat === "grassland" && column === 3 ? 2 : 1;

  const cubeOverlay = actionCube && (
    <div
      className="absolute top-1 right-1 cursor-pointer"
      style={{ zIndex: 50 }}
      onClick={(e) => {
        e.stopPropagation();
        onCubeClick?.(e);
      }}
    >
      <ActionCube color={actionCube.color} size={48} />
    </div>
  );

  if (bird) {
    return (
      <div className="relative">
        <PlayedBirdCardDisplay
          bird={bird}
          cardHeight={225.5}
          highlighted={highlighted}
          onSlotClick={onSlotClick}
          onRemoveEgg={onRemoveEgg}
          onViewTucked={onViewTucked}
          onMigrate={onMigrate}
          onReturnToHand={onReturnToHand}
          onDiscardPlayed={onDiscardPlayed}
        />
        {cubeOverlay}
      </div>
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
      {cubeOverlay}
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
  placingBird?: number | null;
  onPlaceBird?: (habitat: HabitatType) => void;
  tuckingBird?: number | null;
  onTuckBird?: (habitat: HabitatType, birdIndex: number) => void;
  layingEggs?: boolean;
  onLayEgg?: (habitat: HabitatType, birdIndex: number) => void;
  onRemoveEgg?: (habitat: HabitatType, birdIndex: number) => void;
  cachingFood?: FoodType | null;
  onCacheFood?: (habitat: HabitatType, birdIndex: number) => void;
  onViewTucked?: (habitat: HabitatType, birdIndex: number) => void;
  onMigrate?: (habitat: HabitatType, birdIndex: number) => void;
  onReturnToHand?: (habitat: HabitatType, birdIndex: number) => void;
  onDiscardPlayed?: (habitat: HabitatType, birdIndex: number) => void;
  migratingBird?: { habitat: HabitatType; birdIndex: number } | null;
  onCompleteMigrate?: (targetHabitat: HabitatType) => void;
  placingHummingbird?: number | null;
  onPlaceHummingbird?: (habitat: HabitatType) => void;
  onDiscardHummingbird?: (habitat: HabitatType) => void;
  onNectarChange?: (habitat: HabitatType, delta: number) => void;
  onUseFood: (food: FoodType) => void;
  onStartCache: (food: FoodType) => void;
  placingCube?: boolean;
  onPlaceCubeToggle?: () => void;
  onPlaceCube?: (habitat: HabitatType | "playABird") => void;
  onCubeClick?: (habitat: HabitatType, e: React.MouseEvent) => void;
  onReturnUsedCube?: (habitat: HabitatType | "playABird") => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  player,
  placingBird,
  onPlaceBird,
  tuckingBird,
  onTuckBird,
  layingEggs,
  onLayEgg,
  onRemoveEgg,
  cachingFood,
  onCacheFood,
  onViewTucked,
  onMigrate,
  onReturnToHand,
  onDiscardPlayed,
  migratingBird,
  onCompleteMigrate,
  placingHummingbird,
  onPlaceHummingbird,
  onDiscardHummingbird,
  onNectarChange,
  onUseFood,
  onStartCache,
  placingCube,
  onPlaceCubeToggle,
  onPlaceCube,
  onCubeClick,
  onReturnUsedCube,
}) => {
  // Compute which habitats have a valid empty slot for the bird being placed
  const resolvedPlacingBird = placingBird != null ? getBird(placingBird) : null;
  const highlightedHabitats = new Set<HabitatType>();
  if (resolvedPlacingBird) {
    for (const h of HabitatTypes) {
      const key = (h.charAt(0).toUpperCase() + h.slice(1)) as "Forest" | "Grassland" | "Wetland";
      if (resolvedPlacingBird[key] && player.habitats[h].birds.length < 5) {
        highlightedHabitats.add(h);
      }
    }
  }

  return (
    <div className="flex flex-col gap-1">
      {/* Header: player name + personal supply */}
      <div className="flex items-center justify-between pl-2">
        <span
          className="font-bold drop-shadow"
          style={{
            fontFamily: "CardenioModernBold, SiliciStrong, sans-serif",
            fontSize: "2rem",
            color: player.cubeColor,
          }}
        >
          {player.name}
        </span>
        <PersonalSupplyDisplay
          player={player}
          onUseFood={onUseFood}
          onStartCache={onStartCache}
          placingCube={placingCube}
          onPlaceCubeToggle={onPlaceCubeToggle}
        />
      </div>
      <div
        className="relative rounded-xl overflow-hidden shadow-lg"
        style={{
          height: "720px",
          minWidth: "1020px",
          backgroundImage: `url(${boardBg})`,
          backgroundSize: "cover",
          backgroundPosition: "left center",
        }}
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
            {player.playABirdCubes > 0 && (
              <div className="flex items-center gap-1">
                {Array.from({ length: player.playABirdCubes }, (_, i) => (
                  <button
                    key={i}
                    className="cursor-pointer hover:brightness-125 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      onReturnUsedCube?.("playABird");
                    }}
                  >
                    <ActionCube color={player.cubeColor} size={20} />
                  </button>
                ))}
              </div>
            )}
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
                {/* Habitat info */}
                <div
                  className="flex flex-col items-center pt-2 gap-1 px-2 overflow-visible"
                  style={{ width: "6.5rem", minWidth: "6.5rem" }}
                >
                  <img
                    src={habitatUrl(`${HabitatTypes[row]}-glow`)}
                    alt={HabitatTypes[row]}
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
                    {HABITAT_TITLES[HabitatTypes[row]]}
                  </span>
                  <div
                    className="relative grid grid-cols-[2rem_1fr] items-center gap-1 rounded-md border-2 border-white/30 px-1.5 py-1 cursor-pointer transition-colors hover:bg-white/40 bg-white/15"
                    style={{ width: "5.5rem", height: "2.75rem" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onNectarChange?.(HabitatTypes[row], e.shiftKey ? -1 : 1);
                    }}
                  >
                    <div className="relative w-8 h-8 flex-shrink-0">
                      {player.habitats[HabitatTypes[row]].spentNectar > 0 ? (
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
                            {player.habitats[HabitatTypes[row]].spentNectar}
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
                      className="absolute -left-5 h-9 object-fill pointer-events-none min-w-[225px] max-w-[225px]"
                      style={{ top: "53%", transform: "translateY(-50%)", zIndex: 0 }}
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
                  {/* Used action cubes */}
                  {player.habitats[HabitatTypes[row]].actionCubes > 0 && (
                    <div
                      className="flex items-center gap-1 self-start pl-1"
                      style={{ position: "relative", zIndex: 5 }}
                    >
                      {Array.from({ length: player.habitats[HabitatTypes[row]].actionCubes }, (_, i) => (
                        <button
                          key={i}
                          className="cursor-pointer hover:brightness-125 transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            onReturnUsedCube?.(HabitatTypes[row]);
                          }}
                        >
                          <ActionCube color={player.cubeColor} size={24} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {/* Hummingbird slot */}
                <div
                  className="flex flex-col items-center pt-1"
                  style={{ width: 720 * 0.315 * HUMMINGBIRD_SCALE * CARD_RATIO }}
                >
                  {(() => {
                    const h = HabitatTypes[row];
                    const hbId = player.habitats[h].hummingbird;
                    const isOpen = hbId == null && !!placingHummingbird;

                    if (hbId != null) {
                      const hbCard = getHummingbird(hbId);
                      const slotHeight = 720 * 0.315 * HUMMINGBIRD_SCALE;
                      const slotWidth = slotHeight * CARD_RATIO;
                      return (
                        <CardWithDiscard
                          width={slotWidth}
                          height={slotHeight}
                          onDiscard={() => onDiscardHummingbird?.(h)}
                        >
                          <HummingbirdCardDisplay card={hbCard} cardHeight={slotHeight} />
                        </CardWithDiscard>
                      );
                    }

                    return (
                      <div
                        className={`rounded-lg border-2 z-10 ${
                          isOpen
                            ? "border-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.6)] cursor-pointer bg-black/20"
                            : "border-white/40 bg-black/10"
                        }`}
                        style={{
                          aspectRatio: `${CARD_RATIO}`,
                          height: `${HUMMINGBIRD_SCALE * 100}%`,
                        }}
                        onClick={
                          isOpen
                            ? (e) => {
                                e.stopPropagation();
                                onPlaceHummingbird?.(h);
                              }
                            : undefined
                        }
                      />
                    );
                  })()}
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
                const h = HabitatTypes[row];
                const habitatBirds = player.habitats[h].birds;
                const birdState = habitatBirds[col];
                const bird: PlayedBirdCard | undefined = birdState ? resolvePlayedBird(birdState) : undefined;
                const isFirstEmpty = !birdState && col === habitatBirds.length;
                const highlightForPlace = !!placingBird && isFirstEmpty && highlightedHabitats.has(h);
                const highlightForTuck = !!tuckingBird && !!birdState;
                const highlightForEgg = !!layingEggs && !!birdState;
                const highlightForCache = !!cachingFood && !!birdState;
                const highlightForMigrate =
                  !!migratingBird &&
                  migratingBird.habitat !== h &&
                  isFirstEmpty &&
                  habitatBirds.length < 5 &&
                  (() => {
                    const mbState = player.habitats[migratingBird.habitat].birds[migratingBird.birdIndex];
                    if (!mbState) return false;
                    const mbBird = getBird(mbState.id);
                    const key = (h.charAt(0).toUpperCase() + h.slice(1)) as "Forest" | "Grassland" | "Wetland";
                    return mbBird[key];
                  })();
                const highlighted =
                  highlightForPlace || highlightForTuck || highlightForEgg || highlightForCache || highlightForMigrate;
                // Show action cube on the slot indicated by activeCube (1-5 for bird slots)
                const activeCubeSlot = player.habitats[h].activeCube;
                const showCube = activeCubeSlot !== undefined && activeCubeSlot === col + 1;
                return (
                  <BirdSlot
                    key={`bird-${row}-${col}`}
                    habitat={h}
                    column={col}
                    bird={bird}
                    highlighted={highlighted}
                    actionCube={showCube ? { color: player.cubeColor } : undefined}
                    onCubeClick={showCube ? (e) => onCubeClick?.(h, e) : undefined}
                    onRemoveEgg={bird && bird.eggsLaid > 0 ? () => onRemoveEgg?.(h, col) : undefined}
                    onViewTucked={bird && bird.tuckedCards.length > 0 ? () => onViewTucked?.(h, col) : undefined}
                    onMigrate={bird ? () => onMigrate?.(h, col) : undefined}
                    onReturnToHand={bird ? () => onReturnToHand?.(h, col) : undefined}
                    onDiscardPlayed={bird ? () => onDiscardPlayed?.(h, col) : undefined}
                    onSlotClick={
                      highlightForPlace
                        ? () => {
                            onPlaceBird?.(h);
                          }
                        : highlightForMigrate
                          ? () => {
                              onCompleteMigrate?.(h);
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
              <div className="relative flex flex-col items-center justify-center gap-1">
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
                {(() => {
                  const h = HabitatTypes[row];
                  const habitatData = player.habitats[h];
                  if (habitatData.activeCube === 6) {
                    return (
                      <div
                        className="absolute top-2 left-1/2 -translate-x-1/2 cursor-pointer"
                        style={{ zIndex: 50 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onCubeClick?.(h, e);
                        }}
                      >
                        <ActionCube color={player.cubeColor} size={28} />
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </>
          ))}
          {/* Action cube placement overlays — highlight entire habitat row */}
          {placingCube && (
            <>
              {/* Play a Bird header overlay */}
              <div
                className="absolute rounded-lg border-2 border-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.6)] bg-yellow-400/10 cursor-pointer transition-colors hover:bg-yellow-400/20"
                style={{
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "4%",
                  zIndex: 20,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onPlaceCube?.("playABird");
                }}
              />
              {HabitatTypes.map((h, row) => (
                <div
                  key={`cube-overlay-${h}`}
                  className="absolute rounded-lg border-2 border-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.6)] bg-yellow-400/10 cursor-pointer transition-colors hover:bg-yellow-400/20"
                  style={{
                    top: `calc(4% + ${row} * 31.5%)`,
                    left: 0,
                    right: 0,
                    height: "31.5%",
                    zIndex: 20,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlaceCube?.(h);
                  }}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
