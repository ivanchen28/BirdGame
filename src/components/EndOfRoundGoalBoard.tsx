import { iconUrl } from "../icons";

const ROUNDS = ["Round 1", "Round 2", "Round 3", "Round 4"] as const;
const PLACEMENTS = ["1st place", "2nd place", "3rd place", ""] as const;
const POINTS = [
  [4, 1, 0, 0],
  [5, 2, 1, 0],
  [6, 3, 2, 0],
  [7, 4, 3, 0],
];

export const EndOfRoundGoalBoard: React.FC = () => {
  const boxSize = 48;

  return (
    <div className="bg-white border-2 border-gray-300 rounded-xl flex flex-col items-center justify-start p-2 gap-2 h-fit w-fit">
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
            <div className="border-2 border-gray-400 bg-gray-50" style={{ width: boxSize + 4, height: boxSize + 4 }} />

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
              {PLACEMENTS.map((place, rowIdx) => (
                <div
                  key={rowIdx}
                  className={`relative flex flex-col items-center justify-center ${rowIdx > 0 ? "border-t border-gray-400" : ""}`}
                  style={{ width: boxSize, height: boxSize }}
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
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
