Add-Type -AssemblyName System.Drawing

$w = 398
$h = 612
$out = 'public/card-assets'

function RoundedPath([float]$x,[float]$y,[float]$w,[float]$h,[float]$r){
  $p = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $r*2
  $p.AddArc($x,$y,$d,$d,180,90)
  $p.AddArc($x+$w-$d,$y,$d,$d,270,90)
  $p.AddArc($x+$w-$d,$y+$h-$d,$d,$d,0,90)
  $p.AddArc($x,$y+$h-$d,$d,$d,90,90)
  $p.CloseFigure()
  return $p
}

function DrawClassicBack([string]$name,[System.Drawing.Color]$c1,[System.Drawing.Color]$c2){
  $bmp = New-Object System.Drawing.Bitmap($w,$h,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.Clear([System.Drawing.Color]::Transparent)

  $outerR = [Math]::Round($w * 0.055, 0)
  $outer = RoundedPath 0 0 ($w-1) ($h-1) $outerR
  $white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
  $g.FillPath($white,$outer)
  $outerPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(40,40,40),1)
  $g.DrawPath($outerPen,$outer)

  $m1 = [Math]::Round($w * 0.06, 0)
  $inner = RoundedPath $m1 $m1 ($w-$m1*2) ($h-$m1*2) ([Math]::Round($outerR*0.75,0))
  $grad = New-Object System.Drawing.Drawing2D.LinearGradientBrush([System.Drawing.RectangleF]::new($m1,$m1,$w-$m1*2,$h-$m1*2),$c1,$c2,90)
  $g.FillPath($grad,$inner)
  $innerPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(240,245,250),1)
  $g.DrawPath($innerPen,$inner)

  # classic tight lattice pattern
  $latticePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(120,255,255,255),0.65)
  $pad = [Math]::Round($w * 0.07, 0)
  $span = [Math]::Round($h * 0.35, 0)
  $step = [Math]::Max(4, [Math]::Round($w * 0.012, 0))
  for($x=-$span;$x -lt $w+$span;$x+=$step){
    $g.DrawLine($latticePen,$x,$pad,$x+$span,$h-$pad)
    $g.DrawLine($latticePen,$x,$pad,$x-$span,$h-$pad)
  }

  # inner frame
  $framePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(220,240,245,250),0.9)
  $f1 = [Math]::Round($w * 0.12, 0)
  $f2 = [Math]::Round($w * 0.18, 0)
  $g.DrawRectangle($framePen,$f1,$f1,$w-$f1*2,$h-$f1*2)
  $g.DrawRectangle($framePen,$f2,$f2,$w-$f2*2,$h-$f2*2)

  # tiny classic center ornaments (no square block)
  $dot = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(175,255,255,255))
  $ringPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(210,245,250,255),1)
  $ring = [Math]::Round($w * 0.16, 0)
  $dotSize = [Math]::Round($w * 0.03, 0)
  $g.DrawEllipse($ringPen,($w/2)-($ring/2),($h/2)-($ring/2),$ring,$ring)
  $g.FillEllipse($dot,($w/2)-($dotSize/2),($h/2)-($dotSize/2),$dotSize,$dotSize)

  # small ornaments
  $smallDot = [Math]::Round($w * 0.028, 0)
  $g.FillEllipse($dot,($w/2)-($smallDot/2),$m1+$smallDot,$smallDot,$smallDot)
  $g.FillEllipse($dot,($w/2)-($smallDot/2),$h-$m1-$smallDot*2,$smallDot,$smallDot)

  $g.Dispose(); $white.Dispose(); $outerPen.Dispose(); $grad.Dispose(); $innerPen.Dispose(); $latticePen.Dispose(); $framePen.Dispose(); $ringPen.Dispose(); $dot.Dispose(); $outer.Dispose(); $inner.Dispose()
  $bmp.Save((Join-Path $out $name),[System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}

DrawClassicBack 'back-blue.png' ([System.Drawing.Color]::FromArgb(46,108,180)) ([System.Drawing.Color]::FromArgb(98,158,222))
DrawClassicBack 'back-red.png' ([System.Drawing.Color]::FromArgb(160,54,66)) ([System.Drawing.Color]::FromArgb(210,96,108))
