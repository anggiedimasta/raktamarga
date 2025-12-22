# Quick server test script
Write-Host "Testing API server endpoints..." -ForegroundColor Cyan

$endpoints = @(
    @{ Path = "/"; Name = "Root" },
    @{ Path = "/health"; Name = "Health Check" }
)

foreach ($endpoint in $endpoints) {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3000$($endpoint.Path)" -Method GET -ErrorAction Stop
        Write-Host "✓ $($endpoint.Name): OK" -ForegroundColor Green
        $response | ConvertTo-Json -Depth 3
    }
    catch {
        Write-Host "✗ $($endpoint.Name): FAILED" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Yellow
    }
    Write-Host ""
}
