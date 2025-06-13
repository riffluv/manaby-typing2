# CSS Analysis Script - UTF-8 Clean Version
# 2025 Design Best Practices Compliance Check

Write-Host "=== CSS Analysis & Design Compliance Check ===" -ForegroundColor Yellow
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
$totalImportantCount = 0

foreach ($file in $cssFiles) {
    try {
        $content = Get-Content $file.FullName -Encoding UTF8 -ErrorAction SilentlyContinue
        if ($content) {
            # Count !important declarations
            $importantMatches = $content | Select-String -Pattern "!important" -AllMatches
            $importantCount = if ($importantMatches) { $importantMatches.Matches.Count } else { 0 }
            $totalImportantCount += $importantCount
              if ($importantCount -gt 0) {
                $status = if ($importantCount -le 3) { "LOW" } elseif ($importantCount -le 10) { "MEDIUM" } else { "HIGH" }
                $conflictIssues += "${status}: $($file.Name) has $importantCount '!important' declarations"
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

# Check for design guidelines
if (Test-Path "CSS-Design-Best-Practices.md") {
    Write-Host "   Found: CSS-Design-Best-Practices.md" -ForegroundColor Green
} else {
    $practicesIssues += "ERROR: CSS-Design-Best-Practices.md not found"
}

# Check for design token files
$tokenFiles = @()
$cssFiles | ForEach-Object {
    if ($_.Name -match "(token|variable|global|design)") {
        $tokenFiles += $_.Name
    }
}

if ($tokenFiles.Count -gt 0) {
    Write-Host "   Design Token Files Found:" -ForegroundColor Green
    $tokenFiles | ForEach-Object { Write-Host "     - $_" -ForegroundColor White }
} else {
    $practicesIssues += "WARN: No design token files detected"
}

# 4. CSS Modules Best Practices
Write-Host ""
Write-Host "4. CSS Modules Analysis..." -ForegroundColor Cyan
$moduleIssues = 0

foreach ($moduleFile in $moduleFiles) {
    $content = Get-Content $moduleFile.FullName -Encoding UTF8 -ErrorAction SilentlyContinue
    if ($content) {
        # Check for BEM compliance indicators
        $camelCaseClasses = $content | Select-String -Pattern '\.[a-z]+[A-Z]' -AllMatches
        
        if ($camelCaseClasses -and $camelCaseClasses.Matches.Count -gt 0) {
            $moduleIssues++
            Write-Host "   INFO: $($moduleFile.Name) uses camelCase classes (not BEM)" -ForegroundColor Yellow
        }
    }
}

if ($moduleIssues -eq 0) {
    Write-Host "   All CSS Modules appear to follow BEM conventions" -ForegroundColor Green
}

# 5. File Size & Performance Analysis
Write-Host ""
Write-Host "5. Performance Analysis..." -ForegroundColor Cyan
$largeFiles = @()
$totalSize = 0

$cssFiles | ForEach-Object {
    $fileSize = [math]::Round($_.Length / 1KB, 2)
    $totalSize += $fileSize
    $type = if ($_.Name -like "*.module.css") { "Module" } else { "Global" }
    
    if ($fileSize -gt 20) {
        $largeFiles += "$($_.Name) - ${fileSize}KB"
    }
    
    Write-Host "   $($_.Name) - ${fileSize}KB ($type)" -ForegroundColor White
}

Write-Host ""
Write-Host "   Total CSS Size: ${totalSize}KB" -ForegroundColor Cyan

if ($largeFiles.Count -gt 0) {
    Write-Host "   Large Files (>20KB):" -ForegroundColor Yellow
    $largeFiles | ForEach-Object { Write-Host "     - $_" -ForegroundColor Yellow }
}

# 6. Final Results
Write-Host ""
Write-Host "=== FINAL RESULTS ===" -ForegroundColor Yellow
Write-Host "Total !important declarations: $totalImportantCount" -ForegroundColor $(if ($totalImportantCount -lt 50) { "Green" } else { "Red" })

if ($conflictIssues.Count -eq 0 -and $practicesIssues.Count -eq 0) {
    Write-Host "SUCCESS: All design best practices checks passed!" -ForegroundColor Green
} else {
    Write-Host "Issues found that need attention:" -ForegroundColor Red
    ($conflictIssues + $practicesIssues) | ForEach-Object { 
        Write-Host "  - $_" -ForegroundColor Yellow 
    }
}

# 7. Recommendations
Write-Host ""
Write-Host "=== RECOMMENDATIONS ===" -ForegroundColor Magenta
if ($totalImportantCount -gt 30) {
    Write-Host "- Priority: Reduce !important usage through better CSS specificity" -ForegroundColor White
}
if ($moduleIssues -gt 5) {
    Write-Host "- Consider standardizing CSS Modules naming to BEM convention" -ForegroundColor White
}
if ($largeFiles.Count -gt 3) {
    Write-Host "- Consider splitting large CSS files for better performance" -ForegroundColor White
}

Write-Host ""
Write-Host "Analysis completed!" -ForegroundColor Green
