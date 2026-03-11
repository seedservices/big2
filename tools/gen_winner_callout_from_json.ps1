$ErrorActionPreference='Stop'
$repo='C:\\git\\big2'
$wavDir=Join-Path $repo 'tools\\__wav_raw_winner'
$mp3Dir=Join-Path $repo 'public\\audio\\callout\\zh-HK'
$list=Get-Content -Encoding UTF8 (Join-Path $repo 'tools\\winner_lines.json') | ConvertFrom-Json
if(-not $list){ throw 'winner_lines.json is empty' }
New-Item -ItemType Directory -Force -Path $wavDir | Out-Null
$voices=@(
  @{suffix='female'; voice='Microsoft Tracy'; rate=1},
  @{suffix='male'; voice='Microsoft Danny'; rate=2}
)
Add-Type -AssemblyName System.Speech
foreach($line in $list){
  foreach($v in $voices){
    $wav=Join-Path $wavDir ($line.key+'-'+$v.suffix+'.wav')
    $s=New-Object System.Speech.Synthesis.SpeechSynthesizer
    $s.SelectVoice($v.voice)
    $s.Rate=$v.rate
    $s.SetOutputToWaveFile($wav)
    $s.Speak($line.text)
    $s.SetOutputToNull()
    $s.Dispose()
  }
}
$ffmpeg=(python -c "import imageio_ffmpeg as i; print(i.get_ffmpeg_exe())").Trim()
if(-not (Test-Path $ffmpeg)){ throw "ffmpeg not found at $ffmpeg" }
foreach($line in $list){
  foreach($v in $voices){
    $wav=Join-Path $wavDir ($line.key+'-'+$v.suffix+'.wav')
    $mp3=Join-Path $mp3Dir ($line.key+'-'+$v.suffix+'.mp3')
    & $ffmpeg -y -i $wav -codec:a libmp3lame -b:a 192k $mp3 | Out-Null
  }
}
Remove-Item -Recurse -Force $wavDir
