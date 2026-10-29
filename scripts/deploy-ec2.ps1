# ==============================================================================
# Script de Despliegue Automatizado a AWS EC2 & CloudFront CDN
# Sistema de Gestión de Cursos, Talleres & Hackathons — UPDS Cochabamba
# ==============================================================================
param (
    [string]$KeyPath = "$HOME\.ssh\upds-ec2-key.pem",
    [string]$HostIp = "13.58.165.156",
    [string]$User = "ubuntu",
    [string]$DistributionId = "EL8CCVSUKKZC2",
    [string]$Region = "us-east-2"
)

$ErrorActionPreference = "Stop"
$ProjectRoot = (Get-Item $PSScriptRoot).Parent.FullName

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   DESPLIEGUE A PRODUCCIÓN AWS (EC2 + CLOUDFRONT CDN)     " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Servidor EC2     : $User@$HostIp" -ForegroundColor Yellow
Write-Host "CloudFront Dist  : $DistributionId" -ForegroundColor Yellow
Write-Host "Llave SSH        : $KeyPath" -ForegroundColor Yellow

if (-not (Test-Path $KeyPath)) {
    Write-Host "Error: No se encontró la llave SSH en $KeyPath" -ForegroundColor Red
    exit 1
}

$FrontendArchive = Join-Path $env:TEMP "frontend_dist.tar.gz"
$BackendArchive  = Join-Path $env:TEMP "backend_dist.tar.gz"

try {
    Write-Host "[1/5] Empaquetando Frontend y Backend..." -ForegroundColor Yellow
    tar.exe -czf $FrontendArchive -C "$ProjectRoot\frontend" .
    tar.exe -czf $BackendArchive -C "$ProjectRoot\backend" src prisma package.json

    Write-Host "[2/5] Transfiriendo paquetes a la instancia EC2 vía SCP..." -ForegroundColor Yellow
    scp.exe -i $KeyPath -o StrictHostKeyChecking=no $FrontendArchive "${User}@${HostIp}:/home/ubuntu/frontend_dist.tar.gz"
    scp.exe -i $KeyPath -o StrictHostKeyChecking=no $BackendArchive  "${User}@${HostIp}:/home/ubuntu/backend_dist.tar.gz"

    Write-Host "[3/5] Extrayendo archivos y reconstruyendo contenedores Docker..." -ForegroundColor Yellow
    $RemoteCommands = "tar -xzf /home/ubuntu/frontend_dist.tar.gz -C /home/ubuntu/app/frontend/ && " +
                      "tar -xzf /home/ubuntu/backend_dist.tar.gz -C /home/ubuntu/app/backend/ && " +
                      "cd /home/ubuntu/app && " +
                      "docker compose build frontend backend && " +
                      "docker compose up -d frontend backend && " +
                      "rm -f /home/ubuntu/frontend_dist.tar.gz /home/ubuntu/backend_dist.tar.gz"

    ssh.exe -i $KeyPath -o StrictHostKeyChecking=no "${User}@${HostIp}" $RemoteCommands

    Write-Host "[4/5] Invalidando caché en CloudFront ($DistributionId)..." -ForegroundColor Yellow
    aws cloudfront create-invalidation --distribution-id $DistributionId --paths "/*" --region $Region

    Write-Host "[5/5] Limpiando archivos temporales locales..." -ForegroundColor Yellow
    Remove-Item $FrontendArchive, $BackendArchive -Force -ErrorAction SilentlyContinue

    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "   ¡DESPLIEGUE COMPLETADO CON ÉXITO!                      " -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "URL Global HTTPS : https://d3i4klrqeo94p9.cloudfront.net/" -ForegroundColor Cyan
}
catch {
    Write-Host "Error durante el despliegue: $_" -ForegroundColor Red
    Remove-Item $FrontendArchive, $BackendArchive -Force -ErrorAction SilentlyContinue
    exit 1
}

