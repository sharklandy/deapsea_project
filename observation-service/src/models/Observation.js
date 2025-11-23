// modèle pour les observations marines
const mongoose = require('mongoose');

const ObservationSchema = new mongoose.Schema({
  // références vers espèce et auteur
  speciesId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Species',
    required: true
  },
  
  authorId: { 
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  
  // détails de l'observation
  description: { 
    type: String, 
    required: true
  },
  
  dangerLevel: { 
    type: Number, 
    min: 1,
    max: 5
  },
  
  // statut de validation
  status: { 
    type: String, 
    enum: ['PENDING','VALIDATED','REJECTED'],
    default: 'PENDING'
  },
  
  validatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    default: null
  },
  
  validatedAt: { 
    type: Date, 
    default: null
  },
  
  // système de soft delete
  deleted: { 
    type: Boolean, 
    default: false
  },
  
  deletedAt: { 
    type: Date, 
    default: null
  },
  
  deletedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    default: null
  },
  
  createdAt: { 
    type: Date, 
    default: Date.now
  }
});

module.exports = mongoose.model('Observation', ObservationSchema);
