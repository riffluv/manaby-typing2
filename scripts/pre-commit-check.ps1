# Pre-Commit Check Script
# コミット前の安全チェック用

Write-Host "🔍 コミット前チェックを実行します..." -ForegroundColor Yellow

# 1. 空ファイル検出
Write-Host "📁 空ファイルチェック..." -ForegroundColor Cyan
$emptyFiles = Get-ChildItem -Recurse -File | Where-Object { 
    $_.Length -eq 0 -and 
    $_.FullName -notlike "*node_modules*" -and
    $_.Name -ne "settings.json" -and
    $_.Name -ne ".gitkeep"
}

$hasIssues = $false

if ($emptyFiles) {
    Write-Host "❌ 空ファイルが見つかりました:" -ForegroundColor Red
    $emptyFiles | ForEach-Object { Write-Host "  - $($_.FullName)" -ForegroundColor Yellow }
    $hasIssues = $true
}

# 2. ステージングエリアチェック
Write-Host "📋 ステージングエリアチェック..." -ForegroundColor Cyan
$stagedFiles = git diff --cached --name-only
if ($stagedFiles) {
    Write-Host "📝 ステージングされたファイル:" -ForegroundColor Green
    $stagedFiles | ForEach-Object { Write-Host "  + $_" -ForegroundColor Green }
} else {
    Write-Host "⚠️ ステージングされたファイルがありません" -ForegroundColor Yellow
    $hasIssues = $true
}

# 3. 最適化ファイル検出
Write-Host "🔧 不要ファイルチェック..." -ForegroundColor Cyan
$unnecessaryFiles = Get-ChildItem -Recurse -Include "*.optimized.*", "*.backup.*", "*-responsive.*" | 
    Where-Object { $_.FullName -notlike "*node_modules*" }

if ($unnecessaryFiles) {
    Write-Host "❌ 不要ファイルが見つかりました:" -ForegroundColor Red
    $unnecessaryFiles | ForEach-Object { Write-Host "  - $($_.FullName)" -ForegroundColor Yellow }
    $hasIssues = $true
}

# 4. 結果
if ($hasIssues) {
    Write-Host "`n❌ コミット前に問題を修正してください！" -ForegroundColor Red
    Write-Host "💡 解決方法:" -ForegroundColor Magenta
    Write-Host "  1. 空ファイルを削除: Get-ChildItem -Recurse -File | Where-Object { `$_.Length -eq 0 } | Remove-Item" -ForegroundColor White
    Write-Host "  2. 不要ファイルを削除" -ForegroundColor White
    Write-Host "  3. 必要なファイルをステージング: git add <file>" -ForegroundColor White
    exit 1
} else {
    Write-Host "`n✅ コミット準備完了！" -ForegroundColor Green
    Write-Host "🚀 git commit でコミットできます" -ForegroundColor Cyan
}
