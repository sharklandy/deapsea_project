# Script de seeding pour DeepSea Archives
# Ce script peuple les bases de données avec des données de test

Write-Host "🌊 DeepSea Archives - Seeding des bases de données" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que les conteneurs sont actifs
Write-Host "🔍 Vérification des conteneurs..." -ForegroundColor Yellow
docker-compose ps

Write-Host ""
Write-Host "⏳ Attente de 5 secondes pour s'assurer que MongoDB est prêt..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Seeding du auth-service
Write-Host ""
Write-Host "👥 Seeding des utilisateurs (auth-service)..." -ForegroundColor Green
docker-compose exec auth-service npm run seed

Write-Host ""
Write-Host "⏳ Attente de 3 secondes..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Seeding du observation-service
Write-Host ""
Write-Host "🐙 Seeding des espèces et observations (observation-service)..." -ForegroundColor Green
docker-compose exec observation-service npm run seed

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "✅ Seeding terminé avec succès!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Informations de connexion:" -ForegroundColor Cyan
Write-Host "   ADMIN  : admin@deepsea.com / admin123" -ForegroundColor White
Write-Host "   EXPERT : expert1@deepsea.com / expert123" -ForegroundColor White
Write-Host "   USER   : user1@deepsea.com / user123" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Services disponibles:" -ForegroundColor Cyan
Write-Host "   Auth Service        : http://localhost:4000" -ForegroundColor White
Write-Host "   Observation Service : http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "💡 Exemples de requêtes:" -ForegroundColor Cyan
Write-Host "   GET http://localhost:5000/species" -ForegroundColor White
Write-Host "   GET http://localhost:5000/species/:id/observations" -ForegroundColor White
Write-Host ""
