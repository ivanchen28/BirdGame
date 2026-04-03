import type { DieFace } from "../types";

function iconUrl(name: string): string {
  return new URL(`../../assets/icons/food/${name}.png`, import.meta.url).href;
}

const FACE_ICONS: Record<DieFace, string[]> = {
  invertebrate: ["invertebrate"],
  seed: ["seed"],
  fish: ["fish"],
  rodent: ["rodent"],
  fruit: ["fruit"],
  invertebrateSeed: ["invertebrate", "seed"],
  seedNectar: ["seed", "nectar"],
  fruitNectar: ["fruit", "nectar"],
};

interface DieDisplayProps {
  face: DieFace;
  size?: number;
  onClick?: () => void;
  className?: string;
}

export function DieDisplay({ face, size = 48, onClick, className = "" }: DieDisplayProps) {
  const icons = FACE_ICONS[face];
  const isDual = icons.length > 1;
  const iconSize = isDual ? size * 0.4 : size * 0.65;

  return (
    <div
      onClick={onClick}
      className={`relative ${onClick ? "cursor-pointer hover:brightness-105 active:scale-95" : ""} ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.18,
        background: "#f5f0eb",
        border: "1.5px solid #c4b9ad",
        boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
        transition: "transform 0.1s",
        overflow: "hidden",
      }}
    >
      {isDual ? (
        <>
          {/* Top-left icon */}
          <img
            src={iconUrl(icons[0])}
            alt={icons[0]}
            style={{
              position: "absolute",
              top: size * 0.08,
              left: size * 0.08,
              width: iconSize,
              height: iconSize,
              filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.15))",
            }}
            draggable={false}
          />
          {/* Diagonal line */}
          <svg style={{ position: "absolute", inset: 0 }} width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <line
              x1={size * 0.15}
              y1={size * 0.85}
              x2={size * 0.85}
              y2={size * 0.15}
              stroke="#c4b9ad"
              strokeWidth={1.5}
            />
          </svg>
          {/* Bottom-right icon */}
          <img
            src={iconUrl(icons[1])}
            alt={icons[1]}
            style={{
              position: "absolute",
              bottom: size * 0.08,
              right: size * 0.08,
              width: iconSize,
              height: iconSize,
              filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.15))",
            }}
            draggable={false}
          />
        </>
      ) : (
        <div className="flex items-center justify-center" style={{ width: "100%", height: "100%" }}>
          <img
            src={iconUrl(icons[0])}
            alt={icons[0]}
            style={{
              width: iconSize,
              height: iconSize,
              filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.15))",
            }}
            draggable={false}
          />
        </div>
      )}
    </div>
  );
}
