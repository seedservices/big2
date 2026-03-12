# Big Two Web App Technical Specification

## 1. Technology Stack
- Runtime: Browser (client-side app)
- Language: JavaScript (ES modules)
- Build tool: Vite (`vite` dev/build/preview)
- Styling: CSS (single main stylesheet with responsive media rules)

## 2. Project Structure (Key Files)
- `src/main.js`
  - Core application state
  - Rendering functions
  - Game logic and validation
  - AI decision logic
  - Input/event handling
  - Auth/session integration logic
- `public/style.css`
  - Theming
  - Home/game layouts
  - Responsive behavior for phone/tablet/desktop
  - Overlay and modal styles
- `public/`
  - Card assets
  - Avatar assets
  - Fonts and background assets

## 3. Application Architecture
- Single-page client app with state-driven rendering.
- Main state object stores:
  - UI state (screen, language, overlays, log)
  - Home settings (name, gender/avatar, difficulty, card back, theme, sound)
  - Session identity data
  - Solo game runtime (players, turn, last play, history, score)
- Render pipeline:
  - `render()` dispatches to screen-specific renderers:
    - `renderHome()`
    - `renderConfig()`
    - `renderGame()`
- View updates are achieved by HTML template regeneration and event rebinding.

## 4. Core Game Engine
- Deck/model:
  - 52-card deck, no jokers
  - Rank order encoded for Big Two behavior
- Rule evaluation:
  - `evaluatePlay(cards)` validates play type and power
  - `canBeat(candidate, target)` compares legal responses
  - First trick enforcement (`♦3`)
  - Pass validity checks by lead state
- Turn progression:
  - Human action and AI turns update shared game state
  - Round completion triggers scoring and result view

## 5. AI System
- Main selector:
  - `chooseAiPlay(hand, game, diff)`
- Difficulty modes:
  - `easy`, `normal`, `hard`
- Strategy includes legal-play generation and mode-weighted decision behavior.
- Recommendation feature reuses high-quality decision path logic.
- Detailed bot strategy documentation:
  - `GAME_BOT.md`

## 6. Input and Interaction Layer
- Card interactions:
  - Click/tap selection
  - Drag reorder where enabled
- Mobile-specific handling:
  - Pointer/touch movement thresholds
  - Tap de-duplication window
- UI controls:
  - Play/pass/recommend/auto-sort
  - Modals and toggles
  - Log expand/collapse state handling

## 7. Responsive and Layout System
- CSS breakpoints split mobile/tablet/desktop behavior.
- Orientation logic:
  - Mobile-phone landscape restriction block
  - Tablet/desktop behaviors differ by media queries
- Dynamic viewport sync:
  - `syncViewport()` updates runtime CSS variables and orientation attributes
- Small desktop/web viewport guard:
  - Runtime attribute flags (`data-web-too-small`)
  - Interaction-blocking overlay in game screen

## 8. Authentication and Session
- Provider-aware session model with profile identity abstraction.
- Session persistence constraint:
  - Local persistence for logged-in email restoration
- Sign-in state impacts:
  - Home UI provider badge/state
  - Profile sync and leaderboard identity

## 9. Data and Persistence
- Local runtime store for leaderboard/profile cache behavior
- Cloud persistence integration via Firebase/Firestore paths
- Sync operations include:
  - Profile hydration
  - Round-result updates
  - Leaderboard refresh/sorting/period filtering

## 10. Audio and Speech Subsystem
- Sound engine via Web Audio API context
- Runtime unlock on first user interaction
- Callouts use recorded audio clips only (no TTS path).
- Audio lookup supports variant clip keys for pass/last/play/winner lines.
- Callouts are gated until the first play of a new round.

## 11. Ads Integration
- Popunder ad script source defined in app constants
- Trigger path connected to start/restart new-game interactions

## 12. Security and Integrity Considerations
- UI-level guardrails for illegal moves and invalid actions
- Leaderboard/profile writes use identity-based document keys
- Client-side app: authoritative anti-cheat guarantees are limited by architecture

## 13. Operational Constraints
- Browser capability variability (audio, speech, font rendering, pointer model)
- Device and viewport diversity requires conditional CSS and runtime guards
- Performance sensitivity:
  - Frequent re-rendering and event rebinding
  - Asset-heavy card/table UI

## 14. Build and Run
- Development:
  - `npm run dev`
- Production build:
  - `npm run build`
- Local preview:
  - `npm run preview`
