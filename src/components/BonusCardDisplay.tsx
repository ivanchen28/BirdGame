import { useMemo } from "react";
import { resolveIconUrl } from "../icons";
import type { BonusCard } from "../types";

const CARD_HEIGHT = 460;
const CARD_RATIO = 1 / 1.526; // bonus cards are taller than wide

/** Renders text containing [icon_name] tokens as inline icon images */
function Iconize({ text, className }: { text: string; className?: string }) {
  const cls = className ?? "inline h-[1em] align-middle";
  return (
    <>
      {text.split(/(\[[^\]]+\])/).map((part, i) => {
        const match = part.match(/^\[([^\]]+)\]$/);
        if (match) {
          return <img key={i} src={resolveIconUrl(match[1])} alt={match[1]} className={cls} />;
        }
        return part ? <span key={i}>{part}</span> : null;
      })}
    </>
  );
}

/** Parse VP string like "2 to 3 birds: 3[point]; 4+ birds: 7[point]" into structured conditions */
function parsePointConditions(vp: string | null): { value: string; point: boolean }[][] {
  if (!vp) return [];
  return vp.split(";").reduce<{ value: string; point: boolean }[][]>((acc, condition) => {
    const match = condition.match(/[0-9]+\[point\]/);
    if (!match) return [...acc, [{ value: condition, point: false }]];
    if (!match.index)
      return [
        ...acc,
        [
          { value: match[0], point: true },
          { value: condition.slice(match[0].length), point: false },
        ],
      ];
    return [
      ...acc,
      [
        { value: condition.slice(0, match.index), point: false },
        { value: match[0], point: true },
      ],
    ];
  }, []);
}

interface BonusCardDisplayProps {
  card: BonusCard;
  cardHeight?: number;
}

export function BonusCardDisplay({ card, cardHeight = CARD_HEIGHT }: BonusCardDisplayProps) {
  const cardWidth = cardHeight * CARD_RATIO;

  const conditions = useMemo(() => parsePointConditions(card.VP), [card.VP]);

  const descriptionFontSize = useMemo(() => {
    const charCount = card.Condition.replace(/\[.*?\]/g, "1").length;
    return cardHeight * (charCount <= 100 ? 0.052 : 0.045);
  }, [card, cardHeight]);

  return (
    <div
      className="relative bg-[#f5f6f1] rounded-lg overflow-hidden shadow-xl flex flex-col"
      style={{ width: cardWidth, height: cardHeight }}
    >
      {/* ── Title ── */}
      <div
        className="flex justify-center items-center text-center uppercase"
        style={{
          margin: "4%",
          padding: "1%",
          height: "14%",
          backgroundColor: "#cee4e6",
          borderStyle: "double",
          borderWidth: 3,
          fontFamily: "Pangolin, sans-serif",
          color: "#666666",
          fontSize: cardHeight * 0.056,
          lineHeight: `${cardHeight * 0.056 + 2}px`,
        }}
      >
        <Iconize text={card["Bonus card"]} />
      </div>

      {/* ── Description (Condition) ── */}
      <div
        className="text-center"
        style={{
          minHeight: "14%",
          margin: "7%",
          marginBottom: "2%",
          fontFamily: "Jost, sans-serif",
          fontWeight: 300,
          fontSize: descriptionFontSize,
          lineHeight: `${descriptionFontSize + 1}px`,
        }}
      >
        <Iconize text={card.Condition} />
      </div>

      {/* ── Points ── */}
      {conditions.length > 0 && (
        <div
          className="flex justify-around flex-wrap"
          style={{
            margin: "0 10%",
            fontFamily: "CardenioModernBold, SiliciStrong, sans-serif",
            color: "#666666",
            fontSize: cardHeight * 0.05,
            lineHeight: `${cardHeight * 0.05 + 2}px`,
          }}
        >
          {conditions.map((condition, ci) => (
            <div
              key={ci}
              className="flex flex-col items-center"
              style={{
                maxWidth: conditions.length >= 3 && ci === 0 ? "100%" : "50%",
                margin: "2% 0",
              }}
            >
              {condition.map((part, pi) => (
                <div
                  key={pi}
                  className="text-center"
                  style={
                    part.point
                      ? {
                          fontSize: "1.5em",
                          lineHeight: "1.8em",
                          position: "relative",
                          top: "-8%",
                        }
                      : { margin: "0 2px" }
                  }
                >
                  <Iconize text={part.value} />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ── Explanatory text ── */}
      {card["Explanatory text"] && (
        <div
          className="italic text-center"
          style={{
            fontFamily: "Jost, sans-serif",
            fontWeight: 300,
            margin: "4%",
            maxHeight: "9%",
            fontSize: cardHeight * 0.042,
            lineHeight: `${cardHeight * 0.042 + 1}px`,
          }}
        >
          <Iconize text={card["Explanatory text"]} />
        </div>
      )}

      {/* ── Percentage ── */}
      {card["%"] !== "-" && (
        <div
          className="text-center"
          style={{
            fontFamily: "Jost, sans-serif",
            fontWeight: 300,
            marginTop: "auto",
            marginBottom: "2%",
            fontSize: cardHeight * 0.034,
            lineHeight: `${cardHeight * 0.034 + 2}px`,
          }}
        >
          ({card["%"]}% of cards)
        </div>
      )}
    </div>
  );
}
