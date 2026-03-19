# Room Setup Spec

This document describes the room (lobby + multiplayer) implementation.

## Storage

Rooms are stored in Firestore collection `big2Rooms`. Rules live in `firebase/firebase.rules`.

Room document schema (current):

- `hostId`: string (current room host id)
- `hostName`: string
- `code`: string (join code)
- `status`: string: `lobby` | `starting` | `playing` | `finished`
- `createdAt`: int (ms)
- `updatedAt`: int (ms)
- `expiresAt`: int (ms; TTL cleanup target)
- `maxPlayers`: int (2..4)
- `players`: list of player entries
- `settings`: game settings snapshot at create time
- `totals`: list[4] of cumulative scores for the room
- `roundCount`: int (completed rounds)
- `game`: game state (present when playing)
- `gameVersion`: int (increments on every game update)

Player entry schema (in `players` list):

- `uid`: string (room identity; `uid:<firebase uid>` or `guest:<random>`)
- `name`: string
- `gender`: string (`male` | `female`)
- `picture`: string (photo URL if available)
- `ready`: boolean
- `isHost`: boolean (only on initial entries)
- `seat`: int (0..3)
- `lastSeen`: int (ms; presence ping)

User pointer (signed-in only):

Collection `big2Users/{uid}`:
- `currentRoomId`: string
- `updatedAt`: int (ms)

## Flow

Create room:

1. `createRoom()` generates a code and writes a new room doc with host in `players`.
2. Host is `ready` by default.
3. `expiresAt` is set to now + 2 hours (for TTL cleanup).
4. `totals` is initialized to `[5000,5000,5000,5000]` and `roundCount` to `0`.

Join room:

1. `joinRoomByCode()` transaction adds player entry, assigns seat 0..3.
2. `subscribeRoom()` listens to doc updates.
3. Join modal shows a live select list of joinable lobby rooms (code + host + count).

Lobby:

- `roomReady` toggles player ready state.
- Host presses `roomStart` -> `startRoom()` builds and writes `game`.
  - `settings.turnTimeout` is included in the room settings (default 20000ms).
- Status flows: `lobby` -> `starting` -> `playing`.
- Lobby list highlights the current host.
- Ready/leave buttons are disabled while `status=starting`.
- Start requires at least 2 human players and both must be ready.
- Signed-in users can only be in one room at a time (enforced via `big2Users.currentRoomId`).

Game start:

- `buildRoomGameState()` creates a full game state with 4 seats.
- Any missing seats become bots.
- `gameVersion` increments with every game update.
- `game.turnStartedAt` is set when a turn begins.
- `game.lastMove` stores the most recent move for UI sync.
- `game.playerActionLog` stores the last action per seat.
- `game.handCount` stores remaining card counts per seat.

Game sync:

- All clients listen with `subscribeRoom()`.
- When `status=playing` or `status=finished`, `applyRoomGameSnapshot()` replaces local state.

Gameplay:

- `roomSubmitPlay()` and `roomSubmitPass()` are the only writers.
- Each move is applied via Firestore transaction on the shared `game`.
- Bots are driven by `maybeRunRoomAi()` on any client.
- If a human exceeds `turnTimeout`, any client can force a pass for that seat.
- UI uses a `turnTimeout + 2s` grace window before timing out.
- If a human times out while leading (no lastPlay), a small legal play is auto-fired.
- `lastMove.ts` is used for near-real-time UI animations (1s window).
- Clients trigger local SFX based on `lastMove.type` (play/pass/win).
- When a room game ends, the room doc updates `totals` and increments `roundCount`.
- If a player joins or leaves during `playing`, a system log entry is appended to the game log.

## Presence and Replacement

Presence:

- `startRoomPresencePing()` updates `lastSeen` every 15s.
- Players are marked offline after 15s without a ping.
- Players are pruned after 60s without a ping.

Replacement:

- On each room snapshot, `syncRoomGameRoster()` removes players with
  `lastSeen` older than 60s (only during `playing`) and replaces them with bots.
- Removed entries are also pruned from the `players` list.
- If the host times out, host is migrated to the first active player.
- If the host leaves, host is migrated to the next remaining player (no auto-delete).
- If a player leaves during an active game, their seat is converted to a bot immediately.
- If the host leaves and no human players remain, the room is deleted.
- If a room has no human players (lobby/starting/playing), it is deleted.

## Score / Leaderboard

At game end:

- `applyRoomGameSnapshot()` records the local player's delta to the leaderboard.
- This happens once per game using `roomId + gameVersion` as a guard.
- Room status is set to `finished` and `expiresAt` becomes now + 10 minutes.
- A game log snapshot is written to `big2GameLogs/{roomId_gameVersion}`.

## UI

Room UI is rendered in `renderHome()`:

- Room buttons in "Room Settings"
- Lobby overlay when `status=lobby` or `status=starting`
- Join modal for code entry
- Room code is displayed in a centered green label
- Host is highlighted in the lobby list
- Offline players are shown dimmed
- In-game center panel shows room code, host name, round number, and countdown

Room avatars:

- Lobby list shows player photo if available
- In-game opponent avatars use `picture` from room `game.players`

Rematch:
- In room mode, the result "Continue" button:
  - Host calls `restartRoomGame()` (starts a new round with the same players).
  - Joiners set ready and wait for host.

Zombie room handling (recommended):
- If all players are offline, a scheduled Cloud Function can advance AI turns.
- TTL cleanup uses `expiresAt` for automatic deletion.
