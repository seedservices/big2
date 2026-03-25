# Big Two Web App Functional Specification

## 1. Purpose
This document defines the functional behavior of the Big Two web application from a user and game-flow perspective.

## 2. Supported Platforms
- Desktop web browsers
- Tablets (portrait and landscape with responsive layout rules)
- Mobile phones (portrait gameplay; phone landscape shows an orientation block)

## 3. Language and Localization
- Supported UI languages:
  - Traditional Chinese (`zh-HK`)
  - English (`en`)
- Core UI, guides, leaderboard labels, and legal sections are bilingual.

## 4. Main User Flows
- Enter home screen
- Google sign-in (required to start games)
- Configure player and system settings
- Start a solo game
- Open lobby, create/join a room
- Play turns until round completion
- View result, score changes, and game logs
- Start another game or return to home/lobby

## 5. Home Screen Features
- Player name input
- Gender/avatar selection (male/female; Google avatar when signed in)
- AI difficulty selection
- Card-back selection
- System settings:
  - Audio & Voice toggle (sound effects + callout voice)
  - Callout display toggle
  - Emote display toggle
- Start game (solo)
- Room lobby entry + create/join controls (sign-in required)
- Active room list with status/round, seat count, and private lock
- Guide, scoring, leaderboard, opponents (hash-gated), and language controls
- Legal mini panels:
  - Privacy Policy
  - About
  - Contact
  - Terms

## 6. Sign-In Behavior
- Google Identity Services inline sign-in on home
- Signed-in email is stored locally for session restoration
- Firebase auth is used when available; profile + leaderboard sync on sign-in
- Sign-out is supported from the home login area
- Sign-in is required to start solo or room games

## 7. Game Screen Features
- Four-seat Big Two table (S/E/N/W)
- Turn-based play controls:
  - Play
  - Pass
  - Recommend
  - Auto sort (single button toggles sequence/pattern)
- Emote picker; selected sticker appears near the seat and (for self) at table center, auto-clears after ~2.4s, and triggers SFX when audio is enabled
- Callout bubbles for play/pass/last/must-3; gated by Callout Display toggle
- Hand-card select/deselect interactions
- Drag-and-reorder support (desktop)
- Active-seat visual indication
- Discard and status game log
- Recommendation feedback:
  - When recommendation is playable, Play button glows
  - When recommendation is pass, Pass button glows
- Guide/scoring/leaderboard overlays available in-game

## 8. Rules and Validation (Functional)
- Opening first trick must include `♦️3`.
- Follow play must match card count:
  - Single / Pair / Triple / 5-card hand
- Valid 5-card categories:
  - Straight, Flush, Full House, Four of a Kind, Straight Flush
- Suit order is applied where relevant:
  - `♦️ < ♣️ < ♥️ < ♠️`
- Pass is blocked while holding lead.
- Invalid play attempts return status feedback.

## 9. AI Difficulty (Functional)
- Difficulty options:
  - Novice (`easy`)
  - Skilled (`normal`)
  - Veteran (`hard`)
- Applies to solo bots and room bots.
- Recommendation uses hard-tuned logic regardless of selected AI level.

## 10. Scoring (Functional)
- Round ends when one player empties all cards.
- Base deduction by remaining cards:
  - 1-9 cards: base `= remaining * 1`
  - 10-12 cards: base `= remaining * 2`
  - 13 cards: base `= remaining * 3`
- Penalty multipliers (stacking):
  - Holding any `2`: x2
  - Holding `♠️2` (top two): x2
  - Chao multiplier by remaining cards:
    - 8-9 cards: x2
    - 10-11 cards: x3
    - 12 cards: x4
    - 13 cards: x5
- Winner gains total deductions from all losers.
- Last-card breach rule:
  - If the next player has 1 card and you do not play the strongest legal response, a breach is recorded.
  - If the threatened seat then wins, all deductions transfer to the violator.

## 11. Leaderboard and Profile Behavior
- Identity uses signed-in Google email when available; otherwise a name-based identity.
- Profile settings synced include language, AI difficulty, card back, audio/callout/emote toggles, gender, avatar choice, and turn timeout.
- Solo and room game results update totals, wins, games, and deltas.
- Leaderboard supports sorting, period filters, and refresh.

## 12. Audio and Speech
- Audio toggle enables/disables SFX and callout voice.
- Callout voice mode is auto when audio is enabled, off when disabled.
- Callout speech prefers recorded clips when available; falls back to Web Speech or tone if needed.
- Callout speech in solo is gated until the first play of the round.
- First-user-interaction unlock pattern is used for web audio constraints.

## 13. Responsive and Orientation Behavior
- Mobile phone landscape is restricted by an orientation block flow.
- Layout adapts across phone/tablet/desktop breakpoints.
- Game log and seat-panel layout behavior changes by viewport class.
- Web-view small-size guard can block gameplay below configured minimum viewport.

## 14. Non-Functional UX Expectations
- Minimize unintended scrollbars where possible.
- Keep interaction latency low and feedback immediate.
- Preserve layout stability when toggling log and overlays.
