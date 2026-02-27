Add-Type -AssemblyName System.Drawing

$OUT = 'public/card-assets'
$BORDER = [System.Drawing.Color]::FromArgb(22,22,22)
$ranks = @('J','Q','K')
$suits = @('spade','club','heart','diamond')

function New-RoundedRectPath([float]$x,[float]$y,[float]$w,[float]$h,[float]$r){
  $p = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $r*2
  $p.AddArc($x,$y,$d,$d,180,90)
  $p.AddArc($x+$w-$d,$y,$d,$d,270,90)
  $p.AddArc($x+$w-$d,$y+$h-$d,$d,$d,0,90)
  $p.AddArc($x,$y+$h-$d,$d,$d,90,90)
  $p.CloseFigure()
  return $p
}

foreach($suit in $suits){
  foreach($rank in $ranks){
    $path = Join-Path $OUT "$suit-$rank.png"
    if(!(Test-Path $path)){ continue }

    $src = [System.Drawing.Image]::FromFile($path)
    $W = $src.Width
    $H = $src.Height

    $outBmp = New-Object System.Drawing.Bitmap($W,$H,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($outBmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)

    # Match A-10 corner geometry only: rounded rectangle with r=20, inset 1.
    $card = New-RoundedRectPath 1 1 ($W-3) ($H-3) 20
    $g.SetClip($card)
    $g.DrawImage($src,0,0,$W,$H)
    $g.ResetClip()

    # Match A-10 border stroke thickness/tone.
    $pen = New-Object System.Drawing.Pen($BORDER,2)
    $g.DrawPath($pen,$card)

    $pen.Dispose(); $card.Dispose(); $g.Dispose(); $src.Dispose()

    $tmp = "$path.tmp.png"
    $outBmp.Save($tmp,[System.Drawing.Imaging.ImageFormat]::Png)
    $outBmp.Dispose()
    Move-Item -Force $tmp $path
  }
}
