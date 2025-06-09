# Git Reset & Clean Script
# Agent作業失敗後の完全リセット用スクリプト

Write-Host "🔄 Git Reset & Clean を実行します..." -ForegroundColor Yellow

# 1. コミット前チェック: 空ファイル検出
Write-Host "🔍 空ファイルチェック中..." -ForegroundColor Cyan
$emptyFiles = Get-ChildItem -Recurse -File | Where-Object { 
    $_.Length -eq 0 -and 
    $_.FullName -notlike "*node_modules*" -and
    $_.Name -ne "settings.json" -and
    $_.Name -ne ".gitkeep"
}

if ($emptyFiles) {
    Write-Host "⚠️ 警告: 空ファイルが見つかりました!" -ForegroundColor Red
    $emptyFiles | ForEach-Object { Write-Host "  - $($_.FullName)" -ForegroundColor Yellow }
    Write-Host "💡 これらのファイルを削除してからコミットしてください" -ForegroundColor Magenta
    
    $response = Read-Host "空ファイルを削除しますか? (y/N)"
    if ($response -eq "y" -or $response -eq "Y") {
        $emptyFiles | Remove-Item -Force
        Write-Host "✅ 空ファイルを削除しました" -ForegroundColor Green
    }
}

# 2. ハードリセット
Write-Host "📍 git reset --hard HEAD 実行中..." -ForegroundColor Cyan
git reset --hard HEAD

# 3. 未追跡ファイル削除
Write-Host "🧹 git clean -fd 実行中..." -ForegroundColor Cyan  
git clean -fd

# 4. 最終確認
Write-Host "✅ クリーンアップ完了！" -ForegroundColor Green
Write-Host "📊 Git状態:" -ForegroundColor Yellow
git status --short

Write-Host "🎯 使用方法: .\scripts\reset-clean.ps1" -ForegroundColor Magenta
