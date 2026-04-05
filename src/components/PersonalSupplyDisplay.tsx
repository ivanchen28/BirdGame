import { useState } from "react";
import { foodUrl } from "../icons";
import { FoodTypes, type FoodType, type Player } from "../types";

const FOOD_DISPLAY_NAMES: Record<FoodType, string> = {
  invertebrate: "WORM",
  seed: "WHEAT",
  fruit: "BERRY",
  fish: "FISH",
  rodent: "RAT",
  nectar: "NECTAR",
};

interface PersonalSupplyProps {
  player: Player;
  onRemoveFood: (food: FoodType) => void;
  onStartCache: (food: FoodType) => void;
}

export const PersonalSupplyDisplay: React.FC<PersonalSupplyProps> = ({ player, onRemoveFood, onStartCache }) => {
  const [foodActionMenu, setFoodActionMenu] = useState<FoodType | null>(null);

  return (
    <div className="flex flex-col items-center gap-1 px-4 pb-2 shrink-0">
      <div
        className="flex flex-col gap-1 rounded-lg px-2.5 py-1.5 relative"
        style={{ background: "rgba(0,0,0,0.35)", border: "2px solid rgba(255,255,255,0.3)" }}
      >
        {FoodTypes.map((food) => (
          <div key={food} className="relative">
            <button
              className="flex items-center gap-2 w-full hover:bg-white/10 rounded px-1 py-0.5 transition-colors cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setFoodActionMenu(foodActionMenu === food ? null : food);
              }}
            >
              <img src={foodUrl(food)} alt={food} className="h-5 drop-shadow" />
              <span
                className="text-white/70 drop-shadow min-w-[2.5rem] text-left"
                style={{
                  fontFamily: "CardenioModernBold, SiliciStrong, sans-serif",
                  fontSize: "0.6rem",
                }}
              >
                {FOOD_DISPLAY_NAMES[food]}
              </span>
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
                className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 flex gap-1 rounded-lg px-2 py-1.5 shadow-lg"
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
                    onRemoveFood(food);
                  }}
                >
                  REMOVE
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
    </div>
  );
};
