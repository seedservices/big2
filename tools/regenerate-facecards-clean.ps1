Add-Type -AssemblyName System.Drawing

$W = 293
$H = 464
$BG = [System.Drawing.Color]::FromArgb(246,246,246)
$RED = [System.Drawing.Color]::FromArgb(235,58,42)
$BLACK = [System.Drawing.Color]::FromArgb(15,15,15)
$OUT = 'public/card-assets'
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
  $fmt.Dispose(); $family.Dispose()
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
  # Keep rounded card shape, but remove outer border stroke.
  $card.Dispose(); $b.Dispose()
  return @{bmp=$bmp; g=$g}
}

function Draw-Corners($g,[string]$rank,[string]$suit){
  $color = Suit-Color $suit
  $brush = New-Object System.Drawing.SolidBrush($color)
  $font = New-Object System.Drawing.Font('Times New Roman',72,[System.Drawing.FontStyle]::Regular,[System.Drawing.GraphicsUnit]::Pixel)
  $x=16; $y=8
  $g.DrawString($rank,$font,$brush,[float]$x,[float]$y)
  $s = New-SuitPath $suit ($x+30) ($y+96) 50 $false
  $g.FillPath($brush,$s)
  $s.Dispose()

  $st=$g.Save(); $g.TranslateTransform($W,$H); $g.RotateTransform(180)
  $g.DrawString($rank,$font,$brush,[float]$x,[float]$y)
  $s2 = New-SuitPath $suit ($x+30) ($y+96) 50 $false
  $g.FillPath($brush,$s2)
  $s2.Dispose()
  $g.Restore($st)

  $brush.Dispose(); $font.Dispose()
}

foreach($suit in $suits){
  foreach($rank in $ranks){
    $ctx = New-Canvas
    $g = $ctx.g
    Draw-Corners $g $rank $suit
    $brush = New-Object System.Drawing.SolidBrush((Suit-Color $suit))

    # Restore classic face-card frame design.
    $pen = New-Object System.Drawing.Pen((Suit-Color $suit),3)
    $frame = New-RoundedRectPath 36 70 220 324 18
    $g.DrawPath($pen,$frame)
    $frame.Dispose()
    $oval = [System.Drawing.RectangleF]::new(58,98,176,268)
    $g.DrawEllipse($pen,$oval)
    $g.DrawLine($pen,74,232,219,232)

    $font = New-Object System.Drawing.Font('Times New Roman',188,[System.Drawing.FontStyle]::Bold,[System.Drawing.GraphicsUnit]::Pixel)
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
    $g.DrawString($rank,$font,$brush,[System.Drawing.RectangleF]::new(36,112,221,118),$sf)
    $st = $g.Save()
    $g.TranslateTransform($W,$H)
    $g.RotateTransform(180)
    $g.DrawString($rank,$font,$brush,[System.Drawing.RectangleF]::new(36,112,221,118),$sf)
    $g.Restore($st)

    $smallFont = New-Object System.Drawing.Font('Times New Roman',40,[System.Drawing.FontStyle]::Italic,[System.Drawing.GraphicsUnit]::Pixel)
    $sym1 = New-SuitPath $suit 92 160 30 $false
    $sym2 = New-SuitPath $suit 201 304 30 $false
    $sym3 = New-SuitPath $suit 146 206 24 $false
    $sym4 = New-SuitPath $suit 146 258 24 $true
    $g.FillPath($brush,$sym1); $g.FillPath($brush,$sym2); $g.FillPath($brush,$sym3); $g.FillPath($brush,$sym4)
    $sym1.Dispose(); $sym2.Dispose(); $sym3.Dispose(); $sym4.Dispose()
    $g.DrawString($rank,$smallFont,$brush,[System.Drawing.RectangleF]::new(102,208,90,56),$sf)

    $sf.Dispose(); $smallFont.Dispose(); $font.Dispose(); $pen.Dispose(); $brush.Dispose(); $g.Dispose()
    $ctx.bmp.Save((Join-Path $OUT "$suit-$rank.png"),[System.Drawing.Imaging.ImageFormat]::Png)
    $ctx.bmp.Dispose()
  }
}
