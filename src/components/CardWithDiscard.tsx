import { useEffect, useRef, useState } from "react";

// Module-level counter to uniquely identify each instance
let nextInstanceId = 0;
const CLOSE_EVENT = "card-discard-close-others";

interface CardWithDiscardProps {
  width: number;
  height: number;
  onDiscard: () => void;
  onPlay?: () => void;
  onTuck?: () => void;
  activeAction?: "play" | "tuck" | null;
  onCancelAction?: () => void;
  children: React.ReactNode;
}

export function CardWithDiscard({
  width,
  height,
  onDiscard,
  onPlay,
  onTuck,
  activeAction,
  onCancelAction,
  children,
}: CardWithDiscardProps) {
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
      {/* Cancel overlay for active play/tuck action */}
      {activeAction && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2"
          style={{ background: "rgba(0,0,0,0.5)", borderRadius: 8, zIndex: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-white font-bold text-sm" style={{ fontFamily: "CardenioModernBold, sans-serif" }}>
            {activeAction === "play" ? "Playing…" : "Tucking…"}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCancelAction?.();
            }}
            className="px-3 py-1.5 rounded-lg text-sm font-bold text-white cursor-pointer"
            style={{
              background: "#991b1b",
              border: "2px solid #f87171",
              boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
              fontFamily: "CardenioModernBold, sans-serif",
            }}
          >
            Cancel
          </button>
        </div>
      )}
      {showOverlay && !activeAction && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.5)", borderRadius: 8, zIndex: 20 }}
          onClick={() => setShowOverlay(false)}
        >
          <div className="flex flex-col gap-2">
            {onPlay && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowOverlay(false);
                  onPlay();
                }}
                className="px-3 py-1.5 rounded-lg text-sm font-bold text-white cursor-pointer"
                style={{
                  background: "#166534",
                  border: "2px solid #4ade80",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                  fontFamily: "CardenioModernBold, sans-serif",
                }}
              >
                Play
              </button>
            )}
            {onTuck && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowOverlay(false);
                  onTuck();
                }}
                className="px-3 py-1.5 rounded-lg text-sm font-bold text-white cursor-pointer"
                style={{
                  background: "#854d0e",
                  border: "2px solid #facc15",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                  fontFamily: "CardenioModernBold, sans-serif",
                }}
              >
                Tuck
              </button>
            )}
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
        </div>
      )}
    </div>
  );
}
