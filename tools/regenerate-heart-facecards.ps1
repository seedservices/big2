Add-Type -AssemblyName System.Drawing

$width = 293
$height = 464
$bg = [System.Drawing.Color]::FromArgb(247,247,247)
$red = [System.Drawing.Color]::FromArgb(233,45,45)

function New-RoundedRectPath([float]$x,[float]$y,[float]$w,[float]$h,[float]$r){
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $r * 2
  $path.AddArc($x, $y, $d, $d, 180, 90)
  $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  return $path
}

function New-HeartPath([float]$cx,[float]$cy,[float]$w,[float]$h,[switch]$Invert){
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $halfW = $w / 2.0
  $halfH = $h / 2.0
  $dir = 1.0
  if($Invert){ $dir = -1.0 }

  $tipY = $cy + ($dir * $halfH)
  $cuspY = $cy - ($dir * $halfH * 0.28)
  $lobeY = $cy - ($dir * $halfH * 0.38)

  $path.StartFigure()
  $path.AddBezier(
    [System.Drawing.PointF]::new($cx, $tipY),
    [System.Drawing.PointF]::new($cx - $halfW * 0.82, $cy + ($dir * $halfH * 0.42)),
    [System.Drawing.PointF]::new($cx - $halfW * 1.04, $cuspY),
    [System.Drawing.PointF]::new($cx - $halfW * 0.50, $lobeY)
  )
  $path.AddBezier(
    [System.Drawing.PointF]::new($cx - $halfW * 0.50, $lobeY),
    [System.Drawing.PointF]::new($cx - $halfW * 0.12, $cy - ($dir * $halfH * 0.30)),
    [System.Drawing.PointF]::new($cx - $halfW * 0.02, $cy - ($dir * $halfH * 0.12)),
    [System.Drawing.PointF]::new($cx, $cy - ($dir * $halfH * 0.06))
  )
  $path.AddBezier(
    [System.Drawing.PointF]::new($cx, $cy - ($dir * $halfH * 0.06)),
    [System.Drawing.PointF]::new($cx + $halfW * 0.02, $cy - ($dir * $halfH * 0.12)),
    [System.Drawing.PointF]::new($cx + $halfW * 0.12, $cy - ($dir * $halfH * 0.30)),
    [System.Drawing.PointF]::new($cx + $halfW * 0.50, $lobeY)
  )
  $path.AddBezier(
    [System.Drawing.PointF]::new($cx + $halfW * 0.50, $lobeY),
    [System.Drawing.PointF]::new($cx + $halfW * 1.04, $cuspY),
    [System.Drawing.PointF]::new($cx + $halfW * 0.82, $cy + ($dir * $halfH * 0.42)),
    [System.Drawing.PointF]::new($cx, $tipY)
  )
  $path.CloseFigure()
  return $path
}

function Draw-CornerMarks($g, [string]$rank){
  $font = New-Object System.Drawing.Font('Times New Roman', 30, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
  $brush = New-Object System.Drawing.SolidBrush($red)
  $sx = 20
  $sy = 10

  $g.DrawString($rank, $font, $brush, [float]$sx, [float]$sy)

  $small = New-HeartPath -cx ($sx + 20) -cy ($sy + 56) -w 18 -h 18
  $g.FillPath($brush, $small)
  $small.Dispose()

  $state = $g.Save()
  $g.TranslateTransform($width, $height)
  $g.RotateTransform(180)
  $g.DrawString($rank, $font, $brush, [float]$sx, [float]$sy)
  $small2 = New-HeartPath -cx ($sx + 20) -cy ($sy + 56) -w 18 -h 18
  $g.FillPath($brush, $small2)
  $small2.Dispose()
  $g.Restore($state)

  $font.Dispose()
  $brush.Dispose()
}

function New-Canvas(){
  $bmp = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.Clear([System.Drawing.Color]::Transparent)

  $card = New-RoundedRectPath 0 0 ($width-1) ($height-1) 12
  $brush = New-Object System.Drawing.SolidBrush($bg)
  $g.FillPath($brush, $card)
  $card.Dispose(); $brush.Dispose()
  return @{ bmp=$bmp; g=$g }
}

function Save-Card($ctx, [string]$outPath){
  $ctx.g.Dispose()
  $ctx.bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $ctx.bmp.Dispose()
}

function Draw-A(){
  $ctx = New-Canvas
  Draw-CornerMarks $ctx.g 'A'
  $brush = New-Object System.Drawing.SolidBrush($red)
  $heart = New-HeartPath -cx ($width/2) -cy ($height/2) -w 42 -h 42
  $ctx.g.FillPath($brush, $heart)
  $heart.Dispose(); $brush.Dispose()
  Save-Card $ctx 'public/card-assets/heart-A.png'
}

function Draw-Face([string]$rank){
  $ctx = New-Canvas
  Draw-CornerMarks $ctx.g $rank

  $brush = New-Object System.Drawing.SolidBrush($red)
  $font = New-Object System.Drawing.Font('Times New Roman', 150, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)

  $sf = New-Object System.Drawing.StringFormat
  $sf.Alignment = [System.Drawing.StringAlignment]::Center
  $sf.LineAlignment = [System.Drawing.StringAlignment]::Center

  $ctx.g.DrawString($rank, $font, $brush, [System.Drawing.RectangleF]::new(25, 88, $width-50, 130), $sf)

  $state = $ctx.g.Save()
  $ctx.g.TranslateTransform($width, $height)
  $ctx.g.RotateTransform(180)
  $ctx.g.DrawString($rank, $font, $brush, [System.Drawing.RectangleF]::new(25, 88, $width-50, 130), $sf)
  $ctx.g.Restore($state)

  $centerX = $width / 2.0
  $centerY = $height / 2.0
  $h1 = New-HeartPath -cx ($centerX - 60) -cy ($centerY - 78) -w 22 -h 22
  $h2 = New-HeartPath -cx ($centerX + 60) -cy ($centerY + 78) -w 22 -h 22
  $ctx.g.FillPath($brush, $h1)
  $ctx.g.FillPath($brush, $h2)
  $h1.Dispose(); $h2.Dispose()

  $sf.Dispose(); $font.Dispose(); $brush.Dispose()
  Save-Card $ctx ("public/card-assets/heart-$rank.png")
}

Draw-A
Draw-Face 'J'
Draw-Face 'Q'
Draw-Face 'K'
