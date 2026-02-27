Add-Type -AssemblyName System.Drawing

$W = 293
$H = 464
$BG = [System.Drawing.Color]::FromArgb(247,247,247)
$RED = [System.Drawing.Color]::FromArgb(233,45,45)
$BLACK = [System.Drawing.Color]::FromArgb(0,0,0)
$OUT = 'public/card-assets'
$ranks = @('A','2','3','4','5','6','7','8','9','10','J','Q','K')

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

function New-GlyphPath([string]$glyph,[float]$cx,[float]$cy,[float]$emSize,[bool]$invert){
  $family = New-Object System.Drawing.FontFamily('Segoe UI Symbol')
  $fmt = New-Object System.Drawing.StringFormat
  $fmt.Alignment = [System.Drawing.StringAlignment]::Center
  $fmt.LineAlignment = [System.Drawing.StringAlignment]::Center
  $layout = [System.Drawing.RectangleF]::new($cx-$emSize,$cy-$emSize,$emSize*2,$emSize*2)
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddString($glyph,$family,0,$emSize,$layout,$fmt)
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

function Get-SuitGlyph([string]$suit){
  switch($suit){
    'spade'   { return ([string][char]0x2660) }
    'club'    { return ([string][char]0x2663) }
    'heart'   { return ([string][char]0x2665) }
    'diamond' { return ([string][char]0x2666) }
    default   { return ([string][char]0x2660) }
  }
}

function New-SuitPath([string]$suit,[float]$cx,[float]$cy,[float]$size,[bool]$invert){
  return New-GlyphPath (Get-SuitGlyph $suit) $cx $cy ($size*1.32) $invert
}

function Suit-Color([string]$suit){
  if($suit -in @('heart','diamond')){ return $RED }
  return $BLACK
}

function New-Canvas(){
  $bmp = New-Object System.Drawing.Bitmap($W,$H,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
  $g.Clear([System.Drawing.Color]::Transparent)

  $card = New-RoundedRectPath 0 0 ($W-1) ($H-1) 12
  $b = New-Object System.Drawing.SolidBrush($BG)
  $g.FillPath($b,$card)
  $card.Dispose(); $b.Dispose()
  return @{bmp=$bmp; g=$g}
}

function Draw-Corners($g,[string]$rank,[string]$suit){
  $color = Suit-Color $suit
  $brush = New-Object System.Drawing.SolidBrush($color)
  $fontSize = 48
  if($rank -eq '10'){ $fontSize = 42 }
  $font = New-Object System.Drawing.Font('Times New Roman',$fontSize,[System.Drawing.FontStyle]::Regular,[System.Drawing.GraphicsUnit]::Pixel)

  $x = 16
  $y = 6
  $g.DrawString($rank,$font,$brush,[float]$x,[float]$y)
  $s = New-SuitPath $suit ($x+25) ($y+72) 24 $false
  $g.FillPath($brush,$s)
  $s.Dispose()

  $st = $g.Save()
  $g.TranslateTransform($W,$H)
  $g.RotateTransform(180)
  $g.DrawString($rank,$font,$brush,[float]$x,[float]$y)
  $s2 = New-SuitPath $suit ($x+25) ($y+72) 24 $false
  $g.FillPath($brush,$s2)
  $s2.Dispose()
  $g.Restore($st)

  $brush.Dispose(); $font.Dispose()
}

function Pip-Layout([string]$rank){
  switch($rank){
    'A'  { return @(@{x=0.5;y=0.50;i=$false;s=1.15}) }
    '2'  { return @(@{x=0.5;y=0.30;i=$false},@{x=0.5;y=0.70;i=$true}) }
    '3'  { return @(@{x=0.5;y=0.27;i=$false},@{x=0.5;y=0.50;i=$false},@{x=0.5;y=0.73;i=$true}) }
    '4'  { return @(@{x=0.34;y=0.30;i=$false},@{x=0.66;y=0.30;i=$false},@{x=0.34;y=0.70;i=$true},@{x=0.66;y=0.70;i=$true}) }
    '5'  { return @(@{x=0.34;y=0.30;i=$false},@{x=0.66;y=0.30;i=$false},@{x=0.5;y=0.50;i=$false},@{x=0.34;y=0.70;i=$true},@{x=0.66;y=0.70;i=$true}) }
    '6'  { return @(@{x=0.34;y=0.25;i=$false},@{x=0.66;y=0.25;i=$false},@{x=0.34;y=0.50;i=$false},@{x=0.66;y=0.50;i=$false},@{x=0.34;y=0.75;i=$true},@{x=0.66;y=0.75;i=$true}) }
    '7'  { return @(@{x=0.34;y=0.24;i=$false},@{x=0.66;y=0.24;i=$false},@{x=0.5;y=0.39;i=$false},@{x=0.34;y=0.50;i=$false},@{x=0.66;y=0.50;i=$false},@{x=0.34;y=0.75;i=$true},@{x=0.66;y=0.75;i=$true}) }
    '8'  { return @(@{x=0.34;y=0.23;i=$false},@{x=0.66;y=0.23;i=$false},@{x=0.34;y=0.40;i=$false},@{x=0.66;y=0.40;i=$false},@{x=0.34;y=0.60;i=$true},@{x=0.66;y=0.60;i=$true},@{x=0.34;y=0.77;i=$true},@{x=0.66;y=0.77;i=$true}) }
    '9'  { return @(@{x=0.34;y=0.22;i=$false},@{x=0.66;y=0.22;i=$false},@{x=0.34;y=0.39;i=$false},@{x=0.66;y=0.39;i=$false},@{x=0.5;y=0.50;i=$false},@{x=0.34;y=0.61;i=$true},@{x=0.66;y=0.61;i=$true},@{x=0.34;y=0.78;i=$true},@{x=0.66;y=0.78;i=$true}) }
    '10' { return @(@{x=0.34;y=0.20;i=$false},@{x=0.66;y=0.20;i=$false},@{x=0.34;y=0.36;i=$false},@{x=0.66;y=0.36;i=$false},@{x=0.5;y=0.47;i=$false},@{x=0.34;y=0.58;i=$true},@{x=0.66;y=0.58;i=$true},@{x=0.5;y=0.64;i=$true},@{x=0.34;y=0.78;i=$true},@{x=0.66;y=0.78;i=$true}) }
    default { return @() }
  }
}

function Draw-NumberCard([string]$suit,[string]$rank){
  $ctx = New-Canvas
  $g = $ctx.g
  Draw-Corners $g $rank $suit
  $brush = New-Object System.Drawing.SolidBrush((Suit-Color $suit))
  foreach($p in (Pip-Layout $rank)){
    $size = 48
    if($p.ContainsKey('s')){ $size = [int](48 * $p.s) }
    $path = New-SuitPath $suit ($W*$p.x) ($H*$p.y) $size ([bool]$p.i)
    $g.FillPath($brush,$path)
    $path.Dispose()
  }
  $brush.Dispose(); $g.Dispose()
  $ctx.bmp.Save((Join-Path $OUT "$suit-$rank.png"),[System.Drawing.Imaging.ImageFormat]::Png)
  $ctx.bmp.Dispose()
}

function Draw-FaceCard([string]$suit,[string]$rank){
  $ctx = New-Canvas
  $g = $ctx.g
  Draw-Corners $g $rank $suit
  $color = Suit-Color $suit
  $brush = New-Object System.Drawing.SolidBrush($color)
  $pen = New-Object System.Drawing.Pen($color,3)
  $letterFont = New-Object System.Drawing.Font('Times New Roman',188,[System.Drawing.FontStyle]::Bold,[System.Drawing.GraphicsUnit]::Pixel)
  $smallFont = New-Object System.Drawing.Font('Times New Roman',40,[System.Drawing.FontStyle]::Italic,[System.Drawing.GraphicsUnit]::Pixel)
  $sf = New-Object System.Drawing.StringFormat
  $sf.Alignment = [System.Drawing.StringAlignment]::Center
  $sf.LineAlignment = [System.Drawing.StringAlignment]::Center

  $frame = New-RoundedRectPath 36 70 220 324 18
  $g.DrawPath($pen,$frame)
  $frame.Dispose()

  $oval = [System.Drawing.RectangleF]::new(58,98,176,268)
  $g.DrawEllipse($pen,$oval)
  $g.DrawString($rank,$letterFont,$brush,[System.Drawing.RectangleF]::new(36,112,221,118),$sf)
  $g.DrawLine($pen,74,232,219,232)

  $state = $g.Save()
  $g.TranslateTransform($W,$H)
  $g.RotateTransform(180)
  $g.DrawString($rank,$letterFont,$brush,[System.Drawing.RectangleF]::new(36,112,221,118),$sf)
  $g.Restore($state)

  $sym1 = New-SuitPath $suit 92 160 30 $false
  $sym2 = New-SuitPath $suit 201 304 30 $false
  $sym3 = New-SuitPath $suit 146 206 24 $false
  $sym4 = New-SuitPath $suit 146 258 24 $true
  $g.FillPath($brush,$sym1); $g.FillPath($brush,$sym2); $g.FillPath($brush,$sym3); $g.FillPath($brush,$sym4)
  $sym1.Dispose(); $sym2.Dispose(); $sym3.Dispose(); $sym4.Dispose()

  $g.DrawString($rank,$smallFont,$brush,[System.Drawing.RectangleF]::new(102,208,90,56),$sf)

  $sf.Dispose(); $smallFont.Dispose(); $letterFont.Dispose(); $pen.Dispose(); $brush.Dispose(); $g.Dispose()
  $ctx.bmp.Save((Join-Path $OUT "$suit-$rank.png"),[System.Drawing.Imaging.ImageFormat]::Png)
  $ctx.bmp.Dispose()
}

foreach($suit in @('heart','spade','diamond','club')){
  foreach($rank in $ranks){
    if($rank -in @('J','Q','K')){ Draw-FaceCard $suit $rank } else { Draw-NumberCard $suit $rank }
  }
}

$probeMap = @{
  'probe-heart6-left0.png' = 'heart-6.png'
  'probe-heart7-left0.png' = 'heart-7.png'
  'probe-heart7-shift.png' = 'heart-7.png'
  'probe-heartA-left0.png' = 'heart-A.png'
  'probe-heartK-left0.png' = 'heart-K.png'
  'probe-k-shift.png' = 'spade-K.png'
  'probe-s6-a.png' = 'spade-6.png'
  'probe-s6-b.png' = 'spade-6.png'
  'probe-s6-c.png' = 'spade-6.png'
  'probe-s7-a.png' = 'spade-7.png'
  'probe-s7-b.png' = 'spade-7.png'
  'probe-s7-c.png' = 'spade-7.png'
  'probe-spade-a.png' = 'spade-A.png'
  'probe-spade-j.png' = 'spade-J.png'
  'probe-spade-k.png' = 'spade-K.png'
  'probe-tight-10.png' = 'spade-10.png'
  'probe-tight-a.png' = 'spade-A.png'
  'probe-tight-j.png' = 'spade-J.png'
  'probe-tight-k.png' = 'spade-K.png'
}

foreach($k in $probeMap.Keys){
  Copy-Item (Join-Path $OUT $probeMap[$k]) (Join-Path $OUT $k) -Force
}
