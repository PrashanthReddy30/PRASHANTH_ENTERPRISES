# ============================================================
# PRASHANTH ENTERPRISES HRM - GitHub Auto-Sync Watcher
# Watches for ANY file change and auto commits + pushes
# ============================================================

$ProjectPath = "C:\Users\sandh\.antigravity\extensions\PRASHANTH ENTERPRISES\prashanth-enterprises-hrm"
$Branch      = "main"
$LogFile     = "$ProjectPath\auto-sync.log"
$DebounceMs  = 5000   # Wait 5 seconds after last change before pushing

Set-Location $ProjectPath

function Write-Log($msg) {
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $line = "[$ts] $msg"
    Write-Host $line -ForegroundColor Cyan
    Add-Content -Path $LogFile -Value $line
}

Write-Log "=========================================="
Write-Log " HRM Auto-Sync GitHub Watcher STARTED"
Write-Log " Watching: $ProjectPath"
Write-Log " Remote  : $(git remote get-url origin)"
Write-Log "=========================================="

# File system watcher - watches src/, firebase/, public/, *.json, *.js, *.jsx, *.css, *.html
$watcher                       = New-Object System.IO.FileSystemWatcher
$watcher.Path                  = $ProjectPath
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents   = $true
$watcher.NotifyFilter          = [System.IO.NotifyFilters]'FileName, LastWrite, DirectoryName'

# Filters: only track source files (ignore node_modules, .git, dist, logs)
$watcher.Filter = "*.*"

$global:PendingCommit = $false
$global:LastChangedFile = ""
$global:LastChangeTime = [DateTime]::MinValue

$action = {
    $filePath = $Event.SourceEventArgs.FullPath

    # Skip ignored paths
    $ignored = @("node_modules", ".git", "dist", "auto-sync.log", "auto-sync.ps1")
    foreach ($ig in $ignored) {
        if ($filePath -like "*$ig*") { return }
    }

    $global:PendingCommit     = $true
    $global:LastChangedFile   = $filePath
    $global:LastChangeTime    = [DateTime]::UtcNow

    $shortName = $filePath.Replace($ProjectPath, "").TrimStart('\')
    $ts = Get-Date -Format "HH:mm:ss"
    Write-Host "[$ts] CHANGE DETECTED: $shortName" -ForegroundColor Yellow
}

# Register all event types
Register-ObjectEvent $watcher "Changed" -Action $action | Out-Null
Register-ObjectEvent $watcher "Created" -Action $action | Out-Null
Register-ObjectEvent $watcher "Deleted" -Action $action | Out-Null
Register-ObjectEvent $watcher "Renamed" -Action $action | Out-Null

Write-Log "Watcher active. Any code change will be auto-committed and pushed to GitHub."
Write-Host ""
Write-Host "  Press Ctrl+C to stop the auto-sync watcher." -ForegroundColor Green
Write-Host ""

# Main polling loop
while ($true) {
    Start-Sleep -Milliseconds 1000

    if ($global:PendingCommit) {
        $elapsed = ([DateTime]::UtcNow - $global:LastChangeTime).TotalMilliseconds

        # Debounce: wait until no more changes for $DebounceMs
        if ($elapsed -ge $DebounceMs) {
            $global:PendingCommit = $false

            Write-Log "--- Auto-sync triggered ---"

            # Stage all changes
            git add . 2>&1 | Out-Null

            # Check if there is anything to commit
            $status = git status --porcelain
            if ($status) {
                # Build a smart commit message
                $changedFiles = git diff --cached --name-only
                $fileCount    = ($changedFiles | Measure-Object).Count
                $firstFile    = ($changedFiles | Select-Object -First 1)
                $timestamp    = Get-Date -Format "yyyy-MM-dd HH:mm"

                if ($fileCount -eq 1) {
                    $commitMsg = "auto: update $firstFile [$timestamp]"
                } else {
                    $commitMsg = "auto: update $fileCount files [$timestamp]"
                }

                git commit -m $commitMsg 2>&1 | Out-Null

                # Push to GitHub
                Write-Log "Pushing: $commitMsg"
                $pushResult = git push origin $Branch 2>&1
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Log "SUCCESS pushed to GitHub (origin/$Branch)"
                    Write-Host "  [SUCCESS] Pushed: $commitMsg" -ForegroundColor Green
                } else {
                    Write-Log "ERROR pushing: $pushResult"
                    Write-Host "  [ERROR] Push failed: $pushResult" -ForegroundColor Red
                }
            } else {
                Write-Log "No staged changes found - nothing to commit."
            }

            Write-Host ""
        }
    }
}
