import trackBg from "../../assets/hummingbird-track-background.png";
import { hummingbirdUrl } from "../icons";
import { HummingbirdGroups, type HummingbirdGroup, type Player } from "../types";

// Row indices are bottom-up: 0 = bottom (start row), 8 = top (10 pts)
const POINTS_BY_ROW = [-3, 0, 1, 2, 3, 4, 6, 8, 10];
const START_LETTERS = ["S", "T", "A", "R", "T"];

// Pattern N places hummingbird silhouettes at rows N and N+4 (bottom-up)
function hasSilhouette(pattern: number, row: number): boolean {
  return row === pattern || row === pattern + 4;
}

interface HummingbirdTrackProps {
  player: Player;
  onMove?: (group: HummingbirdGroup, delta: number) => void;
}

export const HummingbirdTrack: React.FC<HummingbirdTrackProps> = ({ player, onMove }) => {
  const { hummingbirdTrackPattern, hummingbirdTrack } = player;

  const handleClick = (group: HummingbirdGroup, e: React.MouseEvent) => {
    if (!onMove) return;
    const pos = hummingbirdTrack[group];
    const delta = e.shiftKey ? -1 : 1;
    const next = pos + delta;
    if (next < 0 || next > 8) return;
    onMove(group, delta);
  };

  return (
    <div className="inline-flex flex-col rounded-lg border border-gray-400 bg-gray-200 p-1">
      <div className="flex">
        {/* Hummingbird grid with background */}
        <div
          className="grid rounded-md overflow-hidden"
          style={{
            gridTemplateColumns: `repeat(5, 2rem)`,
            gridTemplateRows: `repeat(9, 2rem)`,
            backgroundImage: `url(${trackBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Render top-to-bottom: row 8 (top) down to row 0 (bottom) */}
          {Array.from({ length: 9 }, (_, i) => 8 - i).map((row) =>
            HummingbirdGroups.map((group, colIdx) => {
              const iconHere = hummingbirdTrack[group] === row;
              const silhouette = hasSilhouette(hummingbirdTrackPattern[colIdx], row);
              const isStartRow = row === 0;
              return (
                <div
                  key={`${row}-${group}`}
                  className={`relative flex h-8 w-8 items-center justify-center border border-gray-200/50${iconHere ? " cursor-pointer" : ""}`}
                  onClick={iconHere ? (e) => handleClick(group, e) : undefined}
                >
                  {/* START letter shown in row 0 only when the icon has moved away */}
                  {isStartRow && !iconHere && (
                    <span
                      className="text-[0.75rem] font-bold"
                      style={{ fontFamily: "CardenioModernBold, SiliciStrong, sans-serif", color: "#4a4139" }}
                    >
                      {START_LETTERS[colIdx]}
                    </span>
                  )}
                  {/* Hummingbird silhouettes */}
                  {!isStartRow && silhouette && (
                    <img src={hummingbirdUrl("hummingbird")} alt="hummingbird" className="h-5 opacity-70" />
                  )}
                  {/* Type icon at its current position, layered on top */}
                  {iconHere && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img src={hummingbirdUrl(group)} alt={group} className="h-5" />
                    </div>
                  )}
                </div>
              );
            }),
          )}
        </div>

        {/* Points column */}
        <div className="flex flex-col">
          {Array.from({ length: 9 }, (_, i) => 8 - i).map((row) => (
            <div
              key={row}
              className="flex h-8 w-4 items-center justify-center text-xs font-bold"
              style={{ fontFamily: "CardenioModernBold, SiliciStrong, sans-serif", color: "#4a4139" }}
            >
              {POINTS_BY_ROW[row]}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
