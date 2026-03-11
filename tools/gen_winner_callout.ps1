$ErrorActionPreference='Stop'
$repo='C:\\git\\big2'
$specPath=Join-Path $repo 'MP3_SPEC.md'
$wavDir=Join-Path $repo 'tools\\__wav_raw_winner'
$mp3Dir=Join-Path $repo 'public\\audio\\callout\\zh-HK'
New-Item -ItemType Directory -Force -Path $wavDir | Out-Null
$bt=[char]96
$pattern=$bt+'line-winner-(\\d+)'+$bt+': '+$bt+'(.*)'+$bt
$winner=@()
Get-Content -Encoding UTF8 $specPath | ForEach-Object {
  $m=[regex]::Match($_,$pattern)
  if($m.Success){
    $winner += [pscustomobject]@{num=[int]$m.Groups[1].Value; text=$m.Groups[2].Value; key=('line-winner-'+$m.Groups[1].Value)}
  }
}
$winner=$winner | Sort-Object num
if($winner.Count -eq 0){ throw 'No line-winner entries found in MP3_SPEC.md' }
$voices=@(
  @{suffix='female'; voice='Microsoft Tracy'; rate=1},
  @{suffix='male'; voice='Microsoft Danny'; rate=2}
)
Add-Type -AssemblyName System.Speech
foreach($line in $winner){
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
foreach($line in $winner){
  foreach($v in $voices){
    $wav=Join-Path $wavDir ($line.key+'-'+$v.suffix+'.wav')
    $mp3=Join-Path $mp3Dir ($line.key+'-'+$v.suffix+'.mp3')
    & $ffmpeg -y -i $wav -codec:a libmp3lame -b:a 192k $mp3 | Out-Null
  }
}
Remove-Item -Recurse -Force $wavDir
