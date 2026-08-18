# Finalize physical rename: lead discover - ulntech -> lead discover - sleekly
# Run with nothing locking the Lead Discover tree (stop pnpm/node/Cursor indexing of that folder if needed).
$ErrorActionPreference = 'Stop'

$htdocs = 'C:\xampp\htdocs'
$old = Join-Path $htdocs 'lead discover - ulntech'
$new = Join-Path $htdocs 'lead discover - sleekly'

# Prefer current workspace; fall back to renamed root
$repoCandidates = @(
  (Join-Path $htdocs 'ulnovatech'),
  (Join-Path $htdocs 'sleeklybuilt')
)
$repoRoot = $repoCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if (-not $repoRoot) { throw 'Repo root not found under htdocs (ulnovatech or sleeklybuilt).' }
$disco = Join-Path $repoRoot 'discovery'

Write-Host "Repo: $repoRoot"
Write-Host "Old:  $old"
Write-Host "New:  $new"

# 1) Remove discovery junction (if any)
if (Test-Path -LiteralPath $disco) {
  $di = Get-Item -LiteralPath $disco -Force
  if ($di.LinkType -eq 'Junction' -or ($di.Attributes -band [IO.FileAttributes]::ReparsePoint)) {
    cmd /c "rmdir ""$disco""" | Out-Null
    Write-Host 'Removed discovery junction'
  } else {
    throw "discovery exists and is not a junction: $disco"
  }
}

# 2) Remove alias junction named lead discover - sleekly (if it points at old)
if (Test-Path -LiteralPath $new) {
  $ni = Get-Item -LiteralPath $new -Force
  if ($ni.LinkType -eq 'Junction' -or ($ni.Attributes -band [IO.FileAttributes]::ReparsePoint)) {
    cmd /c "rmdir ""$new""" | Out-Null
    Write-Host 'Removed sleekly alias junction'
  } elseif (Test-Path -LiteralPath $old) {
    throw "Both physical folders exist: '$old' and '$new'. Resolve manually."
  } else {
    Write-Host 'Physical sleekly folder already present — skipping rename'
  }
}

# 3) Rename physical folder
if (Test-Path -LiteralPath $old) {
  Rename-Item -LiteralPath $old -NewName 'lead discover - sleekly'
  Write-Host 'Renamed ulntech -> sleekly'
}

if (-not (Test-Path -LiteralPath $new)) {
  throw "Expected physical folder missing after rename: $new"
}

# 4) Recreate discovery junction
cmd /c "mklink /J ""$disco"" ""$new"""
if (-not (Test-Path -LiteralPath (Join-Path $disco 'package.json'))) {
  throw 'discovery junction created but package.json not reachable'
}
Write-Host "Done. discovery -> $new"
