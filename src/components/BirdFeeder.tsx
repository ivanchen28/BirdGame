import { useCallback, useRef, useState } from "react";
import { createDie, rollDie, type Die } from "../types";
import { DieDisplay } from "./DieDisplay";

const FEEDER_SIZE = 220;
const DIE_SIZE = 44;
const TAKEN_DIE_SIZE = 36;
const DICE_COUNT = 5;

function scatteredPositions(count: number, areaSize: number, dieSize: number): { x: number; y: number }[] {
  const pad = 8;
  const positions: { x: number; y: number }[] = [];
  for (let i = 0; i < count; i++) {
    let attempts = 0;
    let x: number, y: number;
    do {
      x = pad + Math.random() * (areaSize - dieSize - pad * 2);
      y = pad + Math.random() * (areaSize - dieSize - pad * 2);
      attempts++;
    } while (
      attempts < 100 &&
      positions.some((p) => Math.abs(p.x - x) < dieSize + 4 && Math.abs(p.y - y) < dieSize + 4)
    );
    positions.push({ x, y });
  }
  return positions;
}

function createFeederDice(): Die[] {
  return Array.from({ length: DICE_COUNT }, (_, i) => createDie(i, false));
}

function initPositions(): Map<number, { x: number; y: number }> {
  const pos = scatteredPositions(DICE_COUNT, FEEDER_SIZE, DIE_SIZE);
  const map = new Map<number, { x: number; y: number }>();
  for (let i = 0; i < DICE_COUNT; i++) map.set(i, pos[i]);
  return map;
}

export function BirdFeeder() {
  const [feederDice, setFeederDice] = useState<Die[]>(createFeederDice);
  const [takenDice, setTakenDice] = useState<Die[]>([]);
  // Stable positions keyed by die id — generated once per reroll
  const positionsRef = useRef(initPositions());

  const takeDie = useCallback((dieId: number) => {
    setFeederDice((prev) => {
      const die = prev.find((d) => d.id === dieId);
      if (!die) return prev;
      // Use functional update for takenDice to avoid double-add in strict mode
      setTakenDice((taken) => {
        if (taken.some((d) => d.id === die.id)) return taken;
        return [...taken, die];
      });
      return prev.filter((d) => d.id !== dieId);
    });
  }, []);

  const reroll = useCallback(() => {
    const newDice = Array.from({ length: DICE_COUNT }, (_, i) => rollDie(createDie(i, false)));
    const pos = scatteredPositions(DICE_COUNT, FEEDER_SIZE, DIE_SIZE);
    const map = new Map<number, { x: number; y: number }>();
    for (let i = 0; i < DICE_COUNT; i++) map.set(i, pos[i]);
    positionsRef.current = map;
    setFeederDice(newDice);
    setTakenDice([]);
  }, []);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Feeder tray */}
      <div
        className="relative"
        style={{
          width: FEEDER_SIZE,
          height: FEEDER_SIZE,
          borderRadius: 16,
          background: "rgba(0,0,0,0.25)",
          border: "2px solid rgba(255,255,255,0.12)",
          boxShadow: "inset 0 2px 8px rgba(0,0,0,0.3)",
        }}
      >
        {feederDice.map((die) => {
          const pos = positionsRef.current.get(die.id);
          return (
            <div key={die.id} className="absolute" style={{ left: pos?.x ?? 0, top: pos?.y ?? 0 }}>
              <DieDisplay face={die.currentFace} size={DIE_SIZE} onClick={() => takeDie(die.id)} />
            </div>
          );
        })}
        {feederDice.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-white/30 text-sm font-semibold">
            Empty
          </div>
        )}
      </div>

      {/* Reroll button */}
      <button
        onClick={reroll}
        className="px-4 py-1.5 rounded-lg text-sm font-bold text-white cursor-pointer transition-colors"
        style={{
          background: "#b45309",
          border: "2px solid #fbbf24",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        }}
      >
        Reroll
      </button>

      {/* Taken dice */}
      {takenDice.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center" style={{ maxWidth: FEEDER_SIZE }}>
          {takenDice.map((die, i) => (
            <DieDisplay key={`taken-${i}`} face={die.currentFace} size={TAKEN_DIE_SIZE} />
          ))}
        </div>
      )}
    </div>
  );
}
