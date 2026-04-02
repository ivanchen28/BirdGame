const cardBackUrl = new URL("../../assets/cards/backgrounds/bird-background.jpg", import.meta.url).href;

interface BirdDeckProps {
  count: number;
  width: number;
  height: number;
  onDraw: () => void;
}

export function BirdDeck({ count, width, height, onDraw }: BirdDeckProps) {
  if (count === 0) {
    return (
      <div
        className="rounded-lg flex items-center justify-center"
        style={{
          width,
          height,
          border: "2px dashed #3a9463",
          color: "#3a9463",
          fontSize: 18,
          fontFamily: "CardenioModernBold, SiliciStrong, sans-serif",
        }}
      >
        Deck Empty
      </div>
    );
  }

  return (
    <button onClick={onDraw} className="relative group cursor-pointer" style={{ width, height }}>
      {[3, 2, 1, 0].map((i) => (
        <div
          key={i}
          className="absolute rounded-lg overflow-hidden"
          style={{
            width,
            height,
            top: i * -2,
            left: i * 1.5,
            boxShadow: i === 0 ? "0 4px 20px rgba(0,0,0,0.5)" : "0 1px 3px rgba(0,0,0,0.3)",
            backgroundImage: `url(${cardBackUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      ))}
      <div
        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ boxShadow: "0 0 30px rgba(74, 186, 120, 0.4)" }}
      />
      <div
        className="absolute -top-3 -right-3 rounded-full flex items-center justify-center text-white font-bold text-sm"
        style={{
          width: 36,
          height: 36,
          background: "#b45309",
          border: "2px solid #fbbf24",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          zIndex: 10,
        }}
      >
        {count}
      </div>
    </button>
  );
}
