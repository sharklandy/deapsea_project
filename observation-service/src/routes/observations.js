// ============================================
// ROUTES: OBSERVATIONS (CRUD + Validation)
// ============================================
// Gestion des observations d'espèces marines avec:
// - Création avec règle anti-spam (5 minutes)
// - Validation/Rejet par EXPERT/ADMIN
// - Mise à jour de la réputation automatique
// - Logging des actions dans ActionHistory

const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Observation = require('../models/Observation');
const Species = require('../models/Species');
const ActionHistory = require('../models/ActionHistory');
const axios = require('axios');

// URL du service d'authentification (communication inter-services)
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:4000';

// ============================================
// FONCTION HELPER: updateReputation()
// ============================================
// Communique avec le auth-service pour modifier la réputation d'un utilisateur
async function updateReputation(userId, points) {
  try {
    // Appel HTTP POST vers auth-service
    // Endpoint: POST /users/:userId/reputation
    // Body: { points: +3 | -1 | +1 }
    await axios.post(`${AUTH_SERVICE_URL}/users/${userId}/reputation`, { points });
  } catch (err) {
    // Log en cas d'échec mais n'interrompt pas le flux principal
    console.error('Failed to update reputation:', err.message);
  }
}

// ============================================
// FONCTION HELPER: getUserInfo()
// ============================================
// Récupère les informations d'un utilisateur depuis auth-service
// Utilisé pour obtenir le username lors du logging des actions
async function getUserInfo(userId, token) {
  try {
    // Appel HTTP GET vers auth-service avec token JWT
    const response = await axios.get(`${AUTH_SERVICE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;  // Retourne { id, username, role, reputation }
  } catch (err) {
    return null;  // Retourne null si échec (network error, token invalide)
  }
}

// ============================================
// FONCTION HELPER: logAction()
// ============================================
// Enregistre une action de modération dans ActionHistory
// Permet de tracer toutes les validations/rejets/suppressions/restaurations
async function logAction(userId, username, userRole, actionType, targetId, targetDetails) {
  try {
    // Crée un document ActionHistory avec toutes les métadonnées
    await ActionHistory.create({
      userId,           // ID du modérateur
      username,         // Nom du modérateur (dénormalisé)
      userRole,         // Rôle au moment de l'action (EXPERT/ADMIN)
      actionType,       // Type: VALIDATE, REJECT, DELETE, RESTORE
      targetType: 'OBSERVATION',  // Fixe à OBSERVATION pour ce service
      targetId,         // ID de l'observation ciblée
      targetDetails     // Détails de l'observation pour affichage
    });
  } catch (err) {
    // Log en cas d'échec mais n'interrompt pas le flux principal
    console.error('Erreur log action:', err.message);
  }
}

// ============================================
// ROUTE POST: Créer une observation
// ============================================
// Accessible à tous les utilisateurs authentifiés (USER, EXPERT, ADMIN)
// Règle anti-spam: Maximum 1 observation par espèce toutes les 5 minutes
router.post('/', auth, async (req, res) => {
  try {
    // 1. EXTRACTION ET VALIDATION DES DONNÉES
    const { speciesId, description, dangerLevel } = req.body;
    
    // Validation: description obligatoire
    if (!description) return res.status(400).json({ message: 'Description requise' });
    
    // Validation: dangerLevel entre 1 et 5 (si fourni)
    if (dangerLevel !== undefined && (dangerLevel < 1 || dangerLevel > 5)) {
      return res.status(400).json({ message: 'Le niveau de danger doit être entre 1 et 5' });
    }
    
    // 2. VÉRIFICATION DE L'EXISTENCE DE L'ESPÈCE
    const species = await Species.findById(speciesId);
    if (!species) return res.status(404).json({ message: 'Espèce introuvable' });

    // 3. RÈGLE ANTI-SPAM (5 minutes)
    // Vérifie si l'utilisateur a déjà soumis une observation pour cette espèce dans les 5 dernières minutes
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);  // Timestamp il y a 5 min
    const recent = await Observation.findOne({
      speciesId,                    // Même espèce
      authorId: req.user.id,        // Même auteur
      createdAt: { $gte: fiveMinAgo }  // Créée il y a moins de 5 minutes
    });
    
    if (recent) {
      // HTTP 429: Too Many Requests
      return res.status(429).json({ 
        message: 'Vous avez déjà soumis une observation pour cette espèce il y a moins de 5 minutes' 
      });
    }

    // 4. CRÉATION DE L'OBSERVATION
    // Status par défaut: PENDING (en attente de validation)
    const obs = await Observation.create({ 
      speciesId, 
      authorId: req.user.id,  // ID récupéré du JWT par le middleware auth
      description, 
      dangerLevel 
    });
    
    // 5. RETOUR HTTP 201 CREATED
    res.status(201).json(obs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ============================================
// ROUTE GET: Lister les observations d'une espèce
// ============================================
// Accessible sans authentification (données publiques)
router.get('/species/:id', async (req, res) => {
  // Recherche toutes les observations liées à l'espèce spécifiée
  const list = await Observation.find({ speciesId: req.params.id });
  res.json(list);
});

// ============================================
// ROUTE POST: Valider une observation
// ============================================
// Réservé aux rôles EXPERT et ADMIN
// Effet: Change status à VALIDATED, +3 réputation auteur, +1 réputation validateur
router.post('/:id/validate', auth, async (req, res) => {
  try {
    // 1. VÉRIFICATION DU RÔLE
    // Seuls EXPERT et ADMIN peuvent valider
    if (!['EXPERT','ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Rôle non autorisé' });
    }
    
    // 2. RÉCUPÉRATION DE L'OBSERVATION
    const obs = await Observation.findById(req.params.id);
    if (!obs) return res.status(404).json({ message: 'Observation introuvable' });
    
    // 3. INTERDICTION DE VALIDER SA PROPRE OBSERVATION
    // Évite les abus de réputation
    if (obs.authorId.toString() === req.user.id) {
      return res.status(403).json({ message: 'Vous ne pouvez pas valider votre propre observation' });
    }
    
    // 4. VÉRIFICATION DU STATUT
    // Une observation ne peut être validée qu'une seule fois
    if (obs.status !== 'PENDING') {
      return res.status(400).json({ message: 'Décision déjà prise' });
    }

    // 5. MISE À JOUR DU STATUT
    obs.status = 'VALIDATED';
    obs.validatedBy = req.user.id;   // ID du validateur
    obs.validatedAt = new Date();    // Timestamp de validation
    await obs.save();

    // 6. MISE À JOUR DU SCORE DE RARETÉ
    // Appelle la méthode updateRarityScore() du modèle Species
    // Recalcule: rarityScore = 1 + (validatedCount / 5)
    const species = await Species.findById(obs.speciesId);
    if (species) {
      await species.updateRarityScore();
    }

    // 7. MISE À JOUR DE LA RÉPUTATION
    // Auteur: +3 points (observation validée)
    await updateReputation(obs.authorId.toString(), 3);
    // Validateur: +1 point (contribution à la modération)
    await updateReputation(req.user.id, 1);

    // 8. LOGGING DE L'ACTION
    // Extraction du token JWT pour appeler getUserInfo()
    const userInfo = await getUserInfo(req.user.id, req.headers.authorization?.split(' ')[1]);
    await logAction(
      req.user.id,
      userInfo?.username || 'Inconnu',  // Fallback si getUserInfo échoue
      req.user.role,
      'VALIDATE',
      obs._id,
      { speciesId: obs.speciesId, location: obs.location }  // Détails pour historique
    );

    // 9. RETOUR HTTP 200 OK
    res.json(obs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ============================================
// ROUTE POST: Rejeter une observation
// ============================================
// Réservé aux rôles EXPERT et ADMIN
// Effet: Change status à REJECTED, -1 réputation auteur, +1 réputation validateur
router.post('/:id/reject', auth, async (req, res) => {
  try {
    // 1. VÉRIFICATION DU RÔLE
    if (!['EXPERT','ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Rôle non autorisé' });
    }
    
    // 2. RÉCUPÉRATION DE L'OBSERVATION
    const obs = await Observation.findById(req.params.id);
    if (!obs) return res.status(404).json({ message: 'Observation introuvable' });
    
    // 3. VÉRIFICATION DU STATUT
    if (obs.status !== 'PENDING') {
      return res.status(400).json({ message: 'Décision déjà prise' });
    }

    // 4. MISE À JOUR DU STATUT
    obs.status = 'REJECTED';
    obs.validatedBy = req.user.id;
    obs.validatedAt = new Date();
    await obs.save();

    // 5. MISE À JOUR DE LA RÉPUTATION
    // Auteur: -1 point (observation rejetée)
    // Note: Le validateur gagne quand même +1 point (pas implémenté ici, à ajouter si souhaité)
    await updateReputation(obs.authorId.toString(), -1);

    // 6. LOGGING DE L'ACTION
    const userInfo = await getUserInfo(req.user.id, req.headers.authorization?.split(' ')[1]);
    await logAction(
      req.user.id,
      userInfo?.username || 'Inconnu',
      req.user.role,
      'REJECT',
      obs._id,
      { speciesId: obs.speciesId, location: obs.location }
    );

    // 7. RETOUR HTTP 200 OK
    res.json(obs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
