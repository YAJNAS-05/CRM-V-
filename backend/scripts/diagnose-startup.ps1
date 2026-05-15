param(
    [string]$Profile = "h2",
    [string]$SupabaseUrl = "https://epkxbbcmztgrefxfrdvh.supabase.co",
    [string]$SupabaseServiceRoleKey = "local-dev-placeholder",
    [int]$ServerPort = 8080
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Split-Path -Parent $scriptDir
$logDir = Join-Path $backendDir "target\startup-diagnostics"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logFile = Join-Path $logDir "startup-$timestamp.log"

New-Item -ItemType Directory -Path $logDir -Force | Out-Null

Set-Location $backendDir

if (-not (Get-Command mvn -ErrorAction SilentlyContinue)) {
    throw "Maven (mvn) was not found in PATH."
}

$env:SPRING_PROFILES_ACTIVE = $Profile
$env:SUPABASE_URL = $SupabaseUrl
$env:SUPABASE_SERVICE_ROLE_KEY = $SupabaseServiceRoleKey

Write-Host "Starting backend diagnostics..."
Write-Host "Profile: $Profile"
Write-Host "ServerPort: $ServerPort"
Write-Host "Log file: $logFile"

mvn spring-boot:run "-Dspring-boot.run.profiles=$Profile" "-Dspring.main.banner-mode=off" "-Dlogging.level.root=INFO" "-Dserver.port=$ServerPort" *>&1 | Tee-Object -FilePath $logFile
$exitCode = $LASTEXITCODE

Write-Host ""
Write-Host "==== Diagnostic Summary ===="
Write-Host "Exit code: $exitCode"

if (Test-Path $logFile) {
    Write-Host ""
    Write-Host "Potential root-cause lines:"
    Select-String -Path $logFile -Pattern "APPLICATION FAILED TO START|Error creating bean|UnsatisfiedDependencyException|UnknownEntityException|SUPABASE_URL must be set|Port [0-9]+ was already in use|Description:|Action:" -CaseSensitive:$false |
        Select-Object -First 25 |
        ForEach-Object { Write-Host $_.Line }

    Write-Host ""
    Write-Host "Last 40 lines of log:"
    Get-Content $logFile -Tail 40 | ForEach-Object { Write-Host $_ }
}

exit $exitCode
