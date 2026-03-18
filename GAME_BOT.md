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
- 5-card generation preserves power while conserving resources:
  - For `fourofkind`, only one representative is kept per four-rank, preferring the smallest non-2 kicker when available.
  - For `fullhouse`, only one representative is kept per triple-rank, preferring the smallest non-2 pair when available.
- Straight comparison for equal ranks uses the suit of the highest card in the straight (Hong Kong rule).
- Flush comparison uses suit priority first (Hong Kong rule), then ranks.
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

Hard-mode safety tweak:
- When forcing max against a 1-card opponent, if the strongest legal move is a single 2 and your hand size > 1, prefer the strongest non-2 single instead (to avoid burning a 2 when it cannot finish the hand).

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

### Recommendation Filters (Before Scoring)
- Generate all valid plays from current hand.
- If first trick: keep only plays containing 3♦.
- If responding: keep only plays that beat `lastPlay`.
- If first trick and leading and `hasControlCheck(hand)` is false, remove any play that uses a 2.

### Scoring Model (`recommendPlayScore`)
All legal plays are scored and the highest score is recommended.

Base progression and structure:
- Cards used: `(startLen - endLen) * 48`
- Remaining pairs: `+8` each
- Remaining triples: `+10` each
- Remaining five-card hands: `+25` each
- Remaining high singles: `-7` each
- Remaining 2s: `-12` each
- Remaining top 2 (♠2): `-10` each
- Lead options: `+min(14, leadOptions * 0.45)`
- Full house preservation: if the pair in a full house comes from a rank that was already a triple in the original hand (breaking another triple), `-30`.

Responding to a `lastPlay`:
- If opponents are close (`oppMin <= 2`): stronger replies score higher by `+idx * 5`
- Otherwise: conserve power, `+(orderedByWeak.length - 1 - idx) * 3`
- If max rank >= Q and hand size > 4: `-8`
  - If single breaks a pair and remaining hand size > 3: `-14`
- If single uses highest card and hand size > 3: `-16`

Leading (no `lastPlay`):
- By count: single `-5`, pair `+5`, triple `+8`, five-card `+11`
- If max rank >= Q and hand size > 5: `-10`
- Lowest single: `+2`
  - Using any 2: `+12` if blitz is active, otherwise `-18`
  - If control check is active and leading with a single or pair of 2s, add `+10` to enable blitz play.
- If the play is a spade flush, add `+12` to reflect near-absolute lead control.
- Blitz is active when `hasControlCheck(hand)` is true or `oppMin <= 2`
- If `oppMin <= 2` (threat mode):
- If `oppMin <= 2` and max rank >= Q: `+8`; else if max rank >= 10: `+4`
- If `oppMin <= 2` and a single uses the highest card: `+6`
- Bait logic: if leading, holding at least two 2s including ♠2, and the play is a non-2 pair, add `+10` to encourage baiting with a smaller pair.

  Global modifiers:
  - If `shouldForceMaxAgainstLastCard` is true and not the strongest legal play: `-28`
  - If `shouldForceMaxAgainstLastCard` is true and strongest: `+8`
  - If a full house or four of a kind uses a 2 as the kicker (four of a kind) or the pair (full house) and the hand does not finish, apply `-28`.
  - If a non-five-card play reduces available straight options while you still have cards and `oppMin !== 1`, apply `-22`.
  - Endgame: if `endLen <= 5`, `+(5 - endLen) * 14`
- If `endLen == 0`: `+500`
- If `endLen in {1,2,3}`: `+26`
- Threat bonuses: `+12` for five-card plays, `+6` for singles
- If cannot pass and responding: `+4`

### Post-Scoring Adjustments (`suggestPlay`)
- If leading and opponents are not in immediate threat (`oppMin > 2`), re-pick from near-best (within 12 points) using a weaker-conserve tie-breaker.
- If leading and any five-card plays exist, prefer the strongest five-card play if it is within 18 points of best.
- If leading and a straight flush exists and `oppMin > 1`, force the strongest straight flush as the recommendation.
- If best play is a full house, prefer the full house with the smaller pair rank if it is not worse.
- If leading and `hasControlCheck(hand)` is false, avoid using 2s if a same-kind alternative is within 10 points.

### Pass Suggestion
`shouldRecommendPass(...)` still applies conservation rules after computing a recommended play:
- Suggest pass if no valid recommended play.
- Suggest pass in selected high-cost response scenarios, such as a very high single or pair with a sufficiently large hand.

Pass score (`recommendPassScore`) details:
- If cannot pass, no `lastPlay`, or first trick: `-Infinity`
- Base: `+8` per 2, `+10` if top 2, `+5` per high single, `+2` per five-card
- If hand size <= 5: `-45`
- If hand size <= 3: `-70`
- If `shouldForceMaxAgainstLastCard`: `-120`
- If best play has positive score: subtract `min(64, bestPlayScore * 0.16)`
- Pass is recommended only if `oppMin > 2` and `passScore > playScore + 15`

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
