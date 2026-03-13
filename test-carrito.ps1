# Script de prueba rápida del sistema de carritos
# Ejecuta este script desde PowerShell para verificar el setup

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Sistema de Carrito Abandonado - Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar archivos críticos
Write-Host "1. Verificando archivos creados..." -ForegroundColor Yellow

$files = @(
    "utils\cartService.ts",
    "components\ShoppingCart.tsx",
    "supabase\migration_shopping_cart.sql",
    "supabase\seed_shopping_cart_test.sql",
    "README_CARRITO.md"
)

$allExist = $true
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file (FALTA)" -ForegroundColor Red
        $allExist = $false
    }
}

Write-Host ""

# Verificar node_modules
Write-Host "2. Verificando dependencias..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "  ✓ node_modules instalado" -ForegroundColor Green
} else {
    Write-Host "  ✗ node_modules NO encontrado" -ForegroundColor Red
    Write-Host "  → Ejecuta: npm install" -ForegroundColor Yellow
    $allExist = $false
}

Write-Host ""

# Verificar package.json
Write-Host "3. Verificando configuración..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    $pkg = Get-Content "package.json" | ConvertFrom-Json
    Write-Host "  ✓ Proyecto: $($pkg.name)" -ForegroundColor Green
    Write-Host "  ✓ Dependencias clave:" -ForegroundColor Green
    
    if ($pkg.dependencies.'@supabase/supabase-js') {
        Write-Host "    - Supabase JS: $($pkg.dependencies.'@supabase/supabase-js')" -ForegroundColor Cyan
    }
    if ($pkg.dependencies.'lucide-react') {
        Write-Host "    - Lucide Icons: $($pkg.dependencies.'lucide-react')" -ForegroundColor Cyan
    }
    if ($pkg.dependencies.'react-router-dom') {
        Write-Host "    - React Router: $($pkg.dependencies.'react-router-dom')" -ForegroundColor Cyan
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Instrucciones de Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($allExist) {
    Write-Host "✅ Todos los archivos están listos!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Pasos siguientes:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Configura Supabase:" -ForegroundColor White
    Write-Host "   - Abre: https://supabase.com/dashboard" -ForegroundColor Gray
    Write-Host "   - SQL Editor → Ejecuta 'migration_shopping_cart.sql'" -ForegroundColor Gray
    Write-Host "   - SQL Editor → Ejecuta 'seed_shopping_cart_test.sql'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Inicia el servidor:" -ForegroundColor White
    Write-Host "   npm run dev" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "3. Abre en el navegador:" -ForegroundColor White
    Write-Host "   http://localhost:3000" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "4. Inicia sesión con usuario de prueba:" -ForegroundColor White
    Write-Host "   Email: apacheco@nikoncenter.cl" -ForegroundColor Cyan
    Write-Host "   Pass:  123456" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "5. Navega a /cart para ver el carrito" -ForegroundColor White
    Write-Host ""
    Write-Host "📖 Documentación completa: README_CARRITO.md" -ForegroundColor Yellow
    
} else {
    Write-Host "❌ Faltan algunos archivos." -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor verifica que todos los archivos se hayan creado correctamente." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Usuarios de Prueba Disponibles" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$testUsers = @(
    @{Email="apacheco@nikoncenter.cl"; Scenario="Recién creado (2h)"; Value="$5,081,800"},
    @{Email="eduardofuentesbaltrons@gmail.com"; Scenario="Abandonado 1 día"; Value="$1,209,700"},
    @{Email="andrescomastri@mac.com"; Scenario="Abandonado 3 días"; Value="$549,990"},
    @{Email="gabriel.taito@udenio.com"; Scenario="Crítico 7 días"; Value="$2,140,500"}
)

foreach ($user in $testUsers) {
    Write-Host "📧 $($user.Email)" -ForegroundColor Cyan
    Write-Host "   Escenario: $($user.Scenario)" -ForegroundColor Gray
    Write-Host "   Valor: $($user.Value)" -ForegroundColor Green
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Opción para iniciar el servidor
Write-Host "¿Deseas iniciar el servidor ahora? (S/N): " -ForegroundColor Yellow -NoNewline
$response = Read-Host

if ($response -eq "S" -or $response -eq "s") {
    Write-Host ""
    Write-Host "Iniciando servidor de desarrollo..." -ForegroundColor Green
    Write-Host ""
    npm run dev
} else {
    Write-Host ""
    Write-Host "Para iniciar manualmente, ejecuta: npm run dev" -ForegroundColor Cyan
    Write-Host ""
}
