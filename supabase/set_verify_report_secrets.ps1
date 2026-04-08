param(
  [Parameter(Mandatory = $true)]
  [string]$MlServiceUrl,

  [string]$MlServiceToken = "",
  [string]$ProjectRef = ""
)

$supabaseCli = Get-Command supabase -ErrorAction SilentlyContinue

if (-not $supabaseCli) {
  throw "Supabase CLI is not installed or not on PATH."
}

$arguments = @("secrets", "set", "ML_SERVICE_URL=$MlServiceUrl")

if ($MlServiceToken) {
  $arguments += "ML_SERVICE_TOKEN=$MlServiceToken"
}

if ($ProjectRef) {
  $arguments += "--project-ref"
  $arguments += $ProjectRef
}

Write-Host "Updating Supabase Edge Function secrets..."
& $supabaseCli.Source @arguments
