# PowerShell Profile用エイリアス設定
# $PROFILE ファイルに追加してください

# Agent失敗時の完全リセット
function Reset-AgentWork {
    Write-Host "🔄 Agent作業をリセットします..." -ForegroundColor Yellow
    git reset --hard HEAD
    git clean -fd
    Write-Host "✅ リセット完了！" -ForegroundColor Green
}

# エイリアス登録
Set-Alias -Name "agent-reset" -Value Reset-AgentWork

# 使用方法の表示
function Show-AgentCommands {
    Write-Host "🤖 Agent作業用コマンド:" -ForegroundColor Cyan
    Write-Host "  agent-reset  : Agent作業を完全リセット" -ForegroundColor White
    Write-Host "  git-status   : Git状態確認" -ForegroundColor White
}

Set-Alias -Name "agent-help" -Value Show-AgentCommands

Write-Host "✅ Agent用エイリアスが登録されました！" -ForegroundColor Green
Write-Host "💡 'agent-help' でコマンド一覧を表示" -ForegroundColor Yellow
