# GAME_BOT.md

## Scope
This document describes exactly how the Big Two bots and the in-game recommendation system work in the current codebase (`src/main.js`).

## Where Logic Lives
- Main bot decision entry: `chooseAiPlay(hand, game, diff)`
- Legal move generation: `legalTurnPlays(hand, game)` -> `allValidPlays(hand)`
- Recommendation entry: `suggestPlay(hand, lastPlay, isFirstTrick, game)`
- Recommendation pass heuristic: `shouldRecommendPass(hand, lastPlay, isFirstTrick, canPass, game)`

## Shared Concepts
- A move is represented as `{ cards, eval }` where `eval` contains hand validity/type/power metadata.
- Legal moves are filtered by:
  - First-trick rule (`must contain 3 of diamonds`)
  - Beat rule (must beat current `lastPlay` if there is one)
- 5-card type ordering uses `FIVE_KIND_POWER`:
  - `straight < flush < fullhouse < fourofkind < straightflush`

## Difficulty Levels

### Easy
Behavior is intentionally weak and noisy.

Decision path:
1. Build legal moves.
2. Sort by weakest power first.
3. Random choice:
- 70%: choose random from up to the 4 weakest legal moves.
- 30%: choose random from all legal moves.

Impact:
- Frequently burns tempo on weak singles/pairs.
- Often misses higher-value combo timing.

### Normal
Behavior is mostly efficient with controlled randomness.

Extra pressure rule:
- If next player has 1 card (`shouldForceMaxAgainstLastCard`), 60% chance to force strongest legal move.

Leading (no `lastPlay`):
1. Score each legal move using `leadScore`.
2. Prefer high-value combo progress while preserving premium resources.
3. Randomized top-pick policy:
- 20%: random from top 3 scored
- 80%: random from top 2 scored

Responding (there is `lastPlay`):
1. Compute `respondCost` for each legal move.
2. Prefer minimal-cost winning response.
3. 18% variability: random from best 3, otherwise pick best.

Impact:
- Strong baseline play with occasional non-deterministic variation.

### Hard
Behavior is strongest and deterministic at key branches.

Priority rules:
1. If leading and not easy mode, run finish-plan shortcut (`forceFinishPlanPlay`):
- Try to play an unbeatable single now so the remaining hand becomes a valid one-shot finish group (1/2/3/5 cards).
2. If next player has 1 card, always play strongest legal move.
3. Otherwise:
- Leading: take top `leadScore` move directly.
- Responding:
  - If hand size <= 4, use strongest response (`byMaxPower`) to keep tempo.
  - Else use lowest `respondCost` response.

Impact:
- Most consistent and punishing level.
- Aggressive endgame denial when someone is on last card.

## Heuristics Used by Normal/Hard

### `leadScore(play)`
Components:
- Base by card count: 5-card > triple > pair > single.
- 5-card kind bonus from `FIVE_KIND_POWER`.
- Penalties for prematurely spending high cards.
- Penalty for breaking duplicates into singles too early.
- Bonus for low-rank singles when safe.
- Bonus for closeout (small hand with combo play).

### `respondCost(play)`
Components:
- Penalize breaking duplicates for single responses.
- Penalize spending high cards while hand is still large.
- Additional cost for spending 5-card response.

Design intent:
- Win tricks while preserving future structure and finish potential.

## Last-Card Threat Rule
- Trigger: next seat has exactly 1 card.
- Hard: always max-pressure move.
- Normal: max-pressure move with 60% chance.
- Easy: no specific threat logic.

## Recommendation System (Player Assist)

### Current Level
Recommendation is tuned to highest level available:
- `suggestPlay(..., game)` now runs the hard bot logic (`chooseAiPlay(..., 'hard')`) using current game state.
- If no valid hard recommendation emerges, it falls back to a deterministic legal-power heuristic.

### Pass Suggestion
`shouldRecommendPass(...)` still applies conservation rules after computing a recommended play:
- Suggest pass if no valid recommended play.
- Suggest pass in selected high-cost response scenarios, e.g.:
  - Recommended single is very high rank with sufficiently large hand.
  - Recommended pair is very high rank with sufficiently large hand.

### Recommendation vs Menu Difficulty
- Menu difficulty controls AI opponents only (`state.home.aiDifficulty` -> `state.solo.aiDifficulty` -> `chooseAiPlay` for bot turns).
- Recommendation does not use menu difficulty; it is hard-tuned regardless of selected AI level.

## Randomness Summary
- Easy: high randomness.
- Normal: moderate randomness.
- Hard: mostly deterministic (except upstream randomness in game flow/deal, not move selection branch choice).

## Operational Notes
- Bots use full internal game state available in the runtime.
- Recommendation now also uses game-state context for hard-level suggestions.
- Because recommendation is re-runnable, repeated clicks can return different outputs when game state or selected cards changed between renders/events.
