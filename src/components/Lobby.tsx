import { useEffect, useMemo, useState } from "react";
import { HexColorInput, HexColorPicker } from "react-colorful";
import { allBirdIds, allBonusIds, allGoalIds, allHummingbirdIds } from "../cardLookup";
import { useMutation, useOthers, useStorage, useUpdateMyPresence, type Presence } from "../liveblocks.config";
import { createFeederDice, createPlayer, MAX_PLAYERS, PLAYER_SLOTS, type Player } from "../types";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

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
  const [selectedColor, setSelectedColor] = useState("#ffffff");
  const player1 = useStorage((root) => root.player1);
  const player2 = useStorage((root) => root.player2);
  const player3 = useStorage((root) => root.player3);
  const player4 = useStorage((root) => root.player4);
  const gamePhase = useStorage((root) => root.gamePhase);
  const updateMyPresence = useUpdateMyPresence();
  const others = useOthers();

  const slotPlayers = useMemo(() => [player1, player2, player3, player4], [player1, player2, player3, player4]);
  const playerList = useMemo(() => slotPlayers.filter((p): p is Player => p !== null), [slotPlayers]);
  const playerByName = useMemo(() => {
    const map: Record<string, Player> = {};
    for (const p of playerList) map[p.name] = p;
    return map;
  }, [playerList]);

  const gameInProgress = gamePhase === "playing";

  // Broadcast our identity as presence
  const joined = playerName != null && playerName in playerByName;
  const myColor = joined ? playerByName[playerName].cubeColor : null;

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
    // Check if already joined in any slot
    for (const slot of PLAYER_SLOTS) {
      const p = storage.get(slot);
      if (p && p.name === name) return;
    }
    // Find first empty slot
    for (const slot of PLAYER_SLOTS) {
      if (storage.get(slot) === null) {
        storage.set(slot, createPlayer(name, color));
        return;
      }
    }
    // All slots full — cannot join
  }, []);

  const leaveGame = useMutation(({ storage }, name: string) => {
    for (const slot of PLAYER_SLOTS) {
      const p = storage.get(slot);
      if (p && p.name === name) {
        storage.set(slot, null);
        return;
      }
    }
  }, []);

  const startGame = useMutation(({ storage }) => {
    // Re-shuffle decks fresh for the new game
    const shuffledBirds = shuffle(allBirdIds);
    const shuffledBonus = shuffle(allBonusIds);
    const shuffledHummingbirds = shuffle(allHummingbirdIds);
    const shuffledGoals = shuffle(allGoalIds);
    const initialDice = createFeederDice();

    // Reserve bird tray (3 cards)
    const birdTray = shuffledBirds.slice(0, 3);
    let birdOffset = 3;

    // Reserve hummingbird tray (5 groups of 1)
    const hummingbirdTray = shuffledHummingbirds.slice(0, 5).map((id) => [id]);
    let hummingbirdOffset = 5;

    let bonusOffset = 0;

    // Deal starting resources to each player
    for (const slot of PLAYER_SLOTS) {
      const p = storage.get(slot);
      if (!p) continue;

      // 5 bird cards
      const birdCards = shuffledBirds.slice(birdOffset, birdOffset + 5);
      birdOffset += 5;

      // 2 bonus cards
      const bonusCards = shuffledBonus.slice(bonusOffset, bonusOffset + 2);
      bonusOffset += 2;

      // 1 hummingbird for grassland
      const hummingbirdId = shuffledHummingbirds[hummingbirdOffset];
      hummingbirdOffset += 1;

      storage.set(slot, {
        ...p,
        birdHand: birdCards,
        bonusHand: bonusCards,
        food: { invertebrate: 1, seed: 1, fish: 1, fruit: 1, rodent: 1, nectar: 1 },
        habitats: {
          ...p.habitats,
          grassland: {
            ...p.habitats.grassland,
            hummingbird: hummingbirdId,
          },
        },
      });
    }

    storage.set("birdDeck", shuffledBirds.slice(birdOffset));
    storage.set("birdTray", birdTray);
    storage.set("bonusDeck", shuffledBonus.slice(bonusOffset));
    storage.set("birdDiscard", []);
    storage.set("bonusDiscard", []);
    storage.set("hummingbirdDeck", shuffledHummingbirds.slice(hummingbirdOffset));
    storage.set("hummingbirdTray", hummingbirdTray);
    storage.set("hummingbirdDiscard", []);
    storage.set("roundEndGoalIds", shuffledGoals.slice(0, 4));
    storage.set("feederDice", initialDice);
    storage.set("takenDice", []);
    // Find first player name from occupied slots
    for (const slot of PLAYER_SLOTS) {
      const p = storage.get(slot);
      if (p) {
        storage.set("firstPlayer", p.name);
        break;
      }
    }
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
    storage.set("feederDice", initialDice);
    storage.set("takenDice", []);
    storage.set("player1", null);
    storage.set("player2", null);
    storage.set("player3", null);
    storage.set("player4", null);
  }, []);

  const isFull = playerList.length >= MAX_PLAYERS;

  const handleRejoin = () => {
    const name = nameInput.trim();
    if (!name) return;
    // If the player already exists in storage, just reclaim that identity
    if (name in playerByName) {
      onJoin(name);
      return;
    }
    if (isFull) return;
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
              {playerByName && nameInput.trim() in playerByName && (
                <span className="text-yellow-300 text-xs">
                  This name already exists — you'll rejoin as that player.
                </span>
              )}
            </div>

            {/* Color picker (only shown when creating a new player) */}
            {!(nameInput.trim() in playerByName) && (
              <div className="w-full flex flex-col gap-2">
                <label className="text-white/70 text-sm font-semibold">Cube Color</label>
                <div className="flex items-start gap-4">
                  <HexColorPicker
                    color={selectedColor}
                    onChange={setSelectedColor}
                    style={{ width: 160, height: 160 }}
                  />
                  <div className="flex flex-col gap-2 items-center">
                    <div
                      className="w-10 h-10 rounded-full border-2 border-white/40"
                      style={{ backgroundColor: selectedColor }}
                    />
                    <div className="flex items-center gap-1">
                      <span className="text-white/60 text-xs font-mono">#</span>
                      <HexColorInput
                        color={selectedColor}
                        onChange={setSelectedColor}
                        prefixed={false}
                        className="w-[4.5rem] px-1.5 py-0.5 rounded bg-white/10 border border-white/20 text-white text-xs font-mono outline-none focus:border-white/50"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Join button */}
            <button
              onClick={handleRejoin}
              disabled={!nameInput.trim() || (!(nameInput.trim() in playerByName) && isFull)}
              className="px-6 py-3 rounded-xl text-white font-semibold cursor-pointer transition-all hover:scale-105 hover:ring-2 hover:ring-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "2px solid rgba(255,255,255,0.3)",
              }}
            >
              {nameInput.trim() in playerByName ? "Rejoin" : isFull ? "Game Full" : "Join Game"}
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
