Add-Type -AssemblyName System.Drawing
$img = New-Object System.Drawing.Bitmap('C:\Users\anmol\.gemini\antigravity\brain\c3668991-1156-4048-ad8e-178a9fdee7b7\.user_uploaded\media_1791738079341_1528e865.png')

# The height of image is 68. Let's find for each of the 4 cards:
# Card 1: Aditya (around x=50-115)
# Card 2: Ananya (around x=310-375)
# Card 3: Rahul (around x=570-635)
# Card 4: Priya (around x=830-895)

# Let's test avatar boxes:
$boxes = @(
    @{ Name = "avatar_aditya"; X = 54; Y = 2; W = 62; H = 64 },
    @{ Name = "avatar_ananya"; X = 312; Y = 2; W = 62; H = 64 },
    @{ Name = "avatar_rahul";  X = 572; Y = 2; W = 62; H = 64 },
    @{ Name = "avatar_priya";  X = 832; Y = 2; W = 62; H = 64 }
)

$destDir = "c:\Users\anmol\.gemini\antigravity\scratch\campusride\client\public\avatars"
foreach ($b in $boxes) {
    $rect = New-Object System.Drawing.Rectangle($b.X, $b.Y, $b.W, $b.H)
    $bmp = New-Object System.Drawing.Bitmap($b.W, $b.H)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($img, (New-Object System.Drawing.Rectangle(0, 0, $b.W, $b.H)), $rect, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()
    $outPath = Join-Path $destDir "$($b.Name).png"
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Exported $outPath"
}

# Also export full cards including Name, College, Stamp, Role Badge!
$fullCards = @(
    @{ Name = "badge_card_aditya"; X = 48; Y = 0; W = 195; H = 68 },
    @{ Name = "badge_card_ananya"; X = 306; Y = 0; W = 195; H = 68 },
    @{ Name = "badge_card_rahul";  X = 566; Y = 0; W = 195; H = 68 },
    @{ Name = "badge_card_priya";  X = 826; Y = 0; W = 195; H = 68 }
)

foreach ($fc in $fullCards) {
    $rect = New-Object System.Drawing.Rectangle($fc.X, $fc.Y, $fc.W, $fc.H)
    $bmp = New-Object System.Drawing.Bitmap($fc.W, $fc.H)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($img, (New-Object System.Drawing.Rectangle(0, 0, $fc.W, $fc.H)), $rect, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()
    $outPath = Join-Path $destDir "$($fc.Name).png"
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Exported $outPath"
}

$img.Dispose()

