import { CubeIcon } from "@heroicons/react/24/solid";
import { useEffect, useRef, useState } from "react";
import { foodUrl } from "../icons";
import { FoodTypes, type FoodType, type Player } from "../types";

interface PersonalSupplyProps {
  player: Player;
  onUseFood: (food: FoodType) => void;
  onStartCache: (food: FoodType) => void;
}

export const PersonalSupplyDisplay: React.FC<PersonalSupplyProps> = ({ player, onUseFood, onStartCache }) => {
  const [foodActionMenu, setFoodActionMenu] = useState<FoodType | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!foodActionMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFoodActionMenu(null);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [foodActionMenu]);

  return (
    <div
      ref={containerRef}
      className="flex items-center gap-3 rounded-lg px-3 py-1.5"
      style={{ background: "rgba(0,0,0,0.35)", border: "2px solid rgba(255,255,255,0.3)" }}
    >
      {/* Action cubes */}
      <div className="flex items-center gap-1">
        <CubeIcon className="h-5 w-5 drop-shadow" style={{ color: player.cubeColor }} />
        <span
          className="text-white font-bold drop-shadow"
          style={{
            fontFamily: "CardenioModernBold, SiliciStrong, sans-serif",
            fontSize: "0.9rem",
          }}
        >
          {player.actionCubes}
        </span>
      </div>

      <div className="w-px h-5 bg-white/20" />

      {/* Food items */}
      {FoodTypes.map((food) => (
        <div key={food} className="relative">
          <button
            className="flex items-center gap-1 hover:bg-white/10 rounded px-1 py-0.5 transition-colors cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setFoodActionMenu(foodActionMenu === food ? null : food);
            }}
          >
            <img src={foodUrl(food)} alt={food} className="h-5 drop-shadow" />
            <span
              className="text-white font-bold drop-shadow min-w-[1rem] text-center"
              style={{
                fontFamily: "CardenioModernBold, SiliciStrong, sans-serif",
                fontSize: "0.9rem",
              }}
            >
              {player.food[food]}
            </span>
          </button>
          {/* Action popup */}
          {foodActionMenu === food && player.food[food] > 0 && (
            <div
              className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 flex gap-1 rounded-lg px-2 py-1.5 shadow-lg"
              style={{ background: "rgba(0,0,0,0.85)", border: "1px solid rgba(255,255,255,0.3)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="text-white/90 hover:text-red-400 px-2 py-1 rounded hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap"
                style={{
                  fontFamily: "CardenioModernBold, SiliciStrong, sans-serif",
                  fontSize: "0.65rem",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onUseFood(food);
                }}
              >
                USE
              </button>
              <div className="w-px bg-white/20" />
              <button
                className="text-white/90 hover:text-yellow-400 px-2 py-1 rounded hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap"
                style={{
                  fontFamily: "CardenioModernBold, SiliciStrong, sans-serif",
                  fontSize: "0.65rem",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onStartCache(food);
                  setFoodActionMenu(null);
                }}
              >
                CACHE
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
