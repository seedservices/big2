Add-Type -AssemblyName System.Drawing

$W = 398
$H = 612
$BG = [System.Drawing.Color]::FromArgb(246,246,246)
$RED = [System.Drawing.Color]::FromArgb(235,58,42)
$BLACK = [System.Drawing.Color]::FromArgb(15,15,15)
$OUT = 'public/card-assets'
$ranks = @('2','10')
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

function Suit-Color([string]$s){ if($s -in @('heart','diamond')){ return $RED } return $BLACK }
function Suit-Glyph([string]$s){ switch($s){ 'spade' {([string][char]0x2660)} 'club' {([string][char]0x2663)} 'heart' {([string][char]0x2665)} 'diamond' {([string][char]0x2666)} default {([string][char]0x2660)} } }

function New-SuitPath([string]$suit,[float]$cx,[float]$cy,[float]$size,[bool]$invert){
  $family = New-Object System.Drawing.FontFamily('Segoe UI Symbol')
  $fmt = New-Object System.Drawing.StringFormat
  $fmt.Alignment = [System.Drawing.StringAlignment]::Center
  $fmt.LineAlignment = [System.Drawing.StringAlignment]::Center
  $layout = [System.Drawing.RectangleF]::new($cx-$size,$cy-$size,$size*2,$size*2)
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddString((Suit-Glyph $suit),$family,0,$size,$layout,$fmt)
  if($invert){
    $m = New-Object System.Drawing.Drawing2D.Matrix
    $m.RotateAt(180,[System.Drawing.PointF]::new($cx,$cy))
    $path.Transform($m)
    $m.Dispose()
  }
  $fmt.Dispose()
  $family.Dispose()
  return $path
}

function New-Canvas(){
  $bmp = New-Object System.Drawing.Bitmap($W,$H,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  $g.Clear([System.Drawing.Color]::Transparent)

  $card = New-RoundedRectPath 1 1 ($W-3) ($H-3) 20
  $b = New-Object System.Drawing.SolidBrush($BG)
  $g.FillPath($b,$card)
  $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(22,22,22),2)
  $g.DrawPath($pen,$card)
  $card.Dispose(); $b.Dispose(); $pen.Dispose()
  return @{ bmp=$bmp; g=$g }
}

function Pip-Layout([string]$rank){
  switch($rank){
    '2'  { @(@{x=0.5;y=0.30;i=$false},@{x=0.5;y=0.70;i=$true}) }
    '10' { @(@{x=0.34;y=0.20;i=$false},@{x=0.66;y=0.20;i=$false},@{x=0.34;y=0.36;i=$false},@{x=0.66;y=0.36;i=$false},@{x=0.50;y=0.47;i=$false},@{x=0.34;y=0.58;i=$true},@{x=0.66;y=0.58;i=$true},@{x=0.50;y=0.64;i=$true},@{x=0.34;y=0.80;i=$true},@{x=0.66;y=0.80;i=$true}) }
  }
}

function Draw-Corners($g,[string]$rank,[string]$suit){
  $color = Suit-Color $suit
  $brush = New-Object System.Drawing.SolidBrush($color)
  $fontSize = 72
  if($rank -eq '10'){ $fontSize = 62 }
  $font = New-Object System.Drawing.Font('Times New Roman',$fontSize,[System.Drawing.FontStyle]::Regular,[System.Drawing.GraphicsUnit]::Pixel)
  $x=18; $y=10

  $g.DrawString($rank,$font,$brush,[float]$x,[float]$y)
  $s = New-SuitPath $suit ($x+34) ($y+112) 50 $false
  $g.FillPath($brush,$s)
  $s.Dispose()

  $st=$g.Save(); $g.TranslateTransform($W,$H); $g.RotateTransform(180)
  $g.DrawString($rank,$font,$brush,[float]$x,[float]$y)
  $s2 = New-SuitPath $suit ($x+34) ($y+112) 50 $false
  $g.FillPath($brush,$s2)
  $s2.Dispose(); $g.Restore($st)

  $brush.Dispose(); $font.Dispose()
}

foreach($suit in $suits){
  foreach($rank in $ranks){
    $ctx = New-Canvas
    Draw-Corners $ctx.g $rank $suit
    $brush = New-Object System.Drawing.SolidBrush((Suit-Color $suit))
    foreach($p in (Pip-Layout $rank)){
      $size = 88
      $path = New-SuitPath $suit ($W*$p.x) ($H*$p.y) $size ([bool]$p.i)
      $ctx.g.FillPath($brush,$path)
      $path.Dispose()
    }
    $brush.Dispose(); $ctx.g.Dispose()
    $ctx.bmp.Save((Join-Path $OUT "$suit-$rank.png"),[System.Drawing.Imaging.ImageFormat]::Png)
    $ctx.bmp.Dispose()
  }
}
