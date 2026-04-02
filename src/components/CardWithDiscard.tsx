import { useEffect, useRef, useState } from "react";

// Module-level counter to uniquely identify each instance
let nextInstanceId = 0;
const CLOSE_EVENT = "card-discard-close-others";

interface CardWithDiscardProps {
  width: number;
  height: number;
  onDiscard: () => void;
  children: React.ReactNode;
}

export function CardWithDiscard({ width, height, onDiscard, children }: CardWithDiscardProps) {
  const [showOverlay, setShowOverlay] = useState(false);
  const instanceId = useRef(nextInstanceId++);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<number>).detail;
      if (detail !== instanceId.current) {
        setShowOverlay(false);
      }
    };
    window.addEventListener(CLOSE_EVENT, handler);
    return () => window.removeEventListener(CLOSE_EVENT, handler);
  }, []);

  const toggle = () => {
    const opening = !showOverlay;
    if (opening) {
      window.dispatchEvent(new CustomEvent(CLOSE_EVENT, { detail: instanceId.current }));
    }
    setShowOverlay(opening);
  };

  return (
    <div className="relative" style={{ width, height }}>
      <div onClick={toggle}>{children}</div>
      {showOverlay && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.5)", borderRadius: 8, zIndex: 20 }}
          onClick={() => setShowOverlay(false)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowOverlay(false);
              onDiscard();
            }}
            className="px-3 py-1.5 rounded-lg text-sm font-bold text-white cursor-pointer"
            style={{
              background: "#991b1b",
              border: "2px solid #f87171",
              boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
              fontFamily: "CardenioModernBold, sans-serif",
            }}
          >
            Discard
          </button>
        </div>
      )}
    </div>
  );
}
