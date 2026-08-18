param(
  [Parameter(Mandatory = $true)]
  [string]$Message,

  [string]$Workflow = "deploy.yml",
  [string]$HubUrl = "http://hub.34.66.94.12.nip.io/",
  [string]$DiscoveryUrl = "http://discovery.34.66.94.12.nip.io/api/health",
  [switch]$StageAll
)

$ErrorActionPreference = "Stop"

function Step($text) {
  Write-Host "`n==> $text" -ForegroundColor Cyan
}

Step "Cloud ship preflight"
git rev-parse --is-inside-work-tree | Out-Null

$branch = (git rev-parse --abbrev-ref HEAD).Trim()
if (-not $branch) {
  throw "Could not determine current branch."
}
Write-Host "Branch: $branch"

if ($StageAll) {
  Step "Staging all changes"
  git add -A
}

Step "Checking staged changes"
$staged = git diff --cached --name-only
if (-not $staged) {
  throw "No staged changes. Stage files first, or re-run with -StageAll."
}

Step "Committing"
git commit -m "$Message"

Step "Pushing"
git push origin $branch

Step "Watching deploy workflow"
$runId = (gh run list --workflow=$Workflow --limit 1 --json databaseId --jq ".[0].databaseId").Trim()
if (-not $runId) {
  throw "Could not resolve latest workflow run id for $Workflow."
}
Write-Host "Watching run $runId"
gh run watch $runId --exit-status

Step "Live smoke checks"
curl.exe -sI "$HubUrl"
curl.exe -s "$DiscoveryUrl"

Write-Host "`nCloud ship completed." -ForegroundColor Green
