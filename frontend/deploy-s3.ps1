# Script de Despliegue Estatico a Amazon S3 (Free Tier $0.00 USD)
param (
  [string]$BucketName = "sistema-tutorias-upds",
  [string]$Region = "us-east-2"
)

$FrontendPath = $PSScriptRoot

Write-Host "Iniciando sincronizacion de Frontend SPA hacia Amazon S3..." -ForegroundColor Cyan
Write-Host "Bucket destino: s3://$BucketName/frontend" -ForegroundColor Yellow
Write-Host "Region: $Region" -ForegroundColor Yellow

# Sincronizar archivos estaticos
aws s3 sync "$FrontendPath" "s3://$BucketName/frontend" --region $Region --exclude "deploy-s3.ps1" --exclude "*.test.mjs" --cache-control "max-age=300" --delete

if ($LASTEXITCODE -eq 0) {
    Write-Host "Despliegue estatico a S3 completado con exito a costo $0.00 USD." -ForegroundColor Green
    Write-Host "Ubicacion: s3://$BucketName/frontend/index.html" -ForegroundColor Green
} else {
    Write-Host "Error durante la sincronizacion a S3." -ForegroundColor Red
}
