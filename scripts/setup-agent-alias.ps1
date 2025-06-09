# PowerShell Profile Setup Script
# Agent Reset Alias Registration

function Reset-AgentWork {
    Write-Host "Resetting Agent work..." -ForegroundColor Yellow
    git reset --hard HEAD
    git clean -fd
    Write-Host "Reset complete!" -ForegroundColor Green
}

Set-Alias -Name "agent-reset" -Value Reset-AgentWork

function Show-AgentCommands {
    Write-Host "Agent Commands:" -ForegroundColor Cyan
    Write-Host "  agent-reset : Reset Agent work completely" -ForegroundColor White
}

Set-Alias -Name "agent-help" -Value Show-AgentCommands

Write-Host "Agent aliases registered successfully!" -ForegroundColor Green
Write-Host "Use 'agent-help' for command list" -ForegroundColor Yellow
