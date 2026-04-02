import { animated, useSpring } from "@react-spring/web";
import { ReactNode, useCallback, useEffect, useMemo, useRef } from "react";

interface CardDockItem {
  key: string;
  baseWidth: number;
  render: (height: number) => ReactNode;
}

interface CardDockProps {
  items: CardDockItem[];
  baseHeight: number;
  /** Max scale factor when hovered directly (default 1.35) */
  maxScale?: number;
  /** Radius of influence in pixels (default 250) */
  radius?: number;
  padding?: number;
  /** Gap between cards in pixels when there's room (default 8) */
  gap?: number;
}

/**
 * macOS-Dock-style card hand with fisheye magnification.
 * Cards near the cursor scale up; cards further away stay at base size.
 * Uses refs + imperative spring updates to avoid React re-renders on mouse move.
 */
export function CardDock({ items, baseHeight, maxScale = 1.35, radius = 250, padding = 16, gap = 8 }: CardDockProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseXRef = useRef<number | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cardRefs = useRef<Map<string, { el: HTMLDivElement; api: any; baseWidth: number }>>(new Map());
  const rafRef = useRef<number>(0);
  const activeKeyRef = useRef<string | null>(null);

  const updateScales = useCallback(() => {
    const mx = mouseXRef.current;
    const entries = Array.from(cardRefs.current.entries());

    if (mx === null) {
      activeKeyRef.current = null;
      entries.forEach(([, { api, el }]) => {
        api.start({ scale: 1 });
        el.style.zIndex = "100";
      });
      return;
    }

    // Find the card the cursor is over (highest z-index wins in overlap zones)
    let hoveredKey: string | null = null;
    let highestZ = -Infinity;
    for (const [key, { el }] of entries) {
      const rect = el.getBoundingClientRect();
      if (mx >= rect.left && mx <= rect.right) {
        const z = parseInt(el.style.zIndex || "100", 10);
        if (z > highestZ) {
          highestZ = z;
          hoveredKey = key;
        }
      }
    }

    // Stick with the previously active card while the cursor is within its bounds
    if (activeKeyRef.current !== null) {
      const prev = cardRefs.current.get(activeKeyRef.current);
      if (prev) {
        const rect = prev.el.getBoundingClientRect();
        if (mx >= rect.left && mx <= rect.right) {
          hoveredKey = activeKeyRef.current;
        }
      }
    }

    activeKeyRef.current = hoveredKey;

    // Anchor the fisheye at the active card's center so it stays fully
    // scaled while the cursor is anywhere within its visible area
    let anchorX = mx;
    if (hoveredKey) {
      const card = cardRefs.current.get(hoveredKey);
      if (card) {
        const rect = card.el.getBoundingClientRect();
        anchorX = rect.left + rect.width / 2;
      }
    }

    entries.forEach(([, { el, api }]) => {
      const rect = el.getBoundingClientRect();
      const cardCenterX = rect.left + rect.width / 2;
      const dist = Math.abs(anchorX - cardCenterX);
      let scale = 1;
      if (dist < radius) {
        const ratio = (1 + Math.cos((Math.PI * dist) / radius)) / 2;
        scale = 1 + (maxScale - 1) * ratio;
      }
      api.start({ scale });
      el.style.zIndex = String(Math.round(scale * 100));
    });
  }, [maxScale, radius]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      mouseXRef.current = e.clientX;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateScales);
    },
    [updateScales],
  );

  const handleMouseLeave = useCallback(() => {
    mouseXRef.current = null;
    activeKeyRef.current = null;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(updateScales);
  }, [updateScales]);

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Compute spacing: use desired gap, but overlap if hand is too wide
  const marginBetween = useMemo(() => {
    if (items.length <= 1) return 0;
    const availableWidth = typeof window !== "undefined" ? window.innerWidth - padding * 2 : 1200;
    const totalBaseWidth = items.reduce((sum, item) => sum + item.baseWidth, 0);
    const totalWithGaps = totalBaseWidth + gap * (items.length - 1);
    if (totalWithGaps <= availableWidth) return gap;
    // Need to overlap
    const overlap = (totalBaseWidth - availableWidth) / (items.length - 1);
    return -overlap;
  }, [items, padding, gap]);

  const registerCard = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (key: string, el: HTMLDivElement | null, api: any, baseWidth: number) => {
      if (el) {
        cardRefs.current.set(key, { el, api, baseWidth });
      } else {
        cardRefs.current.delete(key);
      }
    },
    [],
  );

  return (
    <div
      ref={containerRef}
      className="flex items-end justify-center shrink-0"
      style={{
        padding: `8px ${padding}px`,
        minHeight: baseHeight + 16,
        maxWidth: "100vw",
        overflow: "visible",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {items.map((item, index) => (
        <DockCard
          key={item.key}
          itemKey={item.key}
          baseWidth={item.baseWidth}
          baseHeight={baseHeight}
          marginLeft={index === 0 ? 0 : marginBetween}
          registerCard={registerCard}
        >
          {item.render}
        </DockCard>
      ))}
    </div>
  );
}

interface DockCardProps {
  itemKey: string;
  baseWidth: number;
  baseHeight: number;
  marginLeft: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registerCard: (key: string, el: HTMLDivElement | null, api: any, baseWidth: number) => void;
  children: (height: number) => ReactNode;
}

function DockCard({ itemKey, baseWidth, baseHeight, marginLeft, registerCard, children }: DockCardProps) {
  const [spring, api] = useSpring(() => ({
    scale: 1,
    config: { tension: 300, friction: 20 },
  }));

  const refCallback = useCallback(
    (el: HTMLDivElement | null) => {
      registerCard(itemKey, el, api, baseWidth);
    },
    [itemKey, api, baseWidth, registerCard],
  );

  return (
    <animated.div
      ref={refCallback}
      style={{
        width: baseWidth,
        height: baseHeight,
        marginLeft,
        flexShrink: 0,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        transformOrigin: "bottom center",
        transform: spring.scale.to((s) => `scale(${s})`),
      }}
    >
      <div style={{ width: baseWidth, height: baseHeight }}>{children(baseHeight)}</div>
    </animated.div>
  );
}
