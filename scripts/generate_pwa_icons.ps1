Add-Type -AssemblyName System.Drawing

function Resize-Image {
    param(
        [string]$SourcePath,
        [string]$TargetPath,
        [int]$Width,
        [int]$Height
    )
    $src = [System.Drawing.Image]::FromFile($SourcePath)
    $dest = New-Object System.Drawing.Bitmap $Width, $Height
    $graphics = [System.Drawing.Graphics]::FromImage($dest)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.Clear([System.Drawing.Color]::FromArgb(18, 22, 31)) # Dark background #12161f
    $graphics.DrawImage($src, 0, 0, $Width, $Height)
    
    $src.Dispose()
    $graphics.Dispose()
    
    $dest.Save($TargetPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $dest.Dispose()
    Write-Host "Created $TargetPath (${Width}x${Height})"
}

$logo = (Resolve-Path "public/logo-icon.png").Path

Resize-Image -SourcePath $logo -TargetPath (Join-Path $PSScriptRoot "../public/icon-512.png") -Width 512 -Height 512
Resize-Image -SourcePath $logo -TargetPath (Join-Path $PSScriptRoot "../public/icon-192.png") -Width 192 -Height 192
Resize-Image -SourcePath $logo -TargetPath (Join-Path $PSScriptRoot "../public/apple-touch-icon.png") -Width 180 -Height 180
Resize-Image -SourcePath $logo -TargetPath (Join-Path $PSScriptRoot "../public/icon-maskable-512.png") -Width 512 -Height 512
