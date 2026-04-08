param(
  [string]$ServiceUrl = "http://127.0.0.1:8000"
)

$cloudflared = Get-Command cloudflared -ErrorAction SilentlyContinue
$ngrok = Get-Command ngrok -ErrorAction SilentlyContinue

if ($cloudflared) {
  Write-Host "Starting Cloudflare quick tunnel for $ServiceUrl"
  & $cloudflared.Source tunnel --url $ServiceUrl
  exit $LASTEXITCODE
}

if ($ngrok) {
  Write-Host "Starting ngrok tunnel for $ServiceUrl"
  & $ngrok.Source http $ServiceUrl
  exit $LASTEXITCODE
}

throw "Install cloudflared or ngrok to expose the local ML service publicly."
