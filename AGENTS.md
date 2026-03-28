# BIG 2 Project

## DEV Rules
- Do work only according to the ask
- Prevent changing code which is not related to the ask

## Login session
- Local cache is limited to the logged-in email address and (when not signed in) the last room id for reconnect
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

## Encoding Rule
- Always save and edit source files in UTF-8.
- Never write files in UTF-16, UTF-32, or ANSI/legacy encodings.
- Preserve existing UTF-8 (with/without BOM) unless explicitly requested to change.

## Firebase Deploy Note
- Firestore rules deploy should be run from `C:\git\big2\firebase` (where `firebase.json` lives).

## Callout Generation Rule
- We might have emoji in the callout text, but do not include the emoji in the mp3 generation
- For Cantonese MP3 generation on this machine, use the exact PowerShell + ffmpeg pipeline documented in `MP3_SPEC.md` (temp folder, `Strip-Emoji`, `SetOutputToWaveFile` before `Speak`, then ffmpeg to mp3). Do not improvise or switch pipelines.

## Auto build after change
- "npm run build" for every change done for the prompt request

## Popunder Ad
- Use this popunder ad script when starting a new game and keep focus on the game tab: `<script>(function(s){s.dataset.zone='10798259',s.src='https://al5sm.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>`
