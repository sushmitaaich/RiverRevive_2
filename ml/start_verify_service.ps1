$repoRoot = Split-Path -Parent $PSScriptRoot
$pythonPath = Join-Path $repoRoot ".venv\\Scripts\\python.exe"
$weightsPath = Join-Path $PSScriptRoot "best.pt"

if (-not (Test-Path -LiteralPath $pythonPath)) {
  throw "Python venv executable not found at $pythonPath"
}

if (-not (Test-Path -LiteralPath $weightsPath)) {
  throw "Model weights not found at $weightsPath"
}

Set-Location $repoRoot
$env:RIVERREVIVE_YOLO_WEIGHTS = $weightsPath

Write-Host "Starting RiverRevive ML verification service..."
Write-Host "Python:  $pythonPath"
Write-Host "Weights: $weightsPath"

& $pythonPath -m uvicorn ml.service:app --host 0.0.0.0 --port 8000
