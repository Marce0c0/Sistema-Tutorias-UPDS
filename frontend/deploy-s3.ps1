# Script de Despliegue Estatico a Amazon S3 & CloudFront (Free Tier $0.00 USD)
param (
  [string]$BucketName = "sistema-tutorias-upds-264425049862",
  [string]$DistributionId = "EL8CCVSUKKZC2",
  [string]$Region = "us-east-2"
)

$FrontendPath = $PSScriptRoot

Write-Host "Iniciando sincronizacion limpia de Frontend SPA..." -ForegroundColor Cyan
Write-Host "Bucket destino: s3://$BucketName/frontend" -ForegroundColor Yellow
Write-Host "CloudFront ID: $DistributionId" -ForegroundColor Yellow
Write-Host "Region: $Region" -ForegroundColor Yellow

# Sincronizar archivos estaticos a S3 con --delete para evitar archivos huerfanos o conflictos de sobreescritura
aws s3 sync "$FrontendPath" "s3://$BucketName/frontend" --region $Region --exclude "deploy-s3.ps1" --exclude "*.test.mjs" --cache-control "no-cache, no-store, must-revalidate" --delete

if ($LASTEXITCODE -eq 0) {
    Write-Host "Sincronizacion limpia a S3 completada con exito." -ForegroundColor Green
    Write-Host "Ubicacion: s3://$BucketName/frontend/index.html" -ForegroundColor Green

    # Invalidacion de CloudFront para cargar todo fresco de 0 sin conflictos de cache
    if ($DistributionId) {
        Write-Host "Creando invalidacion en CloudFront ($DistributionId) para purgar cache y cargar desde 0..." -ForegroundColor Cyan
        aws cloudfront create-invalidation --distribution-id $DistributionId --paths "/*"
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Cache de CloudFront invalidada exitosamente." -ForegroundColor Green
            Write-Host "Acceso CDN Global: https://d3i4klrqeo94p9.cloudfront.net/" -ForegroundColor Cyan
        } else {
            Write-Host "Advertencia: No se pudo invalidar la cache en CloudFront." -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "Error durante la sincronizacion a S3." -ForegroundColor Red
}
