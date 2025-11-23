// modèle pour l'historique des actions de modération
const mongoose = require('mongoose');

const ActionHistorySchema = new mongoose.Schema({
  // qui a fait l'action
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true
  },
  
  username: { 
    type: String, 
    required: true
  },
  
  userRole: { 
    type: String, 
    required: true
  },
  
  // type d'action effectuée
  actionType: { 
    type: String, 
    enum: ['VALIDATE', 'REJECT', 'DELETE', 'RESTORE'], 
    required: true
  },
  
  // cible de l'action
  targetType: { 
    type: String, 
    enum: ['OBSERVATION', 'SPECIES'], 
    required: true
  },
  
  targetId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true
  },
  
  targetDetails: { 
    type: String
  },
  
  createdAt: { 
    type: Date, 
    default: Date.now
  }
});

module.exports = mongoose.model('ActionHistory', ActionHistorySchema);
