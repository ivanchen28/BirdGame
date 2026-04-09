## Multiplayer Implementation Instructions

### Overview

This is a Wingspan board game app built with React + Vite + TypeScript + Tailwind. All game state currently lives in `useState` hooks inside App.tsx. The goal is to add online multiplayer via Liveblocks, allowing multiple players to share a single game room on GitHub Pages. No server, no auth, honor system only.

**Key architectural decision:** Store only card IDs in Liveblocks, not full card objects. Card data is static and loaded from JSON files locally. Each client resolves IDs → full card details at render time.

---

### Step 0: Refactor to ID-Based Card References

**Goal:** Decouple static card data from game state. Build local lookup maps and change all state/callbacks to store IDs instead of full card objects. No Liveblocks yet — this is a pure local refactor.

**Create lookup maps** in a new file `src/cardLookup.ts`:

- Import `birds.json`, `bonus.json`, `hummingbirds.json`, `goals.json`
- Export typed `Map<number, BirdCard>`, `Map<number, BonusCard>`, `Map<number, HummingbirdCard>`, `Map<number, RoundEndGoal>`
- Export typed helper functions: `getBird(id: number): BirdCard`, `getBonus(id: number): BonusCard`, `getHummingbird(id: number): HummingbirdCard`, `getGoal(id: number): RoundEndGoal` (these should throw if not found — IDs are always valid)

**Introduce a `PlayedBirdState` type** (in types.ts) to replace `PlayedBirdCard` in state:

```ts
interface PlayedBirdState {
  id: number;
  eggsLaid: number;
  tuckedCardIds: number[];
  cachedFood: FoodSupply;
}
```

Keep `PlayedBirdCard` as a display type. Add a helper `toPlayedBirdState(bird: BirdCard): PlayedBirdState` that returns `{ id: bird.id, eggsLaid: 0, tuckedCardIds: [], cachedFood: {…zeros…} }`.

**Change state types in App.tsx:**

- `deck`: `BirdCard[]` → `number[]` (bird IDs)
- `birdTray`: `(BirdCard | null)[]` → `(number | null)[]` (bird IDs or null)
- `bonusDeck`: `BonusCard[]` → `number[]`
- `birdDiscard`: `BirdCard[]` → `number[]`
- `bonusDiscard`: `BonusCard[]` → `number[]`
- `hummingbirdDeck`: `HummingbirdCard[]` → `number[]`
- `hummingbirdTray`: `(HummingbirdCard | null)[]` → `(number | null)[]`
- `hummingbirdDiscard`: `HummingbirdCard[]` → `number[]`
- `player.birdHand`: `BirdCard[]` → `number[]`
- `player.bonusHand`: `BonusCard[]` → `number[]`
- `player.habitats[*].birds`: `PlayedBirdCard[]` → `PlayedBirdState[]`
- `player.habitats[*].hummingbird`: `HummingbirdCard | undefined` → `number | undefined` (hummingbird ID)
- `roundEndBoard.goals`: `RoundEndGoal[]` → `number[]` (goal IDs)
- `placingBird`, `tuckingBird`: `BirdCard | null` → `number | null` (bird ID from hand)
- `placingHummingbird`: `HummingbirdCard | null` → `number | null`

**Update all callbacks** to work with IDs. Resolve IDs to full objects only at render time using the lookup maps. For example, `drawCard` pops an ID from `deck` and pushes it to `player.birdHand`. The `dockItems` memo resolves each ID via `getBird(id)` before passing to `<BirdCardDisplay>`.

**Update `Player` type and `createPlayer`** in types.ts to use the new ID-based fields.

**Update `Habitat` type** to use `PlayedBirdState[]` instead of `PlayedBirdCard[]` and `number | undefined` for hummingbird.

**Update child components:** They should continue to receive full card objects as props (resolved by the parent). No changes needed to `BirdCardDisplay`, `BonusCardDisplay`, `HummingbirdCardDisplay`, `PlayedBirdCardDisplay`, `GameBoard`, etc. — the parent resolves IDs before passing props down. The exception is `GameBoard` which receives `player` directly; its `PlayedBirdCard` references will need updating since the player's habitat birds are now `PlayedBirdState[]`. Either:

- Resolve inside `GameBoard` (add lookup imports), or
- Pre-resolve in App.tsx before passing to `GameBoard` (create a "resolved player" object)

The cleaner approach is resolving in App.tsx and passing resolved data down, keeping components unchanged.

**The `BirdFeeder` component** has its own internal `useState` for dice — this is fine, it stays local. The feeder is currently self-contained and doesn't write to any shared state. This will remain local in the multiplayer version too (it becomes a shared component in a later step).

**Verify:** After this step, the app should behave identically to before. All card rendering still works, all interactions still work, but state is now ID-based.

---

### Step 1: Integrate Liveblocks and Move Shared State to Cloud

**Goal:** Install Liveblocks, create a single room, and move shared game state from `useState` into Liveblocks `useStorage` / `useMutation`. The app becomes a synced single-player game (one player, but state lives in the cloud).

**Install Liveblocks:**

```
npm install @liveblocks/client @liveblocks/react
```

**Create `src/liveblocks.config.ts`:**

- Configure the Liveblocks client with the public API key (use `createClient({ publicApiKey: "..." })`)
- Define the `Storage` type representing all synced state
- Export `RoomProvider`, `useStorage`, `useMutation`, `useRoom` etc. via `createRoomContext<…>()`

**Define the `Storage` type** — this is the shape of all shared state in Liveblocks:

```ts
type Storage = {
  // Shared decks/trays/discards (ID arrays)
  birdDeck: number[];
  birdTray: (number | null)[];
  bonusDeck: number[];
  birdDiscard: number[];
  bonusDiscard: number[];
  hummingbirdDeck: number[];
  hummingbirdTray: (number | null)[];
  hummingbirdDiscard: number[];

  // Round end goals
  roundEndGoalIds: number[];
  roundEndSpots: RoundEndSpot[][];

  // Bird feeder dice (moved from BirdFeeder's local state)
  feederDice: Die[];
  takenDice: Die[];

  // Player data (for now, single player; step 2 makes this a map)
  player: Player;

  // Game initialized flag
  initialized: boolean;
};
```

**Classify current state into synced vs. local:**

| State variable                                         | Where it goes                                  |
| ------------------------------------------------------ | ---------------------------------------------- |
| `deck`                                                 | Liveblocks `birdDeck`                          |
| `birdTray`                                             | Liveblocks `birdTray`                          |
| `bonusDeck`                                            | Liveblocks `bonusDeck`                         |
| `birdDiscard`                                          | Liveblocks `birdDiscard`                       |
| `bonusDiscard`                                         | Liveblocks `bonusDiscard`                      |
| `hummingbirdDeck`                                      | Liveblocks `hummingbirdDeck`                   |
| `hummingbirdTray`                                      | Liveblocks `hummingbirdTray`                   |
| `hummingbirdDiscard`                                   | Liveblocks `hummingbirdDiscard`                |
| `roundEndBoard`                                        | Liveblocks `roundEndGoalIds` + `roundEndSpots` |
| `player`                                               | Liveblocks `player`                            |
| `feederDice` / `takenDice` (currently in `BirdFeeder`) | Liveblocks `feederDice` / `takenDice`          |
| `placingBird`                                          | Local `useState`                               |
| `tuckingBird`                                          | Local `useState`                               |
| `layingEggs`                                           | Local `useState`                               |
| `cachingFood`                                          | Local `useState`                               |
| `viewingTucked`                                        | Local `useState`                               |
| `migratingBird`                                        | Local `useState`                               |
| `placingCube`                                          | Local `useState`                               |
| `placingHummingbird`                                   | Local `useState`                               |
| `placingHummingbirdSource`                             | Local `useState`                               |
| `discardModal`                                         | Local `useState`                               |

**Wrap the app in `<RoomProvider>`** in `main.tsx` or App.tsx:

- Use a hardcoded room ID like `"wingspan-game"`
- Provide `initialStorage` that sets up the shuffled decks, trays, etc.
- Use the `initialized` flag: the first client to join initializes storage; subsequent clients read existing state

**Refactor App.tsx:**

- Replace each synced `useState` with `useStorage(root => root.someField)`
- Replace each synced `useCallback` / setter with `useMutation(({ storage }, ...args) => { ... })`
- Keep all UI-interaction state (`placingBird`, `layingEggs`, `discardModal`, etc.) as local `useState`
- Mutations must be atomic: e.g., "draw a card" should read the top of the deck AND remove it AND add to hand in a single `useMutation` call

**Refactor `BirdFeeder`:**

- The feeder currently manages its own `useState` for dice. Move `feederDice` and `takenDice` to Liveblocks storage so all players see the same feeder state.
- `reroll`, `takeDie` become `useMutation` calls.
- Dice positions (`positionsRef`) can remain local since they're purely visual.

**Handle initial room setup:**

- When a client joins and `storage.initialized` is `false`, it shuffles decks and writes initial state, then sets `initialized = true`
- When a client joins and `initialized` is already `true`, it just reads existing state
- Use a `useMutation` for initialization so it's atomic

**Add a loading state** while Liveblocks is connecting (show a spinner or "Connecting…" message).

**Verify:** The app should work exactly as before for a single user, but state is now persisted in Liveblocks. Opening two browser tabs to the same URL should show the same game state in both, and actions in one tab should reflect in the other.

---

### Step 2: Support Multiple Players

**Goal:** Change the data model from a single `player` to multiple players. Each browser session maps to one player and can only modify their own data.

**Change `Storage` type:**

- Replace `player: Player` with `players: Record<string, Player>` (keyed by player ID, e.g., `"player1"`, `"player2"`, etc.)

**Add a local player identity:**

- On page load, the user must select which player they are (simple dropdown or button group: "Player 1", "Player 2", etc., up to 5)
- Store the selected player ID in a React context or local state (e.g., `currentPlayerId`)
- This selection can be stored in `localStorage` so it persists across refreshes

**Create a `useCurrentPlayer` hook** that:

- Reads `currentPlayerId` from context
- Returns the current player's data via `useStorage(root => root.players[currentPlayerId])`
- Returns a `mutatePlayer` function that scopes all mutations to the current player's key

**Update all player mutations** to scope to `currentPlayerId`:

- e.g., `storage.get("players").get(currentPlayerId).get("birdHand")` in `useMutation`
- Only the current player's data should be written to

**Update callbacks that touch both shared and player state:**

- `drawCard`: pops from shared `birdDeck`, pushes to `players[currentPlayerId].birdHand` — must be a single `useMutation`
- `trayAddToHand`: removes from shared `birdTray`, adds to current player's hand
- `drawBonusCard`: pops from shared `bonusDeck`, adds to current player's hand
- `discardBird`: removes from current player's hand, pushes to shared `birdDiscard`
- `placeOnRoundEndBoard`: deducts from current player's cubes, adds their color to shared `roundEndSpots`
- etc.

**Verify:** Multiple tabs can each select different players. Each tab only modifies its own player's state. Shared resources (decks, trays, feeder, discard piles) update across all tabs.

---

### Step 3: Add Lobby Page

**Goal:** Add a pre-game lobby where players join, set their name and cube color, and one player starts the game.

**Add a `gamePhase` field to `Storage`:** `"lobby" | "playing"`

**Create a `Lobby` component** (`src/components/Lobby.tsx`):

- Shows a list of connected players with their names and chosen colors
- Each player can edit their own name (text input) and color (color picker or preset palette matching Wingspan cube colors: white, black, red, blue, yellow, purple)
- Colors already taken by another player should be disabled/grayed out
- A "Start Game" button (visible to all, clickable by anyone) that:
  - Shuffles decks and initializes all shared state
  - Sets `gamePhase` to `"playing"`
  - Creates a `Player` entry in `players` for each connected player

**Use Liveblocks presence** to track who's in the lobby:

- Each client broadcasts `{ name, color, ready }` as presence
- The lobby displays this in real time
- When the game starts, presence data is used to create the `players` map in storage

**Update App.tsx:**

- Read `gamePhase` from storage
- If `"lobby"`, render `<Lobby />`
- If `"playing"`, render the current game UI

**Add a "Reset Game" button** (during gameplay or post-game) that:

- Clears all storage
- Sets `gamePhase` back to `"lobby"`

**The player identity selected in the lobby replaces the step 2 dropdown.** Remove the temporary player-selection UI from step 2.

**Verify:** Players can join the lobby, pick name/color, and start a game. After starting, all players see the game board with their own data.

---

### Step 4: Board Viewing and UI-Level Privacy

**Goal:** Let players view other players' boards (read-only). Hide other players' hands. Prevent interaction with other players' boards/supplies.

**Add a player-switcher/viewer in the game UI:**

- Show tabs or buttons with each player's name/color at the top of the screen
- The current player's tab is always selected by default
- Clicking another player's tab shows that player's board in a read-only view

**When viewing another player's board:**

- Render their `GameBoard` with their player data (from `storage.players[viewedPlayerId]`)
- Disable all interaction: no click handlers, no hover effects, no placing/tucking/etc.
- Pass a `readOnly={true}` prop to `GameBoard` and relevant sub-components, which disables all `onClick`/`onAction` callbacks
- Hide the hand dock (their `birdHand` and `bonusHand` should not be shown)
- Show their food supply, action cubes, habitats, played birds, hummingbird track — all visible but non-interactive

**When viewing your own board:**

- Everything works as normal (full interactivity)
- Your hand dock is visible at the bottom

**Shared resources (bird tray, feeder, decks, discard piles, round-end board):**

- These are always visible and interactive regardless of which player tab is selected
- They are global and not per-player

**Add visual indicators for other players' cubes:**

- On the round-end goal board, cubes are already color-coded — no change needed
- On habitats, the action cube color already comes from the player's `cubeColor`

**Verify:** Players can click between tabs to view each other's boards (read-only). Hands are hidden. Shared resources remain interactive. Own board is fully interactive.
