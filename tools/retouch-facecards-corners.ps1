Add-Type -AssemblyName System.Drawing

$OUT = 'public/card-assets'
$BG = [System.Drawing.Color]::FromArgb(246,246,246)
$RED = [System.Drawing.Color]::FromArgb(235,58,42)
$BLACK = [System.Drawing.Color]::FromArgb(15,15,15)
$ranks = @('J','Q','K')
$suits = @('spade','club','heart','diamond')

function Suit-Color([string]$s){ if($s -in @('heart','diamond')){ return $RED } return $BLACK }
function Suit-Glyph([string]$s){ switch($s){ 'spade' {([string][char]0x2660)} 'club' {([string][char]0x2663)} 'heart' {([string][char]0x2665)} 'diamond' {([string][char]0x2666)} default {([string][char]0x2660)} } }

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

function New-RankPath([string]$rank,[float]$x,[float]$y,[float]$size,[bool]$invert,[int]$W,[int]$H){
  $family = New-Object System.Drawing.FontFamily('Times New Roman')
  $fmt = New-Object System.Drawing.StringFormat
  $fmt.Alignment = [System.Drawing.StringAlignment]::Near
  $fmt.LineAlignment = [System.Drawing.StringAlignment]::Near
  $layout = [System.Drawing.RectangleF]::new($x,$y,130,140)
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddString($rank,$family,0,$size,$layout,$fmt)
  if($invert){
    $m = New-Object System.Drawing.Drawing2D.Matrix
    $m.RotateAt(180,[System.Drawing.PointF]::new($W/2.0,$H/2.0))
    $path.Transform($m)
    $m.Dispose()
  }
  $fmt.Dispose(); $family.Dispose()
  return $path
}

function Draw-Corners($g,[string]$rank,[string]$suit,[int]$W,[int]$H){
  $color = Suit-Color $suit
  $brush = New-Object System.Drawing.SolidBrush($color)
  $x=18; $y=10
  $rp = New-RankPath $rank $x $y 88 $false $W $H
  $g.FillPath($brush,$rp)
  $rp.Dispose()
  $s = New-SuitPath $suit ($x+38) ($y+124) 64 $false
  $g.FillPath($brush,$s)
  $s.Dispose()

  $rp2 = New-RankPath $rank $x $y 88 $true $W $H
  $g.FillPath($brush,$rp2)
  $rp2.Dispose()
  $s2 = New-SuitPath $suit ($x+38) ($y+124) 64 $false
  $m2 = New-Object System.Drawing.Drawing2D.Matrix
  $m2.RotateAt(180,[System.Drawing.PointF]::new($W/2.0,$H/2.0))
  $s2.Transform($m2)
  $m2.Dispose()
  $g.FillPath($brush,$s2)
  $s2.Dispose()

  $brush.Dispose()
}

foreach($suit in $suits){
  foreach($rank in $ranks){
    $path = Join-Path $OUT "$suit-$rank.png"
    if(!(Test-Path $path)){ continue }
    $src = [System.Drawing.Image]::FromFile($path)
    $bmp = New-Object System.Drawing.Bitmap($src)
    $src.Dispose()
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    $W = $bmp.Width
    $H = $bmp.Height

    $cardBg = $bmp.GetPixel([Math]::Floor($W/2),[Math]::Min(24,$H-1))
    $clipPath = New-RoundedRectPath 1 1 ($W-3) ($H-3) 20
    $g.SetClip($clipPath)

    # Remove outer edge stroke only; keep face-frame artwork intact.
    $outer = New-RoundedRectPath 0 0 ($W-1) ($H-1) 20
    $maskPen = New-Object System.Drawing.Pen($cardBg,3)
    $g.DrawPath($maskPen,$outer)
    $maskPen.Dispose(); $outer.Dispose()

    # Repaint all outer margins (aligned with classic frame bounds) so no corner-box seams remain.
    $erase = New-Object System.Drawing.SolidBrush($cardBg)
    $leftFrame = 58
    $topFrame = 58
    $rightFrame = 235
    $bottomFrame = 405
    $g.FillRectangle($erase,0,0,$leftFrame,$H)                    # left margin
    $g.FillRectangle($erase,$rightFrame,0,($W-$rightFrame),$H)    # right margin
    $g.FillRectangle($erase,0,0,$W,$topFrame)                     # top margin
    $g.FillRectangle($erase,0,$bottomFrame,$W,($H-$bottomFrame))  # bottom margin
    $erase.Dispose()

    Draw-Corners $g $rank $suit $W $H
    $g.ResetClip()
    $clipPath.Dispose()

    $g.Dispose()
    $tmp = "$path.tmp.png"
    $bmp.Save($tmp,[System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Move-Item -Force $tmp $path
  }
}
