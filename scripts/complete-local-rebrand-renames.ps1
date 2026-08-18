# Complete remaining local rebrand renames (run AFTER closing Cursor)
# - Physical Lead Discover folder
# - Workspace root ulnovatech -> sleeklybuilt
$ErrorActionPreference = 'Stop'
$htdocs = 'C:\xampp\htdocs'

Write-Host '==> Lead Discover physical rename'
$oldLd = Join-Path $htdocs 'lead discover - ulntech'
$newLd = Join-Path $htdocs 'lead discover - sleekly'
$repoOld = Join-Path $htdocs 'ulnovatech'
$repoNew = Join-Path $htdocs 'sleeklybuilt'

function Remove-Junction([string]$path) {
  if (-not (Test-Path -LiteralPath $path)) { return }
  $item = Get-Item -LiteralPath $path -Force
  if ($item.LinkType -eq 'Junction' -or ($item.Attributes -band [IO.FileAttributes]::ReparsePoint)) {
    cmd /c "rmdir ""$path""" | Out-Null
  }
}

# Prefer operating against whichever repo root exists
$repo = if (Test-Path -LiteralPath $repoOld) { $repoOld } elseif (Test-Path -LiteralPath $repoNew) { $repoNew } else { $null }
if (-not $repo) { throw 'Neither ulnovatech nor sleeklybuilt repo root found.' }
$disco = Join-Path $repo 'discovery'

Remove-Junction $disco
if ((Test-Path -LiteralPath $newLd) -and (Get-Item -LiteralPath $newLd -Force).LinkType -eq 'Junction') {
  Remove-Junction $newLd
}
if (Test-Path -LiteralPath $oldLd) {
  Rename-Item -LiteralPath $oldLd -NewName 'lead discover - sleekly'
  Write-Host 'Renamed lead discover - ulntech -> lead discover - sleekly'
} elseif (-not (Test-Path -LiteralPath $newLd)) {
  throw 'Lead Discover folder missing'
}

Write-Host '==> Workspace root rename'
if (Test-Path -LiteralPath $repoOld) {
  # discovery junction must not exist during rename
  Remove-Junction (Join-Path $repoOld 'discovery')
  Rename-Item -LiteralPath $repoOld -NewName 'sleeklybuilt'
  $repo = $repoNew
  Write-Host 'Renamed ulnovatech -> sleeklybuilt'
}
$disco = Join-Path $repo 'discovery'
Remove-Junction $disco
cmd /c "mklink /J ""$disco"" ""$newLd"""
if (-not (Test-Path -LiteralPath (Join-Path $disco 'package.json'))) {
  throw 'discovery junction broken after rename'
}

Write-Host ''
Write-Host 'DONE. Re-open Cursor on C:\xampp\htdocs\sleeklybuilt'
Write-Host 'Then: git remote set-url origin https://github.com/ulnovatech/sleeklybuilt.git'
