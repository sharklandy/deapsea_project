// ============================================
// MODÈLE MONGOOSE: OBSERVATION (Observations marines)
// ============================================
// Observations d'espèces marines créées par les utilisateurs
// Système de validation par EXPERT/ADMIN + soft delete pour audit

const mongoose = require('mongoose');

const ObservationSchema = new mongoose.Schema({
  // ===== RÉFÉRENCES =====
  speciesId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Species',   // Référence au modèle Species pour peupler les données
    required: true    // Obligatoire: chaque observation doit être liée à une espèce
  },
  
  authorId: { 
    type: mongoose.Schema.Types.ObjectId,  // ID de l'utilisateur créateur
    required: true                          // Obligatoire pour tracer l'auteur
  },
  
  // ===== DONNÉES DE L'OBSERVATION =====
  description: { 
    type: String, 
    required: true    // Description obligatoire de l'observation
  },
  
  dangerLevel: { 
    type: Number, 
    min: 1,           // Niveau minimum de dangerosité
    max: 5            // Niveau maximum (1 = inoffensif, 5 = très dangereux)
  },
  
  // ===== SYSTÈME DE VALIDATION (3 états) =====
  status: { 
    type: String, 
    enum: ['PENDING','VALIDATED','REJECTED'],  // Seulement ces 3 valeurs possibles
    default: 'PENDING'                         // Par défaut: en attente de validation
    // PENDING: Nouvelle observation, pas encore vérifiée
    // VALIDATED: Approuvée par EXPERT/ADMIN (+3 réputation auteur)
    // REJECTED: Refusée par EXPERT/ADMIN (-1 réputation auteur)
  },
  
  validatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    default: null     // ID du validateur (EXPERT/ADMIN), null si PENDING
  },
  
  validatedAt: { 
    type: Date, 
    default: null     // Date de validation, null si PENDING
  },
  
  // ===== SOFT DELETE SYSTEM (Suppression logique) =====
  // Permet de "supprimer" sans perdre les données historiques
  deleted: { 
    type: Boolean, 
    default: false
    // false = visible dans l'application
    // true = masquée mais présente en base de données
  },
  
  deletedAt: { 
    type: Date, 
    default: null     // Date de suppression, null si non supprimée
  },
  
  deletedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    default: null     // ID de l'administrateur qui a supprimé, null si non supprimée
  },
  
  // ===== MÉTADONNÉES =====
  createdAt: { 
    type: Date, 
    default: Date.now  // Date de création de l'observation
  }
});

// Export du modèle
module.exports = mongoose.model('Observation', ObservationSchema);
