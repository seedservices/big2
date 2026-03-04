# Big Two Web App Functional Specification

## 1. Purpose
This document defines the functional behavior of the Big Two web application from a user and game-flow perspective.

## 2. Supported Platforms
- Desktop web browsers
- Mobile phones (portrait-focused gameplay)
- Tablets (portrait and landscape with responsive layout rules)

## 3. Language and Localization
- Supported UI languages:
  - Traditional Chinese (`zh-HK`)
  - English (`en`)
- Core game UI, guide, leaderboard labels, and legal sections are bilingual.

## 4. Main User Flows
- Enter home screen
- Configure player and game options
- Sign in (Google / Apple options supported in UI flow)
- Start a new game
- Play turns until round completion
- View result, score changes, and game logs
- Start another game or return to home

## 5. Home Screen Features
- Player name input
- Sign-in area near player name
- Gender/avatar selection
- Card-back selection
- AI difficulty selection
- Sound effects toggle
- Start game button
- Legal mini panels:
  - Privacy Policy
  - About
  - Contact
  - Terms
- Guide, scoring, leaderboard, and language controls

## 6. Sign-In Behavior
- App supports signed-in session behavior via provider identity.
- Logged-in email is retained for session restoration.
- Provider status is shown inline on home screen.
- Sign-out is supported from the home login area.

## 7. Game Screen Features
- Four-seat Big Two table (S/E/N/W)
- Turn-based play controls:
  - Play
  - Pass
  - Recommend
  - Auto sort (sequence / pattern)
- Hand-card select/deselect interactions
- Drag-and-reorder support (where applicable)
- Active-seat visual indication
- Discard and status game log
- Guide/scoring/leaderboard overlays available in-game

## 8. Rules and Validation (Functional)
- Opening first trick must include `♦3`.
- Follow play must match card count:
  - Single / Pair / Triple / 5-card hand
- Valid 5-card categories:
  - Straight, Flush, Full House, Four of a Kind, Straight Flush
- Suit order is applied where relevant:
  - `♦ < ♣ < ♥ < ♠`
- Pass is blocked while holding lead.
- Invalid play attempts return status feedback.

## 9. AI Difficulty (Functional)
- Difficulty options:
  - Beginner
  - Intermediate
  - Advanced
- Recommendation behavior is available to player.
- Bot strategic detail is documented separately in:
  - `GAME_BOT.md`

## 10. Scoring (Functional)
- Round ends when one player empties all cards.
- Losers receive deductions by remaining-card rules and multipliers.
- Winner gains total deductions from all losers.
- Scoring guide modal explains:
  - Base multipliers by remaining cards
  - Penalty multipliers (e.g., holding `2`, `♠2`)
  - Stacking behavior of multipliers

## 11. Leaderboard and Profile Behavior
- Leaderboard supports:
  - Sorting
  - Period filters
  - Refresh
- Profile-linked stats include score, wins, games, and derived metrics.
- Home/game interactions update profile and leaderboard data according to app flow.

## 12. Audio and Speech
- Sound effects can be enabled/disabled by user toggle.
- Callout speech support depends on browser capability and runtime readiness.
- First-user-interaction unlock pattern is used for web audio/speech constraints.

## 13. Ads (Functional)
- Start new game flow includes popunder ad trigger behavior as configured by integration logic.

## 14. Responsive and Orientation Behavior
- Mobile phone landscape is restricted by orientation block flow.
- Layout adapts across phone/tablet/desktop breakpoints.
- Game log and seat-panel layout behavior changes by viewport class.
- Web-view small-size guard can block gameplay below configured minimum viewport.

## 15. Non-Functional UX Expectations
- Minimize unintended scrollbars where possible.
- Keep interaction latency low and feedback immediate.
- Preserve layout stability when toggling log and overlays.

