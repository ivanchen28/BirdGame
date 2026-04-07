import { useMemo } from "react";
import { resolveIconUrl } from "../icons";
import type { RoundEndGoal } from "../types";

function Iconize({ text, className, style }: { text: string; className?: string; style?: React.CSSProperties }) {
  const cls = className ?? "inline h-[1em] align-middle";
  return (
    <>
      {text.split(/(\[[^\]]+\])/).map((part, i) => {
        const match = part.match(/^\[([^\]]+)\]$/);
        if (match) {
          return <img key={i} src={resolveIconUrl(match[1])} alt={match[1]} className={cls} style={style} />;
        }
        return part ? <span key={i}>{part}</span> : null;
      })}
    </>
  );
}

interface RoundEndGoalDisplayProps {
  goal: RoundEndGoal;
  size: number;
}

export function RoundEndGoalDisplay({ goal, size }: RoundEndGoalDisplayProps) {
  const fontSize = useMemo(() => {
    const charCount = goal.Goal.replace(/\[.*?\]/g, "X").length;
    if (charCount <= 7) return size * 0.27;
    if (charCount <= 14) return size * 0.22;
    return size * 0.175;
  }, [goal.Goal, size]);

  const iconSize = `${fontSize * 1.2}px`;

  return (
    <div
      className="border-2 border-gray-400 bg-gray-50 flex items-center justify-center text-center p-0.5 overflow-hidden"
      style={{ width: size + 4, height: size + 4 }}
    >
      <span
        className="text-gray-600 leading-tight"
        style={{ fontFamily: "CardenioModernBold, SiliciStrong, sans-serif", fontSize }}
      >
        <Iconize text={goal.Goal} className={`inline align-middle`} style={{ height: iconSize }} />
      </span>
    </div>
  );
}
