// ============================================
// MODÈLE MONGOOSE: USER
// ============================================
// Définit la structure des documents dans la collection "users"
// Gère le système d'authentification et de réputation

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // ===== IDENTIFICATION =====
  email: { 
    type: String,        // Type de donnée
    required: true,      // Champ obligatoire
    unique: true,        // Pas de doublon (index MongoDB créé automatiquement)
    lowercase: true      // Conversion automatique en minuscules avant sauvegarde
  },
  
  username: { 
    type: String, 
    required: true, 
    unique: true         // Chaque username doit être unique
  },
  
  // ===== SÉCURITÉ =====
  password: { 
    type: String, 
    required: true       // Stocké en hash (bcrypt) jamais en clair
  },
  
  // ===== SYSTÈME DE RÔLES =====
  role: { 
    type: String, 
    enum: ['USER', 'EXPERT', 'ADMIN'],  // Valeurs autorisées uniquement
    default: 'USER'                      // Rôle par défaut si non spécifié
    // USER: peut créer observations
    // EXPERT: peut valider/rejeter (≥10 points de réputation)
    // ADMIN: accès complet (soft delete, restore, historiques)
  },
  
  // ===== SYSTÈME DE RÉPUTATION (Gamification) =====
  reputation: { 
    type: Number, 
    default: 0
    // Points gagnés/perdus par:
    // +3: observation validée (auteur)
    // -1: observation rejetée (auteur)
    // +1: validation effectuée (expert/admin)
    // 
    // AUTO-PROMOTION:
    // - Si réputation ≥ 10 et role = USER → devient EXPERT
    // - Si réputation < 10 et role = EXPERT → redevient USER
  },
  
  // ===== MÉTADONNÉES =====
  createdAt: { 
    type: Date, 
    default: Date.now    // Timestamp de création automatique
  }
});

// Export du modèle pour l'utiliser dans les controllers
// MongoDB créera automatiquement la collection "users" (pluriel + minuscules)
module.exports = mongoose.model('User', UserSchema);
