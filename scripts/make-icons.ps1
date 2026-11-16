Add-Type -AssemblyName System.Drawing

$teal  = [Drawing.Color]::FromArgb(15, 110, 96)      # #0F6E60
$light = [Drawing.Color]::FromArgb(60, 186, 180)     # #3cbab4
$white = [Drawing.Color]::White
$muted = [Drawing.Color]::FromArgb(214, 235, 229)
$pub   = "D:\APPS\free-llms\test-qwen\symptom-app\public"

function Draw-Pulse([Drawing.Graphics]$g, [Drawing.Color]$c, [single]$x0, [single]$x1, [single]$y, [single]$amp, [single]$w) {
  $pen = New-Object Drawing.Pen($c, $w)
  $pen.StartCap = [Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap   = [Drawing.Drawing2D.LineCap]::Round
  $pen.LineJoin = [Drawing.Drawing2D.LineJoin]::Round
  $seg = [math]::Max(24, [int][math]::Round(($x1 - $x0) / 40))
  $pts = New-Object System.Collections.Generic.List[Drawing.PointF]
  for ($i = 0; $i -le $seg; $i++) {
    $x = $x0 + ($x1 - $x0) * ($i / $seg)
    $t = ($x - $x0) / ($x1 - $x0)
    $y2 = $y
    # one flat ECG spike at 40% of the width
    $spike = 0.42
    $d = [math]::Abs($t - $spike)
    if ($d -lt 0.012) { $y2 = $y - $amp }
    elseif ($d -lt 0.03) { $y2 = $y - $amp * (1 - ($d - 0.012) / 0.018) }
    elseif ($d -lt 0.05) { $y2 = $y + $amp * 0.45 * (1 - ($d - 0.03) / 0.02) }
    $pts.Add((New-Object Drawing.PointF($x, $y2)))
  }
  $g.DrawLines($pen, $pts.ToArray())
  $pen.Dispose()
}

function New-Png([int]$w, [int]$h) {
  $bmp = New-Object Drawing.Bitmap($w, $h)
  $g = [Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  $g.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  return @($bmp, $g)
}

# ---------- app icon (512) ----------
$s = 512
$r = New-Png $s $s
$bmp, $g = $r
$g.Clear($teal)
$brush = New-Object Drawing.SolidBrush($white)
$fontB = New-Object Drawing.Font("Segoe UI", 250, [Drawing.FontStyle]::Bold, [Drawing.GraphicsUnit]::Pixel)
$sf = New-Object Drawing.StringFormat
$sf.Alignment = [Drawing.StringAlignment]::Center
$sf.LineAlignment = [Drawing.StringAlignment]::Center
$rect = New-Object Drawing.RectangleF(0, -14, $s, $s)
$g.DrawString("B", $fontB, $brush, $rect, $sf)
Draw-Pulse $g $light 70 442 356 34 10
$fontB.Dispose(); $brush.Dispose(); $g.Dispose()
$bmp.Save("$pub\icon-512.png", [Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()

# ---------- apple icon (180) ----------
$r = New-Png 180 180
$bmp, $g = $r
$g.Clear($teal)
$brush = New-Object Drawing.SolidBrush($white)
$fontB = New-Object Drawing.Font("Segoe UI", 92, [Drawing.FontStyle]::Bold, [Drawing.GraphicsUnit]::Pixel)
$rect = New-Object Drawing.RectangleF(0, -5, 180, 180)
$g.DrawString("B", $fontB, $brush, $rect, $sf)
Draw-Pulse $g $light 26 154 128 12 4
$fontB.Dispose(); $brush.Dispose(); $g.Dispose()
$bmp.Save("$pub\icon-180.png", [Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()

# ---------- OG card (1200x630) ----------
$r = New-Png 1200 630
$bmp, $g = $r
$g.Clear($teal)
$brushW = New-Object Drawing.SolidBrush($white)
$brushM = New-Object Drawing.SolidBrush($muted)

$brand = New-Object Drawing.Font("Segoe UI", 40, [Drawing.FontStyle]::Bold, [Drawing.GraphicsUnit]::Pixel)
$g.DrawString("BloodWorks Health", $brand, $brushW, 72, 150)
Draw-Pulse $g $light 74 640 236 20 5
$tag = New-Object Drawing.Font("Segoe UI", 26, [Drawing.FontStyle]::Regular, [Drawing.GraphicsUnit]::Pixel)
$g.DrawString("Your blood report, decoded in under a minute.", $tag, $brushM, 72, 282)
$g.DrawString("60+ biomarkers . System scores . Care plan . Sai, your AI assistant", $tag, $brushM, 72, 326)

# white card on the right with score bars
$cardRect = New-Object Drawing.Rectangle(700, 150, 430, 330)
$cardBrush = New-Object Drawing.SolidBrush([Drawing.Color]::White)
$g.FillRectangle($cardBrush, $cardRect)
$cardBrush.Dispose()
$cardTitle = New-Object Drawing.Font("Segoe UI", 18, [Drawing.FontStyle]::Bold, [Drawing.GraphicsUnit]::Pixel)
$grey = [Drawing.Color]::FromArgb(90, 105, 100)
$greyBrush = New-Object Drawing.SolidBrush($grey)
$g.DrawString("Your system health", $cardTitle, $greyBrush, 730, 178)
$greyBrush.Dispose()

$barFont = New-Object Drawing.Font("Segoe UI", 16, [Drawing.FontStyle]::Regular, [Drawing.GraphicsUnit]::Pixel)
$darkBrush = New-Object Drawing.SolidBrush([Drawing.Color]::FromArgb(24, 32, 30))
$bars = @(
  @("Cardiovascular", 82),
  @("Endocrine", 64),
  @("Liver function", 91),
  @("Kidney", 77),
  @("Immune", 88)
)
$y = 226
foreach ($b in $bars) {
  $g.DrawString($b[0], $barFont, $darkBrush, 730, $y)
  $g.DrawString("$($b[1])%", $barFont, $darkBrush, 1046, $y)
  $y += 28
  $trackRect = New-Object Drawing.RectangleF(730, $y, 346, 8)
  $track = New-Object Drawing.SolidBrush([Drawing.Color]::FromArgb(228, 236, 233))
  $g.FillRectangle($track, $trackRect)
  $track.Dispose()
  $fillRect = New-Object Drawing.RectangleF(730, $y, (346 * $b[1] / 100), 8)
  $fill = New-Object Drawing.SolidBrush($light)
  $g.FillRectangle($fill, $fillRect)
  $fill.Dispose()
  $y += 34
}
$darkBrush.Dispose(); $barFont.Dispose(); $brand.Dispose(); $tag.Dispose()
$brushW.Dispose(); $brushM.Dispose()
$g.Dispose()
$bmp.Save("$pub\og.png", [Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()

Write-Output "done"
