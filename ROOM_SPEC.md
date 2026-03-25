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
- `maxPlayers`: int (fixed to 4)
- `isPrivate`: boolean (host-only toggle)
- `players`: list of player entries
- `playerIds`: list of unique player ids (for membership lookups)
- `settings`: game settings snapshot at create/start
- `totals`: list[4] of cumulative scores for the room
- `roundCount`: int (completed rounds)
- `game`: game state (present when playing/finished)
- `gameVersion`: int (increments on every game update)

Player entry schema (in `players` list):
- `uid`: string (`uid:<firebase uid>` or `guest:<session>`; bots use `bot:<seat>:<name>`)
- `name`: string
- `gender`: string (`male` | `female`)
- `picture`: string (photo URL if available)
- `ready`: boolean
- `isHost`: boolean (only on initial entries)
- `seat`: int (0..3)
- `lastSeen`: int (ms; presence ping)

Settings snapshot (`settings`):
- `language`: `en` | `zh-HK`
- `aiDifficulty`: `easy` | `normal` | `hard`
- `backColor`: card back choice
- `soundEnabled`: boolean
- `calloutDisplayEnabled`: boolean
- `emoteDisplayEnabled`: boolean
- `calloutVoiceMode`: `auto` | `off`
- `calloutStylePack`: `classic` | `energetic` | `minimal` (stored even though UI is fixed)
- `gender`: `male` | `female`
- `avatarChoice`: `male` | `female` | `google`
- `turnTimeout`: int (ms; default 20000; clamped 5000..60000)

User pointer (signed-in only):
- Collection `big2Users/{uid}`:
  - `currentRoomId`: string
  - `updatedAt`: int (ms)

Game logs:
- Collection `big2GameLogs/{roomId_gameVersion}` stores round history, players, totals, settings, and summary.

## Flow

Create room:
1. `createRoom()` generates a code and writes a new room doc with host in `players`.
2. Host is `ready` by default.
3. `expiresAt` is set to now + 2 hours.
4. `totals` is initialized to `[5000,5000,5000,5000]` and `roundCount` to `0`.
5. `settings` is a snapshot of `collectMainSettings()`.

Join room (sign-in required):
1. `joinRoomByCode()` validates status (`lobby` | `starting` | `finished`).
2. Seat is assigned to the lowest available seat (0..3).
3. New joiners are `ready` by default.
4. Guest reconnection: if a guest with matching name/gender/picture is active, it reuses that entry.
5. If the room was `finished`, `gameVersion` is bumped on join.

Lobby (sign-in required):
- `roomReady` toggles player ready state.
- Host can toggle `isPrivate`.
- Host presses `roomStart` to begin:
  - Requires at least 2 human players.
  - All human players must be ready (host is allowed to start even if not ready).
- Status flows: `lobby` -> `starting` -> `playing` (finalized after ~200ms).
- Leave button is disabled while `status=starting`.
- Signed-in users can only be in one room at a time (`big2Users.currentRoomId`).

Game start:
- `buildRoomGameState()` creates a full game state with 4 seats.
- Missing seats become bots.
- `gameVersion` increments with every game update.
- `game.turnStartedAt` is set when a turn begins.
- `game.lastMove` stores the most recent move for UI sync.
- `game.playerActionLog` stores the last action per seat.
- `game.handCount` stores remaining card counts per seat.

Gameplay:
- `roomSubmitPlay()` and `roomSubmitPass()` are the only writers.
- Each move is applied via Firestore transaction on the shared `game`.
- Bots are driven by `maybeRunRoomAi()` on any client.
- Turn timeout uses `settings.turnTimeout` + 2s grace.
  - If timed out while leading, the client attempts the weakest legal play.
  - If timed out while responding, the client attempts a pass.
- Room emotes are stored in `game.emote` and synced to all clients.

Game end:
- Room status is set to `finished`.
- `expiresAt` becomes now + 10 minutes.
- `totals` is updated and `roundCount` increments.
- A game log snapshot is written to `big2GameLogs/{roomId_gameVersion}`.

## Presence, Prune, and Host Migration

Presence:
- `startRoomPresencePing()` updates `lastSeen` every 5s.
- Offline indicator triggers when `lastSeen` is older than 15s (playing only).

Prune:
- Lobby/starting: players inactive for 5 minutes are pruned.
- Playing: players inactive for 30s are pruned.
- Stale room detection uses `updatedAt` (30s threshold) to display a stale warning.

Host migration:
- While not playing, host is reassigned if missing or stale (>45s).
- Candidate must be an active human seen within 20s.
- While playing, if host leaves, host is migrated to the first active human.
- If no human players remain, the room is deleted.

Replacement:
- During `playing`, pruned or leaving players are replaced with bots.
- A system log entry is appended when a player joins/leaves during active play.

## UI

Room UI is rendered in `renderHome()`:
- Room buttons in "Room Settings"
- Lobby overlay when `status=lobby` or `status=starting`
- Join modal for code entry
- Active room list (up to 4 entries) with status, round, seat avatars, and private lock
- Private rooms are listed with a lock and are not joinable without code

In-game:
- Center panel shows room code, host name, round number, and countdown.
- Host is highlighted in the lobby seats.
- Offline players are shown dimmed during play.

Rematch:
- In room mode, the result "Continue" button:
  - Host calls `restartRoomGame()` (starts a new round with the same players).
  - Joiners set ready and wait for host.
