// ============================================
// MODÈLE MONGOOSE: SPECIES (Espèces marines)
// ============================================
// Catalogue des espèces observables dans les profondeurs océaniques
// Système de rareté basé sur le nombre d'observations validées

const mongoose = require('mongoose');

const SpeciesSchema = new mongoose.Schema({
  // ===== CRÉATION =====
  authorId: { 
    type: mongoose.Schema.Types.ObjectId,  // Référence à l'ID d'un utilisateur
    required: true                          // Obligatoire pour tracer qui a créé l'espèce
  },
  
  // ===== INFORMATIONS DE L'ESPÈCE =====
  name: { 
    type: String, 
    required: true, 
    unique: true       // Chaque espèce doit avoir un nom unique
  },
  
  description: { 
    type: String, 
    required: true,
    minlength: 10      // Minimum 10 caractères pour éviter les descriptions trop courtes
  },
  
  // ===== SYSTÈME DE RARETÉ (Gamification) =====
  rarityScore: { 
    type: Number, 
    default: 1
    // Score calculé dynamiquement selon la formule:
    // rarityScore = 1 + (nombre_observations_validées / 5)
    // 
    // Exemples:
    // - 0 observations validées → score = 1.0 (rare)
    // - 5 observations validées → score = 2.0 (peu commune)
    // - 10 observations validées → score = 3.0 (commune)
    // - 25 observations validées → score = 6.0 (très commune)
  },
  
  // ===== MÉTADONNÉES =====
  createdAt: { 
    type: Date, 
    default: Date.now  // Date de création de l'espèce dans le système
  }
});

// ============================================
// MÉTHODE PERSONNALISÉE: updateRarityScore()
// ============================================
// Calcule et met à jour le score de rareté en fonction des observations validées
// Cette méthode est appelée après chaque validation d'observation
SpeciesSchema.methods.updateRarityScore = async function() {
  // 1. IMPORT DYNAMIQUE pour éviter les dépendances circulaires
  const Observation = require('./Observation');
  
  // 2. COMPTAGE DES OBSERVATIONS VALIDÉES
  // Compte uniquement les observations avec status = 'VALIDATED'
  const validatedCount = await Observation.countDocuments({
    speciesId: this._id,      // Observations de cette espèce uniquement
    status: 'VALIDATED'       // Uniquement celles validées par un EXPERT/ADMIN
  });
  
  // 3. CALCUL DU SCORE DE RARETÉ
  // Formule: rarityScore = 1 + (validatedCount / 5)
  // Division par 5 pour graduer la progression
  this.rarityScore = 1 + (validatedCount / 5);
  
  // 4. SAUVEGARDE EN BASE
  await this.save();
  
  // 5. RETOUR DU NOUVEAU SCORE
  return this.rarityScore;
};

// Export du modèle
module.exports = mongoose.model('Species', SpeciesSchema);
