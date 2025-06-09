# Git Reset & Clean Script
# Agent作業失敗後の完全リセット用スクリプト

Write-Host "🔄 Git Reset & Clean を実行します..." -ForegroundColor Yellow

# 1. ハードリセット
Write-Host "📍 git reset --hard HEAD 実行中..." -ForegroundColor Cyan
git reset --hard HEAD

# 2. 未追跡ファイル削除
Write-Host "🧹 git clean -fd 実行中..." -ForegroundColor Cyan  
git clean -fd

# 3. node_modules以外の空ファイル削除
Write-Host "🗑️ 空ファイルクリーンアップ中..." -ForegroundColor Cyan
Get-ChildItem -Recurse -File | Where-Object { 
    $_.Length -eq 0 -and 
    $_.FullName -notlike "*node_modules*" -and
    $_.Name -ne "settings.json"
} | Remove-Item -Force -ErrorAction SilentlyContinue

# 4. 一時ファイル削除
Write-Host "🧽 一時ファイルクリーンアップ中..." -ForegroundColor Cyan
Get-ChildItem -Recurse -Include "*.tmp", "*.temp", "*.bak", "*~", ".DS_Store" | 
    Where-Object { $_.FullName -notlike "*node_modules*" } | 
    Remove-Item -Force -ErrorAction SilentlyContinue

# 5. 状態確認
Write-Host "✅ クリーンアップ完了！" -ForegroundColor Green
Write-Host "📊 Git状態:" -ForegroundColor Yellow
git status --short

Write-Host "🎯 使用方法: .\scripts\reset-clean.ps1" -ForegroundColor Magenta
