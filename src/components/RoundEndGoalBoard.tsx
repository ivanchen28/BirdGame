import { ArrowPathIcon } from "@heroicons/react/24/solid";
import { iconUrl } from "../icons";
import type { RoundEndGoalBoardState } from "../types";
import { ActionCube } from "./ActionCube";
import { RoundEndGoalDisplay } from "./RoundEndGoalDisplay";

const ROUNDS = ["Round 1", "Round 2", "Round 3", "Round 4"] as const;
const PLACEMENTS = ["1st place", "2nd place", "3rd place", ""] as const;
const POINTS = [
  [4, 1, 0, 0],
  [5, 2, 1, 0],
  [6, 3, 2, 0],
  [7, 4, 3, 0],
];

interface RoundEndGoalBoardProps {
  state: RoundEndGoalBoardState;
  onReroll?: () => void;
  placingCube?: boolean;
  onPlaceCube?: (round: number, placement: number) => void;
  onRemoveCube?: (round: number, placement: number, cubeIndex: number) => void;
}

export const RoundEndGoalBoard: React.FC<RoundEndGoalBoardProps> = ({
  state,
  onReroll,
  placingCube,
  onPlaceCube,
  onRemoveCube,
}) => {
  const boxSize = 48;

  return (
    <div className="relative bg-white border-2 border-gray-300 rounded-xl flex flex-col items-center justify-start p-2 gap-2 h-fit w-fit">
      <button
        onClick={onReroll}
        className="absolute top-1.5 right-1.5 p-1 rounded-md cursor-pointer transition-colors hover:bg-gray-200"
        style={{
          background: "rgba(0,0,0,0.08)",
          border: "1px solid rgba(0,0,0,0.15)",
        }}
      >
        <ArrowPathIcon className="h-4 w-4 text-gray-500" />
      </button>
      <h3
        className="text-gray-600 font-bold tracking-wide"
        style={{ fontFamily: "CardenioModernBold, SiliciStrong, sans-serif", fontSize: "1rem" }}
      >
        END OF ROUND GOALS
      </h3>
      <div className="flex gap-2">
        {ROUNDS.map((label, colIdx) => (
          <div key={label} className="flex flex-col items-center gap-0.5">
            <span
              className="text-gray-600 text-center leading-tight"
              style={{ fontFamily: "CardenioModernBold, SiliciStrong, sans-serif", fontSize: "0.75rem" }}
            >
              {label}
            </span>
            {state.goals[colIdx] ? (
              <RoundEndGoalDisplay goal={state.goals[colIdx]} size={boxSize} />
            ) : (
              <div
                className="border-2 border-gray-400 bg-gray-50"
                style={{ width: boxSize + 4, height: boxSize + 4 }}
              />
            )}

            <span
              className="text-gray-600 text-center leading-tight mt-2"
              style={{ fontFamily: "CardenioModernBold, SiliciStrong, sans-serif", fontSize: "0.7rem" }}
            >
              MOST
            </span>
            <div className="relative flex flex-col border-2 border-gray-400 overflow-hidden">
              <img
                src="/assets/powers/green_rotated.png"
                alt=""
                className="absolute pointer-events-none"
                style={{
                  top: "55%",
                  left: "70%",
                  height: `${boxSize * 4}px`,
                  width: `${boxSize}px`,
                  transform: "translate(-55%, -45%)",
                  objectFit: "fill",
                  scale: "1.3",
                }}
              />
              {PLACEMENTS.map((place, rowIdx) => {
                const spot = state.spots[colIdx]?.[rowIdx];
                const cubes = spot?.cubeColors ?? [];
                return (
                  <div
                    key={rowIdx}
                    className={`relative flex flex-col items-center justify-center ${rowIdx > 0 ? "border-t border-gray-400" : ""} ${
                      placingCube ? "cursor-pointer hover:bg-yellow-100/50 transition-colors" : ""
                    }`}
                    style={{ width: boxSize, height: boxSize }}
                    onClick={
                      placingCube
                        ? (e) => {
                            e.stopPropagation();
                            onPlaceCube?.(colIdx, rowIdx);
                          }
                        : undefined
                    }
                  >
                    <div className="flex items-center gap-0.5">
                      <span
                        className="text-gray-500 leading-none"
                        style={{ fontFamily: "CardenioModernBold, SiliciStrong, sans-serif", fontSize: "0.85rem" }}
                      >
                        {POINTS[colIdx][rowIdx]}
                      </span>
                      <img src={iconUrl("point")} alt="pt" className="h-3 brightness-75" />
                    </div>
                    {place && (
                      <span
                        className="text-white leading-none drop-shadow"
                        style={{ fontFamily: "CardenioModernBold, SiliciStrong, sans-serif", fontSize: "0.55rem" }}
                      >
                        {place}
                      </span>
                    )}
                    {cubes.length > 0 && (
                      <div className="absolute bottom-0.5 right-0.5 flex gap-px">
                        {cubes.map((color, ci) => (
                          <button
                            key={ci}
                            className="cursor-pointer hover:brightness-125 transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveCube?.(colIdx, rowIdx, ci);
                            }}
                          >
                            <ActionCube color={color} size={18} />
                          </button>
                        ))}
                      </div>
                    )}
                    {placingCube && (
                      <div className="absolute inset-0 rounded border-2 border-yellow-400/60" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};