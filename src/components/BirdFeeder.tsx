import { ArrowPathIcon } from "@heroicons/react/24/solid";
import { useCallback, useEffect, useRef, useState } from "react";
import feederBg from "../../assets/birdfeeder-background.png";
import { useMutation, useStorage } from "../liveblocks.config";
import { createFeederDice, rollDie, type Die, type DieFace } from "../types";
import { DieDisplay } from "./DieDisplay";

const DEFAULT_FEEDER_SIZE = 220;
const DIE_SIZE = 36;
const TAKEN_DIE_SIZE = 36;
const DICE_COUNT = 5;

function scatteredPositions(count: number, width: number, height: number, dieSize: number): { x: number; y: number }[] {
  const pad = 8;
  const minDist = dieSize + 6;
  const maxX = width - dieSize - pad * 2;
  const maxY = height - dieSize - pad * 2;

  for (let fullRetry = 0; fullRetry < 50; fullRetry++) {
    const positions: { x: number; y: number }[] = [];
    let failed = false;
    for (let i = 0; i < count; i++) {
      let placed = false;
      for (let attempt = 0; attempt < 500; attempt++) {
        const x = pad + Math.random() * maxX;
        const y = pad + Math.random() * maxY;
        const tooClose = positions.some((p) => {
          const dx = p.x - x;
          const dy = p.y - y;
          return Math.sqrt(dx * dx + dy * dy) < minDist;
        });
        if (!tooClose) {
          positions.push({ x, y });
          placed = true;
          break;
        }
      }
      if (!placed) {
        failed = true;
        break;
      }
    }
    if (!failed) return positions;
  }
  // Fallback: grid layout
  const cols = Math.ceil(Math.sqrt(count));
  return Array.from({ length: count }, (_, i) => ({
    x: pad + (i % cols) * (maxX / cols),
    y: pad + Math.floor(i / cols) * (maxY / Math.ceil(count / cols)),
  }));
}

function initPositions(w: number, h: number): Map<number, { x: number; y: number }> {
  const pos = scatteredPositions(DICE_COUNT, w, h, DIE_SIZE);
  const map = new Map<number, { x: number; y: number }>();
  for (let i = 0; i < DICE_COUNT; i++) map.set(i, pos[i]);
  return map;
}

export function BirdFeeder({
  size = DEFAULT_FEEDER_SIZE,
  height,
  disabled,
}: { size?: number; height?: number; disabled?: boolean } = {}) {
  const feederHeight = height ?? Math.round(size);
  const feederDice = useStorage((root) => root.feederDice)!;
  const takenDice = useStorage((root) => root.takenDice)!;
  // Stable positions keyed by die id — generated once per reroll
  const positionsRef = useRef(initPositions(size, feederHeight));
  const prevDiceCountRef = useRef(feederDice.length);

  // Regenerate positions when a full reroll occurs (dice count jumps back to DICE_COUNT)
  useEffect(() => {
    const prev = prevDiceCountRef.current;
    prevDiceCountRef.current = feederDice.length;
    if (feederDice.length === DICE_COUNT && prev < DICE_COUNT) {
      const pos = scatteredPositions(DICE_COUNT, size, feederHeight, DIE_SIZE);
      const map = new Map<number, { x: number; y: number }>();
      for (let i = 0; i < DICE_COUNT; i++) map.set(feederDice[i].id, pos[i]);
      positionsRef.current = map;
    }
  }, [feederDice, size, feederHeight]);

  const reroll = useMutation(
    ({ storage }) => {
      const newDice = createFeederDice();
      storage.set("feederDice", newDice);
      storage.set("takenDice", []);
      // Update local positions
      const pos = scatteredPositions(DICE_COUNT, size, feederHeight, DIE_SIZE);
      const map = new Map<number, { x: number; y: number }>();
      for (let i = 0; i < DICE_COUNT; i++) map.set(newDice[i].id, pos[i]);
      positionsRef.current = map;
    },
    [size, feederHeight],
  );

  const takeDie = useMutation(({ storage }, dieId: number) => {
    const dice = storage.get("feederDice") as Die[];
    const die = dice.find((d: Die) => d.id === dieId);
    if (!die) return;
    const remaining = dice.filter((d: Die) => d.id !== dieId);
    storage.set("feederDice", remaining);
    const taken = storage.get("takenDice") as Die[];
    if (!taken.some((d: Die) => d.id === die.id)) {
      storage.set("takenDice", [...taken, die]);
    }
  }, []);

  const rerollTakenDie = useMutation(({ storage }, dieId: number) => {
    const taken = storage.get("takenDice") as Die[];
    const die = taken.find((d: Die) => d.id === dieId);
    if (!die) return;
    const rerolled = rollDie(die);
    storage.set(
      "takenDice",
      taken.map((d: Die) => (d.id === dieId ? rerolled : d)),
    );
  }, []);

  // Taken-die rolling animation state
  const [rollingDieId, setRollingDieId] = useState<number | null>(null);
  const [rollingFace, setRollingFace] = useState<DieFace | null>(null);
  const rollingRef = useRef(false);

  // Feeder reroll animation state
  const [feederRolling, setFeederRolling] = useState(false);
  const [feederLanded, setFeederLanded] = useState(false);
  const rollOriginRef = useRef({ x: 0, y: 0 });
  const [faceTick, setFaceTick] = useState(0);
  const feederRollingRef = useRef(false);

  const animateFeederReroll = useCallback(() => {
    if (feederRollingRef.current || disabled) return;
    feederRollingRef.current = true;

    const corners = [
      { x: -DIE_SIZE, y: -DIE_SIZE },
      { x: size + DIE_SIZE, y: -DIE_SIZE },
      { x: -DIE_SIZE, y: feederHeight + DIE_SIZE },
      { x: size + DIE_SIZE, y: feederHeight + DIE_SIZE },
    ];
    rollOriginRef.current = corners[Math.floor(Math.random() * corners.length)];

    reroll();
    setFeederRolling(true);
    setFeederLanded(false);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setFeederLanded(true);
      });
    });

    let tick = 0;
    const faceTimer = setInterval(() => {
      tick++;
      setFaceTick(tick);
    }, 60);

    setTimeout(() => {
      clearInterval(faceTimer);
      setFeederRolling(false);
      setFeederLanded(false);
      setFaceTick(0);
      feederRollingRef.current = false;
    }, 700);
  }, [disabled, reroll, size, feederHeight]);

  const handleTakeDie = useCallback(
    (dieId: number) => {
      const remaining = feederDice.filter((d) => d.id !== dieId);
      takeDie(dieId);
      if (remaining.length === 0) {
        // Last die taken — trigger animated reroll
        requestAnimationFrame(() => animateFeederReroll());
      }
    },
    [feederDice, takeDie, animateFeederReroll],
  );

  const animateReroll = useCallback(
    (die: Die) => {
      if (rollingRef.current) return;
      rollingRef.current = true;
      setRollingDieId(die.id);

      const faces = die.possibleFaces;
      const duration = 450;
      const interval = 60;
      let elapsed = 0;

      const timer = setInterval(() => {
        elapsed += interval;
        setRollingFace(faces[Math.floor(Math.random() * faces.length)]);
        if (elapsed >= duration) {
          clearInterval(timer);
          rerollTakenDie(die.id);
          setRollingDieId(null);
          setRollingFace(null);
          rollingRef.current = false;
        }
      }, interval);
    },
    [rerollTakenDie],
  );

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Taken dice */}
      <div className="flex flex-wrap gap-2 justify-center items-center" style={{ maxWidth: size, height: 44 }}>
        {takenDice.map((die, i) => {
          const isRolling = rollingDieId === die.id;
          const displayFace = isRolling && rollingFace ? rollingFace : die.currentFace;
          return (
            <div
              key={`taken-${i}`}
              className={`relative group ${disabled || isRolling ? "cursor-default" : "cursor-pointer"}`}
              onClick={disabled || isRolling ? undefined : () => animateReroll(die)}
            >
              <DieDisplay face={displayFace} size={TAKEN_DIE_SIZE} isRolling={isRolling} isNectar={die.isNectar} />
              {!isRolling && (
                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowPathIcon className="h-5 w-5 text-white drop-shadow" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Feeder tray */}
      <div
        className="relative"
        style={{
          width: size,
          height: feederHeight,
          borderRadius: 16,
          backgroundImage: `url(${feederBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          border: "2px solid rgba(255,255,255,0.12)",
          boxShadow: "inset 0 2px 8px rgba(0,0,0,0.3)",
          overflow: feederRolling ? "visible" : "hidden",
        }}
      >
        {feederDice.map((die, idx) => {
          const finalPos = positionsRef.current.get(die.id);
          const isAnimating = feederRolling;
          const pos = isAnimating && !feederLanded ? rollOriginRef.current : (finalPos ?? { x: 0, y: 0 });
          const displayFace = isAnimating
            ? die.possibleFaces[(faceTick + die.id) % die.possibleFaces.length]
            : die.currentFace;
          const staggerDelay = idx * 0.06;
          return (
            <div
              key={die.id}
              className="absolute"
              style={{
                left: pos.x,
                top: pos.y,
                transition: feederLanded
                  ? `left 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) ${staggerDelay}s, top 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) ${staggerDelay}s`
                  : "none",
              }}
            >
              <DieDisplay
                face={displayFace}
                size={DIE_SIZE}
                isNectar={die.isNectar}
                onClick={disabled || isAnimating ? undefined : () => handleTakeDie(die.id)}
              />
            </div>
          );
        })}
        {feederDice.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-white/30 text-sm font-semibold">
            Empty
          </div>
        )}
        {/* Reroll button */}
        <button
          onClick={disabled || feederRolling ? undefined : animateFeederReroll}
          disabled={disabled || feederRolling}
          className={`absolute top-1.5 right-1.5 p-1 rounded-md transition-colors ${disabled || feederRolling ? "cursor-default opacity-40" : "cursor-pointer hover:bg-white/20"}`}
          style={{
            background: "rgba(0,0,0,0.4)",
            border: "1px solid rgba(255,255,255,0.3)",
          }}
        >
          <ArrowPathIcon className="h-4 w-4 text-white" />
        </button>
      </div>
    </div>
  );
}
