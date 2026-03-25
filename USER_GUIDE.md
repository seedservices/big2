# Big Two Web App User Guide

## Quick Start
1. Sign in (required to start games). Leaderboard sync requires Google sign-in.
2. Enter your name, select gender/avatar, card back, and AI difficulty.
3. Toggle Audio & Voice, Callout Display, and Emote Display as desired.
4. Tap `Start Game` for solo or open the Lobby to create/join a room.

## Game Controls
- `Play`: Submit selected cards.
- `Pass`: Skip your turn if you are not the lead.
- `Recommend`: Highlights a suggested play.
  - If the recommendation is a playable set, the `Play` button glows.
  - If the recommendation is a pass, the `Pass` button glows.
- `Auto Sort`: Toggles between sequence and pattern ordering.
- `Emote`: Opens a sticker picker. Selected stickers appear on the table and auto-clear.
- Tap cards to select/unselect. Drag to reorder on desktop.

## Game Flow
- The opening play must include `♦️3`.
- Follow with the same number of cards (single/pair/triple/5-card hand), or pass.
- After three passes, the last successful player leads again.
- The round ends when one player empties their hand.

## Hong Kong Style Rules
- `2` is the highest single (with `♠️2` as the top single).
- Straights rank from `3-4-5-6-7` (lowest) up to `A-2-3-4-5` (highest).
- If two straights tie by ranks, compare the highest card’s suit.
- Flushes compare suit first, then ranks (Hong Kong priority).
- Invalid wrap straights: `J-Q-K-A-2`, `Q-K-A-2-3`, `K-A-2-3-4`.

## Scoring Summary
- Base deduction by remaining cards:
  - 1-9 cards: remaining x1
  - 10-12 cards: remaining x2
  - 13 cards: remaining x3
- Penalty multipliers stack:
  - Any `2`: x2
  - `♠️2` (top two): x2
  - Chao multiplier by remaining cards:
    - 8-9: x2
    - 10-11: x3
    - 12: x4
    - 13: x5
- Winner gains the total deductions from all losers.
- Last-card breach rule:
  - If the next player has 1 card and you do not play the strongest legal response, a breach is recorded.
  - If the threatened seat then wins, all deductions transfer to the violator.

## Callouts and Audio
- Audio toggle enables/disables sound effects and callout voice.
- Callout speech prefers recorded clips and falls back to Web Speech when needed.
- Solo callouts begin after the first play of a new round.

## Game Log
- The right-side log shows plays and passes with card thumbnails.
- Use the log header to expand/collapse the panel.

## Results
- The result screen shows winner, score change, remaining cards, and last discard.
- Cards in the result view use the same size/overlap style as the game log.

## Scoring Guide
- Open `Scoring` from Home or in-game to see full scoring rules and multipliers.

## Leaderboard
- Sorting and period filters are available.
- Use `Refresh` to fetch latest data.
- Sign-in is required to sync leaderboard data.

## Rooms and Lobby
- The lobby list includes tables already in progress.
- Private tables show a lock and require a join code.
- In a room, tap `Ready`; the host presses `Start` when at least 2 players are ready.
