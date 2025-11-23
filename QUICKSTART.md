# 🌊 DeepSea Archives - Guide de Démarrage Rapide

## ✅ Étapes Complétées

1. ✅ **Services opérationnels**
   - Auth Service (port 4000)
   - Observation Service (port 5000)
   - MongoDB (port 27018)

2. ✅ **Base de données peuplée**
   - 6 utilisateurs (1 admin, 2 experts, 3 users)
   - 12 espèces abyssales imaginaires
   - 18 observations (validées et en attente)

---

## 🚀 Commandes Rapides

### Démarrer les services
```powershell
docker-compose up -d
```

### Arrêter les services
```powershell
docker-compose down
```

### Recréer les données
```powershell
docker-compose exec auth-service npm run seed
docker-compose exec observation-service npm run seed
```

### Voir les logs
```powershell
docker-compose logs -f
docker-compose logs -f auth-service
docker-compose logs -f observation-service
```

---

## 🧪 Tester l'API

### Méthode 1 : Postman (Recommandé)

1. Ouvrir Postman
2. Importer le fichier `DeepSea_Archives.postman_collection.json`
3. Exécuter "Login USER" ou "Login EXPERT" (le token sera sauvegardé automatiquement)
4. Tester les autres requêtes

### Méthode 2 : cURL

#### 1. Se connecter
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:4000/auth/login" -Method Post -Body (@{email="user1@deepsea.com"; password="user123"} | ConvertTo-Json) -ContentType "application/json"
$token = $response.token
```

#### 2. Lister les espèces
```powershell
$headers = @{Authorization="Bearer $token"}
Invoke-RestMethod -Uri "http://localhost:5000/species" -Headers $headers
```

#### 3. Voir les observations d'une espèce
```powershell
# Remplacer SPECIES_ID par un ID réel
Invoke-RestMethod -Uri "http://localhost:5000/species/SPECIES_ID/observations" -Headers $headers
```

---

## 📊 Données de Test Disponibles

### Comptes Utilisateurs

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| 👤 USER | user1@deepsea.com | user123 |
| 🔬 EXPERT | expert1@deepsea.com | expert123 |
| 👑 ADMIN | admin@deepsea.com | admin123 |

### Espèces Créées (exemples)

1. **Luminexus Abyssalis** - Créature bioluminescente (Danger: 1-2)
2. **Cthulhidae Profundus** - Prédateur tentaculaire massif (Danger: 5)
3. **Vampyrus Marinus** - Vampire des profondeurs (Danger: 4)
4. **Abyssodon Megalodon** - Mégalodon des abysses (Danger: 5)

Voir le fichier `DATABASE.md` pour la liste complète.

---

## 🎯 Scénarios de Test

### Scénario 1 : Utilisateur observe une espèce

1. Se connecter en tant que USER (`user1@deepsea.com`)
2. `GET /species` - Choisir une espèce
3. `POST /observations` - Créer une observation
   ```json
   {
     "speciesId": "ID_DE_L_ESPECE",
     "description": "Spécimen observé à 4000m de profondeur",
     "dangerLevel": 3
   }
   ```
4. Status sera `PENDING`

### Scénario 2 : Expert valide une observation

1. Se connecter en tant que EXPERT (`expert1@deepsea.com`)
2. `GET /species/:id/observations` - Voir les observations PENDING
3. `POST /observations/:id/validate` - Valider l'observation

### Scénario 3 : Admin gère les utilisateurs

1. Se connecter en tant que ADMIN (`admin@deepsea.com`)
2. `GET /admin/users` - Voir tous les utilisateurs
3. `PATCH /users/:id/role` - Promouvoir un user en expert
   ```json
   {
     "role": "EXPERT"
   }
   ```

---

## 📝 Routes Disponibles

### Auth Service (http://localhost:4000)

| Méthode | Route | Rôle | Description |
|---------|-------|------|-------------|
| POST | /auth/register | - | Créer un compte |
| POST | /auth/login | - | Se connecter |
| GET | /auth/me | 🔒 | Profil utilisateur |
| GET | /admin/users | 👑 ADMIN | Liste des users |
| PATCH | /users/:id/role | 👑 ADMIN | Changer le rôle |

### Observation Service (http://localhost:5000)

| Méthode | Route | Rôle | Description |
|---------|-------|------|-------------|
| GET | /species | 🔒 | Liste espèces |
| GET | /species/:id | 🔒 | Détails espèce |
| POST | /species | 🔒 | Créer espèce |
| GET | /species/:id/observations | 🔒 | Observations |
| POST | /observations | 🔒 | Créer observation |
| POST | /observations/:id/validate | 🔬 EXPERT | Valider |
| POST | /observations/:id/reject | 🔬 EXPERT | Rejeter |

🔒 = Authentification requise (USER, EXPERT ou ADMIN)  
🔬 = EXPERT ou ADMIN requis  
👑 = ADMIN uniquement

---

## 🔧 Dépannage

### Les services ne démarrent pas
```powershell
docker-compose down -v
docker-compose up --build
```

### Données manquantes
```powershell
docker-compose exec auth-service npm run seed
docker-compose exec observation-service npm run seed
```

### Voir les erreurs
```powershell
docker-compose logs --tail=50 auth-service
docker-compose logs --tail=50 observation-service
```

---

## 📚 Documentation Complète

- `DATABASE.md` - Structure et contenu de la base de données
- `README.md` - Documentation générale du projet
- `DeepSea_Archives.postman_collection.json` - Collection Postman

---

## 🎉 Prochaines Étapes

1. ✅ Tester les routes avec Postman
2. ✅ Créer de nouvelles espèces
3. ✅ Soumettre des observations
4. ✅ Valider/rejeter des observations (en tant qu'expert)
5. ✅ Gérer les utilisateurs (en tant qu'admin)

**Bon développement ! 🚀🌊🐙**
