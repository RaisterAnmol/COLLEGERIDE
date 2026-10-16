Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\anmol\.gemini\antigravity\brain\c3668991-1156-4048-ad8e-178a9fdee7b7\.user_uploaded\media_1791738079341_1528e865.png"
$img = [System.Drawing.Image]::FromFile($srcPath)
Write-Host "Width: $($img.Width), Height: $($img.Height)"

$destDir = "c:\Users\anmol\.gemini\antigravity\scratch\campusride\client\public\avatars"
if (!(Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
}

# The strip is 1024 x 68.
# 4 avatar cards spaced across 1024 width:
# Card 1: Aditya Kumar (x ~ 50 to 240) -> avatar icon ~ x=50, y=4, w=60, h=60
# Card 2: Ananya Verma (x ~ 290 to 480) -> avatar icon ~ x=298, y=4, w=60, h=60
# Card 3: Rahul Sharma (x ~ 540 to 730) -> avatar icon ~ x=555, y=4, w=60, h=60
# Card 4: Priya Singh  (x ~ 790 to 980) -> avatar icon ~ x=805, y=4, w=60, h=60

# Full card crops:
$cards = @(
    @{ Name = "card_aditya"; X = 45; Y = 0; W = 205; H = 68 },
    @{ Name = "card_ananya"; X = 295; Y = 0; W = 205; H = 68 },
    @{ Name = "card_rahul";  X = 550; Y = 0; W = 205; H = 68 },
    @{ Name = "card_priya";  X = 800; Y = 0; W = 205; H = 68 }
)

foreach ($c in $cards) {
    $rect = New-Object System.Drawing.Rectangle($c.X, $c.Y, $c.W, $c.H)
    $bmp = New-Object System.Drawing.Bitmap($c.W, $c.H)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.DrawImage($img, (New-Object System.Drawing.Rectangle(0, 0, $c.W, $c.H)), $rect, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()
    $outPath = Join-Path $destDir "$($c.Name).png"
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Saved $outPath"
}

# Avatar only crops (the stitched badge):
$avatars = @(
    @{ Name = "avatar_aditya"; X = 50; Y = 4; W = 60; H = 60 },
    @{ Name = "avatar_ananya"; X = 300; Y = 4; W = 60; H = 60 },
    @{ Name = "avatar_rahul";  X = 555; Y = 4; W = 60; H = 60 },
    @{ Name = "avatar_priya";  X = 808; Y = 4; W = 60; H = 60 }
)

foreach ($a in $avatars) {
    $rect = New-Object System.Drawing.Rectangle($a.X, $a.Y, $a.W, $a.H)
    $bmp = New-Object System.Drawing.Bitmap($a.W, $a.H)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.DrawImage($img, (New-Object System.Drawing.Rectangle(0, 0, $a.W, $a.H)), $rect, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()
    $outPath = Join-Path $destDir "$($a.Name).png"
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Saved $outPath"
}

$img.Dispose()
Write-Host "Done extracting crops!"

