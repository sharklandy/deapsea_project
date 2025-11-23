# 🌊 DeepSea Archives - Base de Données

## 📊 Contenu de la Base de Données

### Utilisateurs (Auth Service)

La base de données contient **6 utilisateurs** répartis en 3 rôles :

| Email | Username | Mot de passe | Rôle | Réputation |
|-------|----------|--------------|------|------------|
| admin@deepsea.com | DeepSeaAdmin | admin123 | ADMIN | 1000 |
| expert1@deepsea.com | DrAbyssExplorer | expert123 | EXPERT | 500 |
| expert2@deepsea.com | MarineBiologist | expert123 | EXPERT | 450 |
| user1@deepsea.com | OceanWatcher | user123 | USER | 50 |
| user2@deepsea.com | DeepDiver | user123 | USER | 75 |
| user3@deepsea.com | AbyssSeeker | user123 | USER | 30 |

### Espèces (Observation Service)

La base contient **12 espèces abyssales imaginaires** :

1. **Luminexus Abyssalis** - Créature bioluminescente aux tentacules translucides
2. **Cthulhidae Profundus** - Prédateur tentaculaire massif extrêmement dangereux
3. **Crystallis Serpentis** - Serpent des abysses au corps semi-transparent
4. **Vampyrus Marinus** - Créature vampire des profondeurs
5. **Phantasma Gelatinosa** - Méduse fantôme translucide
6. **Titanicus Chelonia** - Tortue abyssale géante ancestrale
7. **Electrophis Voltaicus** - Anguille électrique des abysses
8. **Nebulosus Octopodis** - Pieuvre des brumes bioluminescente
9. **Abyssodon Megalodon** - Descendant évolutif du mégalodon
10. **Symbioticus Luminaris** - Organisme colonial symbiotique
11. **Spinosus Draconus** - Dragon des profondeurs avec épines venimeuses
12. **Glacialis Crustaceus** - Crustacé des zones froides abyssales

### Observations

Environ **20 observations** réparties entre :
- ✅ **Observations VALIDÉES** (par les experts)
- ⏳ **Observations PENDING** (en attente de validation)

Les niveaux de danger varient de **1 (inoffensif)** à **5 (extrêmement dangereux)**.

---

## 🚀 Lancer le Seeding

### Méthode 1 : Script PowerShell automatique (Recommandé)

```powershell
.\seed.ps1
```

Ce script va :
1. Vérifier que les conteneurs Docker sont actifs
2. Peupler la base de données des utilisateurs
3. Peupler la base de données des espèces et observations

### Méthode 2 : Manuelle

#### Étape 1 : Vérifier que les services sont actifs

```powershell
docker-compose ps
```

#### Étape 2 : Seed des utilisateurs

```powershell
docker-compose exec auth-service npm run seed
```

#### Étape 3 : Seed des observations

```powershell
docker-compose exec observation-service npm run seed
```

---

## 🧪 Tester les Données

### 1. Se connecter en tant qu'utilisateur

**POST** `http://localhost:4000/auth/login`

```json
{
  "email": "user1@deepsea.com",
  "password": "user123"
}
```

Vous recevrez un **JWT token** à utiliser pour les requêtes suivantes.

### 2. Lister toutes les espèces

**GET** `http://localhost:5000/species`

Headers:
```
Authorization: Bearer <votre_token>
```

### 3. Voir les observations d'une espèce

**GET** `http://localhost:5000/species/:speciesId/observations`

Headers:
```
Authorization: Bearer <votre_token>
```

### 4. Valider une observation (EXPERT uniquement)

**POST** `http://localhost:5000/observations/:observationId/validate`

Headers:
```
Authorization: Bearer <token_expert>
```

---

## 🔄 Réinitialiser les Données

Si vous souhaitez réinitialiser complètement les données :

```powershell
# Arrêter les conteneurs
docker-compose down

# Supprimer les volumes (données MongoDB)
docker-compose down -v

# Redémarrer
docker-compose up -d

# Attendre quelques secondes puis lancer le seeding
.\seed.ps1
```

---

## 📝 Structure des Données

### Species
```javascript
{
  _id: ObjectId,
  name: String,
  authorId: ObjectId,
  createdAt: Date
}
```

### Observation
```javascript
{
  _id: ObjectId,
  speciesId: ObjectId,
  authorId: ObjectId,
  description: String,
  dangerLevel: Number (1-5),
  status: "PENDING" | "VALIDATED" | "REJECTED",
  validatedBy: ObjectId | null,
  validatedAt: Date | null,
  createdAt: Date
}
```

### User
```javascript
{
  _id: ObjectId,
  email: String,
  username: String,
  password: String (hashed),
  role: "USER" | "EXPERT" | "ADMIN",
  reputation: Number,
  createdAt: Date
}
```

---

## 💡 Cas d'Usage

### Scénario 1 : Utilisateur observe une nouvelle espèce
1. Connexion avec credentials USER
2. POST /observations avec description et dangerLevel
3. Observation créée avec status = PENDING

### Scénario 2 : Expert valide une observation
1. Connexion avec credentials EXPERT
2. GET /observations pour voir les observations PENDING
3. POST /observations/:id/validate pour valider

### Scénario 3 : Admin gère les utilisateurs
1. Connexion avec credentials ADMIN
2. GET /admin/users pour voir tous les utilisateurs
3. PATCH /users/:id/role pour changer un rôle

---

## 🐛 Dépannage

### Les espèces n'apparaissent pas
```powershell
# Vérifier les logs
docker-compose logs observation-service

# Re-seeder
docker-compose exec observation-service npm run seed
```

### Erreur de connexion MongoDB
```powershell
# Vérifier que MongoDB est actif
docker-compose ps mongo

# Redémarrer si nécessaire
docker-compose restart mongo
```

---

## 📊 Statistiques

- 🦑 **12 espèces** fictives créées
- 👥 **6 utilisateurs** (1 admin, 2 experts, 3 users)
- 📝 **~20 observations** (validées et en attente)
- ⚠️ **Niveaux de danger** : de 1 à 5
- ✅ **Taux de validation** : ~60%

---

Bon développement ! 🚀🌊
