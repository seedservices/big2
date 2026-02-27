Add-Type -AssemblyName System.Drawing

$w = 56
$h = 84
$out = 'public/card-assets'

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

function Draw-Back([string]$name,[System.Drawing.Color]$dark,[System.Drawing.Color]$mid,[System.Drawing.Color]$line){
  $bmp = New-Object System.Drawing.Bitmap($w,$h,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.Clear([System.Drawing.Color]::Transparent)

  $card = New-RoundedRectPath 0 0 ($w-1) ($h-1) 5
  $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush([System.Drawing.RectangleF]::new(0,0,$w,$h),$dark,$mid,90)
  $g.FillPath($bgBrush,$card)

  $penOuter = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(235,245,255),1.2)
  $g.DrawPath($penOuter,$card)

  $inner = New-RoundedRectPath 4 4 ($w-9) ($h-9) 4
  $penInner = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(190,230,255),1)
  $g.DrawPath($penInner,$inner)

  $patternRect = [System.Drawing.RectangleF]::new(8,8,$w-16,$h-16)
  $penLine = New-Object System.Drawing.Pen($line,0.8)
  for($x=8;$x -le $w-8;$x+=4){ $g.DrawLine($penLine,$x,8,$x,$h-8) }
  for($y=8;$y -le $h-8;$y+=4){ $g.DrawLine($penLine,8,$y,$w-8,$y) }

  $penDiag = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(120,255,255,255),0.7)
  for($d=-$h;$d -lt $w;$d+=6){ $g.DrawLine($penDiag,$d,8,$d+$h,$h-8) }

  $center = New-RoundedRectPath (($w/2)-9) (($h/2)-12) 18 24 3
  $centerBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(75,255,255,255))
  $g.FillPath($centerBrush,$center)
  $centerPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(210,245,255),1)
  $g.DrawPath($centerPen,$center)

  $g.Dispose(); $bgBrush.Dispose(); $penOuter.Dispose(); $penInner.Dispose(); $penLine.Dispose(); $penDiag.Dispose(); $centerBrush.Dispose(); $centerPen.Dispose(); $card.Dispose(); $inner.Dispose(); $center.Dispose()

  $bmp.Save((Join-Path $out $name),[System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}

Draw-Back 'back-blue.png' ([System.Drawing.Color]::FromArgb(35,108,184)) ([System.Drawing.Color]::FromArgb(83,161,228)) ([System.Drawing.Color]::FromArgb(80,236,255,255))
Draw-Back 'back-red.png' ([System.Drawing.Color]::FromArgb(166,49,66)) ([System.Drawing.Color]::FromArgb(214,98,115)) ([System.Drawing.Color]::FromArgb(80,255,235,235))
