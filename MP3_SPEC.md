# MP3 Spec (Strict Generation Method)

This file is the single source of truth for callout voice generation.
Do not use any alternative pipeline.

## Output Location

- Live folder: `public/audio/callout/zh-HK`
- Temporary preview folder (optional): `public/audio/callout/zh-HK-rate23-preview-mp3`

## Allowed Generation Method (Only)

1. Use PowerShell + `.NET System.Speech` (`SpeechSynthesizer`) to generate WAV.
2. Voices:
   - Female: `Microsoft Tracy`
   - Male: `Microsoft Danny`
3. Rates (default full set):
   - Female: `2`
   - Male: `3`
4. Word-level rate override (strict):
   - None (all Cantonese clips use the default rates above).
5. Winner callout rate override (strict):
   - None (all Cantonese clips use the default rates above).
6. Build raw WAV files first into a temp folder (for example `__wav_raw`).
7. Apply stitch rules in Python (WAV PCM operation).
8. Convert final WAV to MP3 (`libmp3lame`, `192k`) with `ffmpeg` (via `imageio_ffmpeg` path).
9. Copy female base files to neutral names (`generic.mp3`, `pass.mp3`, `last.mp3`, `kind-*.mp3`).

## Known-Good Cantonese Generation Pipeline (This Machine)

Use this exact sequence when generating Cantonese MP3s on this machine. Do not deviate.

1. Create a unique temp folder under `tools\__wav_zh_tmp_YYYYMMDDHHMMSS`.
2. Use `System.Speech.Synthesis.SpeechSynthesizer` with:
   - `SelectVoice("Microsoft Tracy")` at rate `2`
   - `SelectVoice("Microsoft Danny")` at rate `3`
3. `SetOutputToWaveFile()` **before** `Speak()`.
4. Strip emoji/symbols before speaking.
5. Convert each WAV with ffmpeg from `imageio_ffmpeg` to MP3 at `192k`.

Reference script pattern (single line, safe to paste):
```
$ErrorActionPreference='Stop'; $repo=(Resolve-Path .).Path; $out=Join-Path $repo 'public\audio\callout\zh-HK'; $tmp=Join-Path $repo ('tools\__wav_zh_tmp_' + (Get-Date -Format 'yyyyMMddHHmmss')); New-Item -ItemType Directory -Path $tmp | Out-Null; $ffmpeg=(python -c 'import imageio_ffmpeg as i; print(i.get_ffmpeg_exe())').Trim(); if(-not (Test-Path $ffmpeg)){ throw ('ffmpeg not found at ' + $ffmpeg) }; function Strip-Emoji([string]$t){ if(-not $t){return ''}; $t=$t -replace '[\p{Cs}\p{So}\p{Sk}]',''; $t=$t -replace '\uFE0F',''; return $t.Trim() }; $text='今鋪我贏！'; $voices=@( @{suffix='female'; voice='Microsoft Tracy'; rate=2}, @{suffix='male'; voice='Microsoft Danny'; rate=3} ); Add-Type -AssemblyName System.Speech; foreach($v in $voices){ $s=New-Object System.Speech.Synthesis.SpeechSynthesizer; $s.SelectVoice($v.voice); $s.Rate=$v.rate; $clean=Strip-Emoji $text; $wav=Join-Path $tmp ('line-winner-6-'+$v.suffix+'.wav'); $mp3=Join-Path $out ('line-winner-6-'+$v.suffix+'.mp3'); $s.SetOutputToWaveFile($wav); $s.Speak($clean); $s.SetOutputToNull(); & $ffmpeg -y -i $wav -codec:a libmp3lame -b:a 192k $mp3 | Out-Null; $s.Dispose(); }
```

## Emoji Handling

- When generating any voice, strip all emoji and symbol characters from the spoken text (do not speak emoji).

## Cantonese Winner Line Synthesis Overrides

- `line-winner-7` display text remains `行運行到腳趾尾`.
- For synthesis only, use: `行運行到腳趾屘` (intonation guide). Do not change UI text.

## Forbidden Methods

- Do not use `edge-tts`.
- Do not use browser `speechSynthesis` recording.
- Do not switch to another TTS provider unless explicitly requested.

## Text Map (Current)

- `generic`: `出牌`
- `pass`: `大`
- `last`: `最後一張`
- `kind-single`: `單張`
- `kind-pair`: `一對`
- `kind-triple`: `三條`
- `kind-straight`: `蛇`
- `kind-flush`: `花`
- `kind-fullhouse`: `俘佬`
- `kind-fourofkind`: `四條`
- `kind-straightflush`: `同花笋`
- `line-pass-1`: `大`
- `line-pass-2`: `唔跟`
- `line-pass-3`: `唔去`
- `line-pass-4`: `過`
- `line-pass-5`: `Pass!`
- `line-last-1`: `最後一張`
- `line-last-2`: `淨翻一張`
- `line-last-3`: `埋門一腳`
- `line-last-4`: `準備找素`
- `line-last-5`: `最後一張罅喂` (preview/support file)
- `line-last-6`: `Last Card!`
- `line-play-tail-2`: `跟`
- `line-play-tail-3`: `頂住`
- `line-play-tail-4`: `大你少少`
- `line-play-tail-5`: `大過你`
- `line-winner-1`: `多謝晒`
- `line-winner-2`: `運氣好到冇朋友🙃`
- `line-winner-3`: `贏翻杯奶茶☕`
- `line-winner-5`: `贏到開巷`
- `line-winner-6`: `今鋪我贏！`
- `line-winner-7`: `行運行到腳趾尾`

## Stitch Rules

- `kind-fourofkind-female`: `四條(0->440ms)` + `薯條(440ms->end)`
- `kind-fourofkind-male`: `四條(0->440ms)` + `薯條(440ms->end)`
- `kind-triple-female`: `三條(0->440ms)` + `薯條(440ms->end)`
- `kind-triple-male`: `三條(0->440ms)` + `薯條(440ms->end)`

No inserted gap between stitched segments.

## Trim Policy

- No front trim.
- No end trim.
- Keep natural clip length from generated/stiched output.

## Runtime Requirement

- `src/main.js` for `zh-HK` must load MP3 files only.
- Fallback clip must be `audio/callout/zh-HK/pass.mp3`.
- Emote SFX are generated at runtime via Web Audio tones and do not use the callout MP3 pipeline.

## Move-to-Live Rule

- If preview folder is used:
  1. Verify preview files.
  2. Move all `*.mp3` to `public/audio/callout/zh-HK`.
  3. Delete preview folder.


