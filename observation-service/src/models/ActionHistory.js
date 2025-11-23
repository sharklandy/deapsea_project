// ============================================
// MODÈLE MONGOOSE: ACTION HISTORY (Historique des actions de modération)
// ============================================
// Système d'audit trail pour tracer toutes les actions de modération
// Permet de garder un historique complet des validations, rejets, suppressions et restaurations

const mongoose = require('mongoose');

const ActionHistorySchema = new mongoose.Schema({
  // ===== IDENTIFICATION DE L'ACTEUR =====
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true
    // ID de l'utilisateur qui a effectué l'action (EXPERT ou ADMIN)
  },
  
  username: { 
    type: String, 
    required: true
    // Nom d'utilisateur dénormalisé pour éviter une jointure à chaque requête
    // Facilite l'affichage des historiques
  },
  
  userRole: { 
    type: String, 
    required: true
    // Rôle au moment de l'action: 'EXPERT' ou 'ADMIN'
    // Important pour audit: savoir quel niveau de permission avait l'acteur
  },
  
  // ===== TYPE D'ACTION (4 possibilités) =====
  actionType: { 
    type: String, 
    enum: ['VALIDATE', 'REJECT', 'DELETE', 'RESTORE'], 
    required: true
    // VALIDATE: EXPERT/ADMIN approuve une observation (+3 réputation auteur, +1 validateur)
    // REJECT: EXPERT/ADMIN refuse une observation (-1 réputation auteur, +1 validateur)
    // DELETE: ADMIN effectue une soft delete (deleted=true)
    // RESTORE: ADMIN restaure une observation supprimée (deleted=false)
  },
  
  // ===== CIBLE DE L'ACTION =====
  targetType: { 
    type: String, 
    enum: ['OBSERVATION', 'SPECIES'], 
    required: true
    // Type de l'entité ciblée par l'action
    // OBSERVATION: Action sur une observation spécifique
    // SPECIES: Action sur une espèce (pour extension future du système)
  },
  
  targetId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true
    // ID de l'observation ou de l'espèce ciblée
  },
  
  targetDetails: { 
    type: String
    // Détails humains lisibles de la cible (ex: description de l'observation)
    // Permet d'afficher un résumé sans avoir à ré-interroger la collection Observation
  },
  
  // ===== MÉTADONNÉES =====
  createdAt: { 
    type: Date, 
    default: Date.now
    // Timestamp de l'action pour historique chronologique
  }
});

// Export du modèle
module.exports = mongoose.model('ActionHistory', ActionHistorySchema);
