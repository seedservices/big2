# MP3 Spec (Callout Audio)

This document defines how callout mp3 files in `public/audio/callout/zh-HK` must be generated.

## Scope

- Applies to all callout mp3 files under:
  - `public/audio/callout/zh-HK`
- Includes:
  - base clips (`generic`, `pass`, `last`, `kind-*`)
  - variant clips (`line-pass-*`, `line-last-*`, `line-play-tail-*`)

## Voices

- Female: `Microsoft Tracy`
- Male: `Microsoft Danny`
- Neutral/base non-gender files (`*.mp3` without `-female/-male`) are copied from female output.

## Text Rules

- Language: Cantonese text only for zh-HK callouts.
- Emoji must not be spoken in generated audio.
  - Example:
    - `準備找數💸` -> synthesize as `準備找數`
    - `最後一張啦喂😉` -> synthesize as `最後一張啦喂`

- Pronunciation override:
  - UI text `最後一張啦喂` must synthesize as `最後一張罅喂`.

## Current Canonical Text

- `kind-straightflush`: `同花笋`
- `line-play-tail-5`: `大過你`

## Pronunciation Stitch Rules

To correct `條` pronunciation:

- `kind-fourofkind-female.mp3`:
  - synthesize `四條` and `薯條` with female voice
  - keep `四條` from `0ms -> 440ms`
  - keep `薯條` from `440ms -> end`
  - stitch directly
- `kind-fourofkind-male.mp3`:
  - same method with male voice
- `kind-triple-male.mp3`:
  - synthesize `三條` and `薯條` with male voice
  - keep `三條` from `0ms -> 440ms`
  - keep `薯條` from `440ms -> end`
  - stitch directly

## Global Trim Rule (Final Output)

Apply to all generated callout mp3 files:

- Remove first `150ms`
- Remove last `350ms`

If clip becomes too short after trimming, keep a short center segment (minimum around 120ms) rather than outputting silence.

## File Set Expectations

- Keep both base and line variants:
  - `pass*.mp3` (base/fallback/priming)
  - `line-pass-*.mp3` (exact pass variants)
  - `last*.mp3` and `line-last-*.mp3`
  - `kind-*.mp3` plus `line-play-tail-*.mp3` for composed play callouts
- `line-kind-*-*.mp3` are intentionally not used and should remain removed.

## Encoding

- Format: MP3
- Bitrate: 128 kbps CBR
- Source WAV sample rate/channels follow TTS output.
