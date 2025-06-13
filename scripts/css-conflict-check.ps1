# CSS Conflict & Design Best Practices Check Script
# UTF-8 encoding

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "=== CSS Conflict & Design Best Practices Check ===" -ForegroundColor Yellow
Write-Host ""

# 1. CSS Files Discovery
Write-Host "1. CSS Files Discovery..." -ForegroundColor Cyan
$cssFiles = Get-ChildItem -Recurse -Include "*.css" | Where-Object { $_.FullName -notlike "*node_modules*" }
$moduleFiles = $cssFiles | Where-Object { $_.Name -like "*.module.css" }
$globalFiles = $cssFiles | Where-Object { $_.Name -notlike "*.module.css" }

Write-Host "   CSS Modules: $($moduleFiles.Count) files" -ForegroundColor Green
Write-Host "   Global CSS: $($globalFiles.Count) files" -ForegroundColor Green

# 2. CSS Conflict Analysis
Write-Host ""
Write-Host "2. CSS Conflict Analysis..." -ForegroundColor Cyan
$conflictIssues = @()

foreach ($file in $cssFiles) {
    try {
        $content = Get-Content $file.FullName -Encoding UTF8 -ErrorAction SilentlyContinue
        if ($content) {
            # !important usage check
            $importantMatches = $content | Select-String -Pattern "!important" -AllMatches
            $importantCount = if ($importantMatches) { $importantMatches.Matches.Count } else { 0 }
            
            if ($importantCount -gt 0) {
                $conflictIssues += "WARN: $($file.Name) has $importantCount '!important' declarations"
            }
            
            # Inline styles check (if any HTML content)
            $inlineMatches = $content | Select-String -Pattern "style\s*=" -AllMatches
            $inlineCount = if ($inlineMatches) { $inlineMatches.Matches.Count } else { 0 }
            
            if ($inlineCount -gt 0) {
                $conflictIssues += "WARN: $($file.Name) has $inlineCount inline styles"
            }
        }
    }
    catch {
        $conflictIssues += "ERROR: Could not read $($file.Name)"
    }
}

# 3. Design Best Practices Check
Write-Host ""
Write-Host "3. Design Best Practices Check..." -ForegroundColor Cyan
$practicesIssues = @()

# Check for CSS-Design-Best-Practices.md
if (Test-Path "CSS-Design-Best-Practices.md") {
    Write-Host "   ✓ CSS-Design-Best-Practices.md found" -ForegroundColor Green
} else {
    $practicesIssues += "ERROR: CSS-Design-Best-Practices.md not found"
}

# Check for design tokens/globals
$designTokenFiles = Get-ChildItem -Recurse -Include "*tokens*", "*variables*", "*globals*" -Name "*.css" | Where-Object { $_ -notlike "*node_modules*" }
if ($designTokenFiles) {
    Write-Host "   ✓ Design token files found:" -ForegroundColor Green
    $designTokenFiles | ForEach-Object { Write-Host "     - $_" -ForegroundColor White }
} else {
    $practicesIssues += "WARN: No design token files found"
}

# 4. CSS Modules Compliance Check
Write-Host ""
Write-Host "4. CSS Modules Compliance..." -ForegroundColor Cyan
foreach ($moduleFile in $moduleFiles) {
    $content = Get-Content $moduleFile.FullName -Encoding UTF8 -ErrorAction SilentlyContinue
    if ($content) {
        # Check for BEM-like naming
        $bemPattern = '\.[a-z]+(__[a-z]+)?(--[a-z]+)?'
        $nonBemMatches = $content | Select-String -Pattern '\.([a-z]*[A-Z][a-z]*)' -AllMatches
        
        if ($nonBemMatches -and $nonBemMatches.Matches.Count -gt 0) {
            Write-Host "   INFO: $($moduleFile.Name) may have non-BEM classes" -ForegroundColor Yellow
        } else {
            Write-Host "   ✓ $($moduleFile.Name) appears BEM compliant" -ForegroundColor Green
        }
    }
}

# 5. File Size Analysis
Write-Host ""
Write-Host "5. CSS Files Analysis..." -ForegroundColor Cyan
$cssFiles | ForEach-Object {
    $fileSize = [math]::Round($_.Length / 1KB, 2)
    $type = if ($_.Name -like "*.module.css") { "CSS Modules" } else { "Global CSS" }
    Write-Host "   $($_.Name) - ${fileSize}KB ($type)" -ForegroundColor White
}

# 6. Results Summary
Write-Host ""
Write-Host "=== RESULTS SUMMARY ===" -ForegroundColor Yellow

if ($conflictIssues.Count -eq 0 -and $practicesIssues.Count -eq 0) {
    Write-Host "✓ All checks passed! CSS is well-structured." -ForegroundColor Green
} else {
    Write-Host "Issues found:" -ForegroundColor Red
    ($conflictIssues + $practicesIssues) | ForEach-Object { 
        Write-Host "  - $_" -ForegroundColor Yellow 
    }
}

Write-Host ""
Write-Host "Check completed!" -ForegroundColor Green
