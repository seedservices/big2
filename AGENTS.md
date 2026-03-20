# BIG 2 Project

## DEV Rules
- Do work only according to the ask
- Prevent changing code which is not related to the ask

## Login session
- NEVER store any runtime data in local cache, except the logged-in email address
- Once logged in, retrieve the setting from firebase and default in main screen, alongside the score; if none retrieved just default
- After clicking start game button, save the settings into firebase
- After every game finished, save the record into firebase
- During development, everytime adding any new attributes to be stored in firebase, update the firebase rule automatically

## Screen General
- Prevent scrollbar whenever possible
- Maintain landscape mode and portrait mode separately, and make sure both works

## Regression Guards (UI)
- Mobile south player badge must stay anchored to the green table bottom-left (not inside the south action panel). See `public/style.css` mobile overrides.
- Hand card stacking must never hide cards to the right when a card is selected or must-3 highlight is active. The rendered hand uses z-index ordering left-to-right in `renderHandCard()` so left cards sit under right cards.
- Card size rules: default `--card-w: clamp(36px, 5.7vw, 58px)`, mobile (<=860px) `--card-w: clamp(36px, 6vmin, 52px)`, `--card-h: calc(var(--card-w) * 1.392857)`. Avoid ad-hoc per-device overrides.
- iPhone game cards (hand/closed/discard) must remain within compact size clamps; verify on iOS Safari and adjust `--card-w` / `--center-discard-scale` only in mobile/iOS breakpoints.
- Desktop game topbar must not overlap the game log; ensure topbar controls scroll within the main column on narrow desktop widths.

## Ad
- Use local cache to record only the game start time timestamp.
- When a game starts, update cache with current start time.
- When a game ends normally, clear the start time cache.
- Before starting any new game, if cached start time is within 1 hour, open Smart Link.
- If cached start time is older than 1 hour, allow start with no ad (and clear stale cache).
- Do not add the Social Bar script or any social ad.
- Smart Link is: https://www.effectivegatecpm.com/wbwmxkctg?key=e0907e00577f5c2a3eccf85c395c4b6a

## Encoding Rule
- Always save and edit source files in UTF-8.
- Never write files in UTF-16, UTF-32, or ANSI/legacy encodings.
- Preserve existing UTF-8 (with/without BOM) unless explicitly requested to change.

## Callout Generation Rule
- We might have emoji in the callout text, but do not include the emoji in the mp3 generation
- For Cantonese MP3 generation on this machine, use the exact PowerShell + ffmpeg pipeline documented in `MP3_SPEC.md` (temp folder, `Strip-Emoji`, `SetOutputToWaveFile` before `Speak`, then ffmpeg to mp3). Do not improvise or switch pipelines.
