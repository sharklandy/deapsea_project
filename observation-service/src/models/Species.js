// modèle pour les espèces marines
const mongoose = require('mongoose');

const SpeciesSchema = new mongoose.Schema({
  // qui a créé l'espèce
  authorId: { 
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  
  // infos de l'espèce
  name: { 
    type: String, 
    required: true, 
    unique: true
  },
  
  description: { 
    type: String, 
    required: true,
    minlength: 10
  },
  
  // score de rareté basé sur les observations
  rarityScore: { 
    type: Number, 
    default: 1
  },
  
  createdAt: { 
    type: Date, 
    default: Date.now
  }
});

// mettre à jour le score de rareté
SpeciesSchema.methods.updateRarityScore = async function() {
  const Observation = require('./Observation');
  
  // compter les observations validées
  const validatedCount = await Observation.countDocuments({
    speciesId: this._id,
    status: 'VALIDATED'
  });
  
  // calculer le nouveau score
  this.rarityScore = 1 + (validatedCount / 5);
  await this.save();
  
  return this.rarityScore;
};

module.exports = mongoose.model('Species', SpeciesSchema);
