# Script de Control de Instancia EC2 AWS — Sistema de Tutorias UPDS
# Permite pausar (costo $0 compute) y reanudar tu servidor en cualquier momento.
param (
    [ValidateSet("status", "start", "stop", "url")]
    [string]$Action = "status",
    [string]$InstanceId = "i-073d28b3f08cc01f8",
    [string]$Region = "us-east-2"
)

function Get-InstanceDetails {
    $data = aws ec2 describe-instances --instance-ids $InstanceId --region $Region --query "Reservations[0].Instances[0]" --output json | ConvertFrom-Json
    return $data
}

switch ($Action) {
    "status" {
        $inst = Get-InstanceDetails
        $state = $inst.State.Name
        $ip = $inst.PublicIpAddress
        $dns = $inst.PublicDnsName

        Write-Host "==========================================" -ForegroundColor Cyan
        Write-Host "   ESTADO DEL SERVIDOR AWS (UPDS)" -ForegroundColor Cyan
        Write-Host "==========================================" -ForegroundColor Cyan
        Write-Host "Instancia ID : $InstanceId"
        Write-Host "Region       : $Region"
        
        if ($state -eq "running") {
            Write-Host "Estado       : ENCENDIDO ($state)" -ForegroundColor Green
            Write-Host "URL SSL (HTTPS): https://d3i4klrqeo94p9.cloudfront.net" -ForegroundColor Cyan
            Write-Host "URL Directa (80): http://$ip" -ForegroundColor Yellow
            Write-Host "API Backend  : https://d3i4klrqeo94p9.cloudfront.net/api/tutorias" -ForegroundColor Green
        } else {
            Write-Host "Estado       : PAUSADO / APAGADO ($state)" -ForegroundColor Red
            Write-Host "Costo actual : `$0.00 USD de computo (Consumo pausado)" -ForegroundColor Green
            Write-Host "Para iniciar : .\scripts\aws-control.ps1 -Action start" -ForegroundColor Yellow
        }
        Write-Host "==========================================" -ForegroundColor Cyan
    }

    "start" {
        Write-Host "Iniciando servidor AWS ($InstanceId)..." -ForegroundColor Yellow
        aws ec2 start-instances --instance-ids $InstanceId --region $Region --output table
        Write-Host "Esperando a que el servidor este en estado 'running'..." -ForegroundColor Yellow
        aws ec2 wait instance-running --instance-ids $InstanceId --region $Region

        $inst = Get-InstanceDetails
        $ip = $inst.PublicIpAddress
        $dns = $inst.PublicDnsName

        Write-Host "Servidor encendido con exito!" -ForegroundColor Green
        Write-Host "IP Publica   : $ip" -ForegroundColor Yellow
        Write-Host "URL Publica  : http://$dns" -ForegroundColor Green
        Write-Host "App (Port 3000): http://$ip:3000" -ForegroundColor Green
    }

    "stop" {
        Write-Host "Pausando servidor AWS ($InstanceId)..." -ForegroundColor Yellow
        aws ec2 stop-instances --instance-ids $InstanceId --region $Region --output table
        Write-Host "Esperando a que la instancia se detenga..." -ForegroundColor Yellow
        aws ec2 wait instance-stopped --instance-ids $InstanceId --region $Region
        Write-Host "Servidor PAUSADO correctamente." -ForegroundColor Green
        Write-Host "El cobro de computo se detuvo a `$0.00 USD." -ForegroundColor Green
    }

    "url" {
        $inst = Get-InstanceDetails
        if ($inst.State.Name -eq "running") {
            Write-Host "http://$($inst.PublicIpAddress):3000"
        } else {
            Write-Host "El servidor esta apagado. Ejecuta con -Action start" -ForegroundColor Red
        }
    }
}
