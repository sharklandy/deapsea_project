# DeepSea API - Système de Gestion d'Observations Marines

Application en plusiseurs microservices pour recenser + valider des observations d'espèces marines fictives.

On est revenue sur la version précédente avant d'essayer d'integrer du service layer

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

## Comment exécuter le projet
### Prérequis
- Docker Desktop installé et en cours d'exécution
- Git (optionnel, pour cloner le projet)

### Étape 1: Cloner le projet ou telecharger le zip
Envoyer vers github desktop ou alors :
```bash
git clone https://github.com/sharklandy/deapsea_project.git
```
### Étape 2:Lancer les services
```bash
# a faire dans chaque micro-services
npm install 
npm run dev
```

### Étape 3: Lancer l'app
```bash
# build + start services
docker-compose up --build

# ou mode detach (bg )
docker-compose up -d --build
```

### Étape 4: Vérif que tout fonctionne
```bash
# verif etat conteneurs
docker-compose ps

# il devrait y avoir 4 conteneurs mongo + les 3 services
```

### Étape 4: Tester l'API
Les services sont accessibles sur:
- Auth Service: http://localhost:4000
- Observation Service: http://localhost:5000
- Taxonomy Service: http://localhost:6000
- MongoDB: localhost:27018

### Arrêter l'Application
```bash
# stop les conteneurs
docker-compose down

# stop + supprimer les volumes (reset la bdd)
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

### 3. Créer une espèce
```bash
POST http://localhost:5000/species
Authorization: Bearer <votre_token_jwt>
Content-Type: application/json

{
  "name": "Calamar Géant",
  "description": "Espèce fascinante des profondeurs océaniques"
}
```

### 4. Créer une observation
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

### 5. Valider une observation (EXPERT)
```bash
POST http://localhost:5000/observations/<id>/validate
Authorization: Bearer <token_expert_ou_admin>
```

### 6. Statistiques globales
```bash
GET http://localhost:6000/taxonomy/stats
```

## Collection Postman

importez le fichier `DeepSea_API.postman_collection.json` dans Postman pour tester tous les endpoints facilement.

## Système de rôles

### USER (rép initiale: 0)
- créer des espèces et observations
- ne peut pas valider/rejeter

### EXPERT (rép initiale: 10)
- idem que précedent
- Valider/Rejeter des observations
- info: auto-promotion — USER devient EXPERT à 10 pts

### ADMIN
- idem que précedent (peut-etre pas valider les observation a tester)
- Soft delete et restauration
- Consulter l'historique des actions

## Système de réputation

- +3 points Observation validée (pour l'auteur)
- -1 point: Observation rejetée (pour l'auteur)
- +1 point: Validation/Rejet effectué (pour le validateur)
- Auto-promotion: USER à EXPERT si ≥10 points
- Auto-rétrogradation: EXPERT à USER si <10 points

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
- id et nom de user
- type d'action (VALIDATE, REJECT, DELETE, RESTORE)
- horodatage
- détails de la cible