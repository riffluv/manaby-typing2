# Pre-Commit Check Script
# UTF-8 エンコーディング対応版

# PowerShellの文字エンコーディングを設定
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "CSS Conflict & Design Best Practices Check" -ForegroundColor Yellow

# 1. CSS競合チェック
Write-Host "CSS Conflicts Check..." -ForegroundColor Cyan
$cssFiles = Get-ChildItem -Recurse -Include "*.css", "*.module.css" | 
    Where-Object { $_.FullName -notlike "*node_modules*" }

$conflictIssues = @()

foreach ($file in $cssFiles) {
    $content = Get-Content $file.FullName -Encoding UTF8 -ErrorAction SilentlyContinue
    if ($content) {
        # !important 使用チェック
        $importantCount = ($content | Select-String -Pattern "!important" -AllMatches).Matches.Count
        if ($importantCount -gt 0) {
            $conflictIssues += "WARN: $($file.Name) has $importantCount '!important' declarations"
        }
        
        # インラインスタイルチェック
        $inlineStyles = ($content | Select-String -Pattern "style\s*=" -AllMatches).Matches.Count
        if ($inlineStyles -gt 0) {
            $conflictIssues += "WARN: $($file.Name) has $inlineStyles inline styles"
        }
        
        # CSS Modules準拠チェック
        if ($file.Name -like "*.module.css") {
            $nonBemClasses = $content | Select-String -Pattern "\.[a-z]+[A-Z]" -AllMatches
            if ($nonBemClasses.Matches.Count -gt 0) {
                $conflictIssues += "INFO: $($file.Name) may have non-BEM classes"
            }
        }
    }
}

# 2. Design Best Practices チェック
Write-Host "Design Best Practices Check..." -ForegroundColor Cyan
$practicesIssues = @()

# CSS-Design-Best-Practices.mdの存在確認
$bestPracticesFile = "CSS-Design-Best-Practices.md"
if (Test-Path $bestPracticesFile) {
    Write-Host "  Found: $bestPracticesFile" -ForegroundColor Green
} else {
    $practicesIssues += "ERROR: CSS-Design-Best-Practices.md not found"
}

# デザイントークンファイルの確認
$designTokenFiles = Get-ChildItem -Recurse -Include "*tokens*", "*variables*", "*globals*" -Name "*.css"
if ($designTokenFiles) {
    Write-Host "  Design Token Files:" -ForegroundColor Green
    $designTokenFiles | ForEach-Object { Write-Host "    + $_" -ForegroundColor Green }
} else {
    $practicesIssues += "WARN: No design token files found"
}

if ($conflictIssues -or $practicesIssues) {
    Write-Host "`nIssues Found:" -ForegroundColor Red
    ($conflictIssues + $practicesIssues) | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
} else {
    Write-Host "`nAll checks passed!" -ForegroundColor Green
}

# 3. CSS Files Analysis
Write-Host "`nCSS Files Analysis:" -ForegroundColor Cyan
$cssFiles | ForEach-Object {
    $fileSize = [math]::Round($_.Length / 1KB, 2)
    $status = if ($_.Name -like "*.module.css") { "CSS Modules" } else { "Global CSS" }
    Write-Host "  $($_.Name) - ${fileSize}KB ($status)" -ForegroundColor White
}

Write-Host "`nCheck completed!" -ForegroundColor Green

# 4. Final Status
if ($conflictIssues.Count -gt 0 -or $practicesIssues.Count -gt 0) {
    Write-Host "`n⚠️ Issues found - Review recommended before commit" -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "`n✅ All checks passed!" -ForegroundColor Green
    Write-Host "🚀 Ready for commit" -ForegroundColor Cyan
}
