import { useEffect, useState } from "react";
import { allBirdIds, allBonusIds, allGoalIds, allHummingbirdIds } from "../cardLookup";
import { useMutation, useOthers, useStorage, useUpdateMyPresence, type Presence } from "../liveblocks.config";
import { createFeederDice, createPlayer, type Player } from "../types";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const COLOR_OPTIONS = [
  { name: "White", value: "white" },
  { name: "Black", value: "black" },
  { name: "Red", value: "red" },
  { name: "Blue", value: "blue" },
  { name: "Yellow", value: "yellow" },
  { name: "Green", value: "green" },
  { name: "Purple", value: "purple" },
  { name: "Orange", value: "orange" },
];

export function Lobby({
  playerName,
  onJoin,
  onEnterGame,
}: {
  playerName: string | null;
  onJoin: (name: string) => void;
  onEnterGame?: () => void;
}) {
  const [nameInput, setNameInput] = useState(playerName ?? "");
  const [selectedColor, setSelectedColor] = useState("white");
  const players = useStorage((root) => root.players) as Record<string, Player> | null;
  const gamePhase = useStorage((root) => root.gamePhase);
  const updateMyPresence = useUpdateMyPresence();
  const others = useOthers();

  const gameInProgress = gamePhase === "playing";

  // Broadcast our identity as presence
  const joined = playerName != null && players != null && playerName in players;
  const myColor = joined && players ? players[playerName].cubeColor : null;

  useEffect(() => {
    updateMyPresence({ name: joined ? playerName : null, color: myColor });
  }, [joined, playerName, myColor, updateMyPresence]);

  // Collect online player names from other clients' presence
  const onlineNames = new Set<string>();
  for (const other of others) {
    const p = other.presence as Presence;
    if (p.name) onlineNames.add(p.name);
  }
  // Include self if joined
  if (joined && playerName) onlineNames.add(playerName);

  const joinGame = useMutation(({ storage }, name: string, color: string) => {
    const existing = storage.get("players");
    if (existing[name]) return; // already joined
    storage.set("players", { ...existing, [name]: createPlayer(name, color) });
  }, []);

  const leaveGame = useMutation(({ storage }, name: string) => {
    const existing = { ...storage.get("players") };
    delete existing[name];
    storage.set("players", existing);
  }, []);

  const startGame = useMutation(({ storage }) => {
    // Re-shuffle decks fresh for the new game
    const shuffledBirds = shuffle(allBirdIds);
    const shuffledBonus = shuffle(allBonusIds);
    const shuffledHummingbirds = shuffle(allHummingbirdIds);
    const shuffledGoals = shuffle(allGoalIds);
    const initialDice = createFeederDice();
    storage.set("birdDeck", shuffledBirds.slice(3));
    storage.set("birdTray", shuffledBirds.slice(0, 3));
    storage.set("bonusDeck", shuffledBonus);
    storage.set("birdDiscard", []);
    storage.set("bonusDiscard", []);
    storage.set("hummingbirdDeck", shuffledHummingbirds.slice(5));
    storage.set(
      "hummingbirdTray",
      shuffledHummingbirds.slice(0, 5).map((id) => [id]),
    );
    storage.set("hummingbirdDiscard", []);
    storage.set("roundEndGoalIds", shuffledGoals.slice(0, 4));
    storage.set(
      "roundEndSpots",
      Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => ({ cubeColors: [] as string[] }))),
    );
    storage.set("feederDice", initialDice);
    storage.set("takenDice", []);
    const names = Object.keys(storage.get("players"));
    if (names.length > 0) storage.set("firstPlayer", names[0]);
    storage.set("gamePhase", "playing");
  }, []);

  const resetGame = useMutation(({ storage }) => {
    const shuffledBirds = shuffle(allBirdIds);
    const shuffledBonus = shuffle(allBonusIds);
    const shuffledHummingbirds = shuffle(allHummingbirdIds);
    const shuffledGoals = shuffle(allGoalIds);
    const initialDice = createFeederDice();
    storage.set("gamePhase", "lobby");
    storage.set("birdDeck", shuffledBirds.slice(3));
    storage.set("birdTray", shuffledBirds.slice(0, 3));
    storage.set("bonusDeck", shuffledBonus);
    storage.set("birdDiscard", []);
    storage.set("bonusDiscard", []);
    storage.set("hummingbirdDeck", shuffledHummingbirds.slice(5));
    storage.set(
      "hummingbirdTray",
      shuffledHummingbirds.slice(0, 5).map((id) => [id]),
    );
    storage.set("hummingbirdDiscard", []);
    storage.set("roundEndGoalIds", shuffledGoals.slice(0, 4));
    storage.set(
      "roundEndSpots",
      Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => ({ cubeColors: [] as string[] }))),
    );
    storage.set("feederDice", initialDice);
    storage.set("takenDice", []);
    storage.set("players", {});
  }, []);

  const playerList = players ? Object.values(players) : [];
  const takenColors = new Set(playerList.map((p) => p.cubeColor));

  const handleRejoin = () => {
    const name = nameInput.trim();
    if (!name) return;
    // If the player already exists in storage, just reclaim that identity
    if (players && name in players) {
      onJoin(name);
      return;
    }
    // Otherwise, create a new player entry
    joinGame(name, selectedColor);
    onJoin(name);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-emerald-800 to-emerald-950 flex items-center justify-center">
      <div className="bg-black/40 rounded-2xl p-8 flex flex-col items-center gap-6 border border-white/20 min-w-[400px]">
        <h1 className="text-white text-2xl font-bold">Wingspan — Lobby</h1>

        {/* Player list */}
        {playerList.length > 0 && (
          <div className="w-full">
            <h2 className="text-white/70 text-sm font-semibold mb-2">Players in game:</h2>
            <div className="flex flex-col gap-1">
              {playerList.map((p) => (
                <div key={p.name} className="flex items-center gap-2 text-white text-sm">
                  <div
                    className="w-4 h-4 rounded-full border border-white/40"
                    style={{ backgroundColor: p.cubeColor }}
                  />
                  <span>{p.name}</span>
                  {joined && playerName === p.name && <span className="text-white/40 text-xs">(you)</span>}
                  <span
                    className={`w-2 h-2 rounded-full ${onlineNames.has(p.name) ? "bg-green-400" : "bg-white/20"}`}
                    title={onlineNames.has(p.name) ? "Online" : "Offline"}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {gameInProgress ? (
          <>
            {/* Game in progress */}
            <div className="text-yellow-300 text-sm font-semibold">A game is currently in progress.</div>
            <div className="flex gap-3">
              {joined && (
                <button
                  onClick={() => onEnterGame?.()}
                  className="px-6 py-3 rounded-xl text-white font-semibold cursor-pointer transition-all hover:scale-105 hover:ring-2 hover:ring-yellow-400 bg-emerald-600/60 border-2 border-emerald-400/50"
                >
                  Enter Game
                </button>
              )}
              <button
                onClick={() => {
                  if (confirm("Reset the entire game? All players will be removed.")) {
                    resetGame();
                    onJoin("");
                  }
                }}
                className="px-6 py-3 rounded-xl text-red-300/70 font-semibold cursor-pointer transition-all hover:scale-105 hover:text-red-300"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "2px solid rgba(255,255,255,0.15)",
                }}
              >
                Reset Game
              </button>
            </div>
          </>
        ) : !joined ? (
          <>
            {/* Name input */}
            <div className="w-full flex flex-col gap-1">
              <label className="text-white/70 text-sm font-semibold">Your Name</label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRejoin()}
                placeholder="Enter your name…"
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 outline-none focus:border-white/50"
                autoFocus
              />
              {players && nameInput.trim() in players && (
                <span className="text-yellow-300 text-xs">
                  This name already exists — you'll rejoin as that player.
                </span>
              )}
            </div>

            {/* Color picker (only shown when creating a new player) */}
            {!(players && nameInput.trim() in players) && (
              <div className="w-full flex flex-col gap-1">
                <label className="text-white/70 text-sm font-semibold">Cube Color</label>
                <div className="flex gap-2 flex-wrap">
                  {COLOR_OPTIONS.map((c) => {
                    const taken = takenColors.has(c.value);
                    const selected = selectedColor === c.value;
                    return (
                      <button
                        key={c.value}
                        onClick={() => !taken && setSelectedColor(c.value)}
                        disabled={taken}
                        className={`w-9 h-9 rounded-full border-2 transition-all cursor-pointer ${
                          taken
                            ? "opacity-30 cursor-not-allowed"
                            : selected
                              ? "ring-2 ring-yellow-400 border-yellow-400"
                              : "border-white/40 hover:border-white/70"
                        }`}
                        style={{ backgroundColor: c.value }}
                        title={taken ? `${c.name} (taken)` : c.name}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Join button */}
            <button
              onClick={handleRejoin}
              disabled={!nameInput.trim()}
              className="px-6 py-3 rounded-xl text-white font-semibold cursor-pointer transition-all hover:scale-105 hover:ring-2 hover:ring-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "2px solid rgba(255,255,255,0.3)",
              }}
            >
              {players && nameInput.trim() in players ? "Rejoin" : "Join Game"}
            </button>
          </>
        ) : (
          <>
            {/* Already joined — show start / leave */}
            <div className="flex gap-3">
              <button
                onClick={startGame}
                disabled={playerList.length === 0}
                className="px-6 py-3 rounded-xl text-white font-semibold cursor-pointer transition-all hover:scale-105 hover:ring-2 hover:ring-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed bg-emerald-600/60 border-2 border-emerald-400/50"
              >
                Start Game
              </button>
              <button
                onClick={() => {
                  if (confirm("Reset the entire game? All players will be removed.")) {
                    resetGame();
                    onJoin("");
                  }
                }}
                className="px-6 py-3 rounded-xl text-red-300/70 font-semibold cursor-pointer transition-all hover:scale-105 hover:text-red-300"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "2px solid rgba(255,255,255,0.15)",
                }}
              >
                Reset Game
              </button>
              <button
                onClick={() => {
                  leaveGame(playerName);
                  onJoin(""); // clear identity — will re-render as not-joined
                }}
                className="px-6 py-3 rounded-xl text-white/70 font-semibold cursor-pointer transition-all hover:scale-105 hover:text-white"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "2px solid rgba(255,255,255,0.15)",
                }}
              >
                Leave
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
