// ============================================
// ROUTES: ADMIN (Modération avancée)
// ============================================
// Routes réservées aux administrateurs pour:
// - Soft delete (suppression logique sans perte de données)
// - Restauration d'observations supprimées
// - Consultation de l'historique des actions d'un utilisateur

const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const isAdmin = require('../middlewares/isAdmin');
const Observation = require('../models/Observation');
const ActionHistory = require('../models/ActionHistory');
const axios = require('axios');

// URL du service d'authentification
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:4000';

// ============================================
// FONCTION HELPER: getUserInfo()
// ============================================
// Récupère les informations d'un utilisateur depuis auth-service
// Identique à celle dans observations.js (duplication acceptée pour isolation du module)
async function getUserInfo(userId, token) {
  try {
    const response = await axios.get(`${AUTH_SERVICE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (err) {
    return null;
  }
}

// ============================================
// FONCTION HELPER: logAction()
// ============================================
// Enregistre une action administrative dans ActionHistory
// Version générique acceptant targetType variable (OBSERVATION ou SPECIES)
async function logAction(userId, username, userRole, actionType, targetType, targetId, targetDetails) {
  try {
    await ActionHistory.create({
      userId,
      username,
      userRole,
      actionType,
      targetType,
      targetId,
      targetDetails
    });
  } catch (err) {
    console.error('Erreur log action:', err.message);
  }
}

// ============================================
// ROUTE DELETE: Soft delete d'une observation
// ============================================
// Réservé aux ADMIN uniquement (middleware isAdmin)
// Suppression logique: met deleted=true sans supprimer physiquement le document
router.delete('/observations/:id', auth, isAdmin, async (req, res) => {
  try {
    // 1. RÉCUPÉRATION DE L'OBSERVATION
    const obs = await Observation.findById(req.params.id);
    if (!obs) return res.status(404).json({ message: 'Observation introuvable' });
    
    // 2. VÉRIFICATION: Déjà supprimée ?
    if (obs.deleted) {
      return res.status(400).json({ message: 'Observation déjà supprimée' });
    }

    // 3. SOFT DELETE
    // Ne supprime PAS le document, mais le marque comme supprimé
    obs.deleted = true;
    obs.deletedAt = new Date();         // Horodatage de la suppression
    obs.deletedBy = req.user.id;        // ID de l'administrateur
    await obs.save();

    // 4. LOGGING DE L'ACTION
    const token = req.headers.authorization.split(' ')[1];
    const userInfo = await getUserInfo(req.user.id, token);
    await logAction(
      req.user.id,
      userInfo?.username || 'Unknown',
      req.user.role,
      'DELETE',                           // Type d'action
      'OBSERVATION',                      // Type de cible
      obs._id,
      obs.description.substring(0, 50)    // Extrait les 50 premiers caractères pour historique
    );

    // 5. RETOUR HTTP 200 OK
    res.json({ message: 'Observation supprimée', observation: obs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ============================================
// ROUTE POST: Restaurer une observation
// ============================================
// Réservé aux ADMIN uniquement
// Inverse le soft delete: remet deleted=false
router.post('/observations/:id/restore', auth, isAdmin, async (req, res) => {
  try {
    // 1. RÉCUPÉRATION DE L'OBSERVATION
    const obs = await Observation.findById(req.params.id);
    if (!obs) return res.status(404).json({ message: 'Observation introuvable' });
    
    // 2. VÉRIFICATION: Observation non supprimée ?
    if (!obs.deleted) {
      return res.status(400).json({ message: 'Observation non supprimée' });
    }

    // 3. RESTAURATION
    // Remet tous les champs de soft delete à leur valeur par défaut
    obs.deleted = false;
    obs.deletedAt = null;
    obs.deletedBy = null;
    await obs.save();

    // 4. LOGGING DE L'ACTION
    const token = req.headers.authorization.split(' ')[1];
    const userInfo = await getUserInfo(req.user.id, token);
    await logAction(
      req.user.id,
      userInfo?.username || 'Unknown',
      req.user.role,
      'RESTORE',                          // Type d'action
      'OBSERVATION',
      obs._id,
      obs.description.substring(0, 50)
    );

    // 5. RETOUR HTTP 200 OK
    res.json({ message: 'Observation restaurée', observation: obs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ============================================
// ROUTE GET: Historique des actions d'un utilisateur
// ============================================
// Réservé aux ADMIN uniquement
// Retourne toutes les actions de modération effectuées par un utilisateur
router.get('/user/:id/history', auth, isAdmin, async (req, res) => {
  try {
    // 1. RECHERCHE DES ACTIONS
    // Tri par date décroissante (plus récent en premier)
    const history = await ActionHistory.find({ userId: req.params.id })
      .sort({ createdAt: -1 });
    
    // 2. RETOUR HTTP 200 OK
    // Format: { userId, totalActions, actions: [...] }
    res.json({
      userId: req.params.id,
      totalActions: history.length,
      actions: history
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ============================================
// ROUTE GET: Historique global de toutes les actions
// ============================================
// Réservé aux ADMIN uniquement
// Retourne toutes les actions de modération du système
router.get('/history', auth, isAdmin, async (req, res) => {
  try {
    // Récupérer toutes les actions avec pagination optionnelle
    const limit = parseInt(req.query.limit) || 100;
    const skip = parseInt(req.query.skip) || 0;
    
    const history = await ActionHistory.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
    
    const totalActions = await ActionHistory.countDocuments();
    
    res.json({
      totalActions,
      limit,
      skip,
      actions: history
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
