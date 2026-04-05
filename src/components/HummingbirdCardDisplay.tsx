import { birdImageUrl, foodUrl, hummingbirdUrl, iconUrl, powerBgUrl } from "../icons";
import type { HummingbirdCard } from "../types";

const CARD_HEIGHT = 460;
const CARD_RATIO = 0.655;

function benefitIconUrl(benefit: string): string {
  switch (benefit) {
    case "nectar":
      return foodUrl("nectar");
    case "egg":
      return iconUrl("egg");
    case "card":
      return iconUrl("card");
    case "advance":
      return hummingbirdUrl("advance");
    case "row":
      return hummingbirdUrl("row_benefit");
    default:
      return iconUrl("card");
  }
}

interface HummingbirdCardDisplayProps {
  card: HummingbirdCard;
  cardHeight?: number;
}

export function HummingbirdCardDisplay({ card, cardHeight = CARD_HEIGHT }: HummingbirdCardDisplayProps) {
  const cardWidth = cardHeight * CARD_RATIO;

  return (
    <div
      className="relative bg-no-repeat rounded-lg overflow-hidden shadow-xl bg-[#f5f6f1]"
      style={{
        width: cardWidth,
        height: cardHeight,
        backgroundImage: `url(${birdImageUrl(card.id)})`,
        backgroundSize: "110%",
        backgroundPositionY: "-100%",
        backgroundPositionX: "85%",
        containerType: "inline-size",
      }}
    >
      <div className="flex flex-col h-full justify-between">
        {/* ── Upper Row: Group Icon + Name ── */}
        <div className="flex" style={{ height: "22%", marginTop: "6.8%" }}>
          {/* Green Square with Group Icon */}
          <div
            className="flex items-center"
            style={{
              width: "27.27%",
              height: "100%",
              backgroundImage: `url(${powerBgUrl("green")})`,
              backgroundSize: "367%",
              backgroundPositionY: "center",
              backgroundPositionX: "right",
            }}
          >
            <img
              src={hummingbirdUrl(card.Group)}
              alt={card.Group}
              style={{ maxWidth: "13cqw", marginLeft: "8.5cqw", maxHeight: "13cqw" }}
            />
          </div>

          {/* Title Area */}
          <div
            className="flex flex-col justify-center text-center flex-grow"
            style={{
              borderStyle: "solid",
              borderRightStyle: "none",
              borderWidth: cardHeight / 460,
              borderColor: "#000000",
              marginTop: "auto",
              marginBottom: "auto",
              height: "100%",
              marginLeft: "3%",
              backgroundColor: "#f5f6f1",
            }}
          >
            <div
              style={{
                fontSize: cardHeight * 0.05,
                lineHeight: `${cardHeight * 0.05}px`,
                fontFamily: "CardenioModernBold, SiliciStrong, sans-serif",
              }}
            >
              {card["Common name"]}
            </div>
            <div
              style={{
                fontSize: cardHeight * 0.036,
                lineHeight: `${cardHeight * 0.04}px`,
                fontFamily: "ThirstyRoughLt, Arial, Helvetica",
                color: "#666666",
              }}
            >
              {card["Scientific name"]}
            </div>
          </div>
        </div>

        {/* ── Lower Column: Attract + Benefit ── */}
        <div
          className="flex flex-col items-center"
          style={{
            height: "30%",
            width: "27.27%",
            marginBottom: "6.8%",
          }}
        >
          {/* Attract Icon */}
          <div
            style={{
              height: "12.5cqw",
              marginBottom: "-2.5cqw",
              zIndex: 1,
              border: "2px solid #f5f6f1",
              marginLeft: "3cqw",
            }}
          >
            <img src={hummingbirdUrl("attract")} alt="attract" style={{ height: "100%" }} />
          </div>

          {/* Benefit Square */}
          <div
            className="flex items-center justify-center pl-[3px]"
            style={{
              height: "25cqw",
              width: "100%",
              borderStyle: "solid",
              borderLeftStyle: "none",
              borderWidth: 0.5,
              borderColor: "#74685e",
              borderTopRightRadius: "3.5cqw",
              borderBottomRightRadius: "3.5cqw",
            }}
          >
            <img
              src={benefitIconUrl(card.Benefit)}
              alt={card.Benefit}
              style={{
                maxWidth: "13cqw",
                maxHeight: "18.5cqw",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
