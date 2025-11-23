# DeepSea API - Système de Gestion d'Observations Marines

Application en plusiseurs microservices pour recenser + valider des observations d'espèces marines fictives.

## Architecture du projet

### vue d'ensemble
```
deepsea project

  -auth service (port 4000)
    -authentification jwt
    -gestion des utilisateurs (user, expert, admin)
    -système de réputation
      -auto-promotion basée sur la réputation

  -observation service (port 5000)
    -gestion des espèces marines
    -crud des observations
    -validation/rejet par expert
    -système de rareté dynamique
    -soft delete avec restauration
      -historique des actions (audit trail)

  -taxonomy service (port 6000)
    -statistiques globales
    -extraction de mots-clés
    -classification hiérarchique
      -agrégation inter-services

  -mongodb (port 27018)
      -auth-db
      -observation-db
      -taxonomy-db
```

### Technologies Utilisées
- Backend: Node.js + Express.js
- Base de données: MongoDB + Mongoose
- Authentification: JWT
- Containerisation: Docker + Docker Compose

### Structure des Dossiers
```
deepsea_project/
  -auth-service/
    -src/
       -controllers/    # logique auth
       -middlewares/    # jwt, isadmin
       -models/         # schema user + rep
         -routes/         # endpoints auth + users
    -Dockerfile
    -package.json
      -.env

  -observation-service/
    -src/
       -middlewares/    # auth jwt
       -models/         # species, observation, actionhistory
         -routes/         # observations, admin, species
    -Dockerfile
    -package.json
      -.env

  -taxonomy-service/
    -src/
       -models/         # family, subspecies, evolutionarybranch
         -routes/         # taxonomy stats
    -Dockerfile
      -package.json

  -docker-compose.yml       # orchestration services
  -DeepSea_API.postman_collection.json
```

## Comment Exécuter le Projet

### Prérequis
- **Docker Desktop** installé et en cours d'exécution
- **Git** (optionnel, pour cloner le projet)

### Étape 1: Cloner le Projet ou telecharger le zip
```bash
git clone https://github.com/sharklandy/deapsea_project.git
```

### Étape 2: Lancer l'Application
```bash
# build & start services
docker-compose up --build

# ou mode detach (bg)
docker-compose up -d --build
```

### Étape 3: Vérifier que Tout Fonctionne
```bash
# verif etat conteneurs
docker-compose ps

# tu devrais voir 4 conteneurs en cours:
# - deepsea_project-mongo-1
# - deepsea_project-auth-service-1
# - deepsea_project-observation-service-1
# - deepsea_project-taxonomy-service-1
```

### Étape 4: Tester l'API
Les services sont accessibles sur:
- **Auth Service**: http://localhost:4000
- **Observation Service**: http://localhost:5000
- **Taxonomy Service**: http://localhost:6000
- **MongoDB**: localhost:27018

### Arrêter l'Application
```bash
# Arrêter les conteneurs
docker-compose down

# Arrêter ET supprimer les volumes (réinitialise la base de données)
docker-compose down -v
```

## Utilisation de l'API

### 1. Inscription
```bash
POST http://localhost:4000/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "role": "USER"  # USER, EXPERT, ou ADMIN
}
```

### 2. Connexion
```bash
POST http://localhost:4000/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

# renvoie token jwt à utiliser dans les requêtes suivantes
```

### 3. Créer une Espèce
```bash
POST http://localhost:5000/species
Authorization: Bearer <votre_token_jwt>
Content-Type: application/json

{
  "name": "Calamar Géant",
  "description": "Espèce fascinante des profondeurs océaniques"
}
```

### 4. Créer une Observation
```bash
POST http://localhost:5000/observations
Authorization: Bearer <votre_token_jwt>
Content-Type: application/json

{
  "speciesId": "<id_espece>",
  "description": "Observation dans les eaux profondes",
  "dangerLevel": 3
}
```

### 5. Valider une Observation (EXPERT/ADMIN)
```bash
POST http://localhost:5000/observations/<id>/validate
Authorization: Bearer <token_expert_ou_admin>
```

### 6. Statistiques Globales
```bash
GET http://localhost:6000/taxonomy/stats
```

## Collection Postman

importez le fichier `DeepSea_API.postman_collection.json` dans Postman pour tester tous les endpoints facilement.

## Système de Rôles

### USER (Réputation initiale: 0)
- Créer des espèces et observations
- ne peut pas valider/rejeter

### EXPERT (Réputation initiale: 10)
- Tout ce que USER peut faire
- Valider/Rejeter des observations
- info: auto-promotion — USER devient EXPERT à 10 pts

### ADMIN
- Tout ce que EXPERT peut faire
- Soft delete et restauration
- Consulter l'historique des actions

## Système de Réputation

- **+3 points**: Observation validée (pour l'auteur)
- **-1 point**: Observation rejetée (pour l'auteur)
- **+1 point**: Validation/Rejet effectué (pour le validateur)
- **Auto-promotion**: USER → EXPERT à ≥10 points
- **Auto-rétrogradation**: EXPERT → USER si <10 points

## Fonctionnalités Avancées

### Score de Rareté
Chaque espèce possède un score de rareté calculé dynamiquement:
```
rarityScore = 1 + (observations_validées / 5)
```

### Règle Anti-Spam
Un utilisateur ne peut créer qu'une observation par espèce toutes les 5 minutes.

### Soft Delete
Les observations supprimées restent en base de données mais sont marquées comme `deleted=true`, permettant une restauration ultérieure.

### Audit Trail
Toutes les actions de modération sont enregistrées dans `ActionHistory` avec:
- ID et nom de l'utilisateur
- Type d'action (VALIDATE, REJECT, DELETE, RESTORE)
- Horodatage
- Détails de la cible

## Dépannage

### Les conteneurs ne démarrent pas
```bash
# verif logs
docker-compose logs

# reconstruc complet
docker-compose down -v
docker-compose up --build
```

### Erreur de connexion MongoDB
```bash
# verif port 27018 libre
netstat -ano | findstr :27018

# restart mongo seul
docker-compose restart mongo
```

### Token JWT invalide
- verif token present dans le header `authorization: bearer <token>`
- token expire, reconnecte-toi

## 📄 Variables d'Environnement

### auth-service/.env
```env
MONGO_URI=mongodb://mongo:27017/auth-db
JWT_SECRET=dev_secret
PORT=4000
```

### observation-service/.env
```env
MONGO_URI=mongodb://mongo:27017/observation-db
AUTH_SERVICE_URL=http://auth-service:4000
JWT_SECRET=dev_secret
PORT=5000
```

### taxonomy-service (dans docker-compose.yml)
```env
MONGO_URI=mongodb://mongo:27017/taxonomy-db
OBSERVATION_SERVICE_URL=http://observation-service:5000
JWT_SECRET=dev_secret
```

## Développement

### Ajouter une dépendance
```bash
# dans un service
cd auth-service
npm install <package>

# rebuild conteneur
docker-compose up --build auth-service
```

### Voir les logs en temps réel
```bash
docker-compose logs -f auth-service
docker-compose logs -f observation-service
docker-compose logs -f taxonomy-service
```