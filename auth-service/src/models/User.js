// modèle pour les utilisateurs
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // identité de l'utilisateur
  email: { 
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  
  username: { 
    type: String, 
    required: true, 
    unique: true
  },
  
  // mot de passe hashé
  password: { 
    type: String, 
    required: true
  },
  
  // rôles: user, expert, admin
  role: { 
    type: String, 
    enum: ['USER', 'EXPERT', 'ADMIN'],
    default: 'USER'
  },
  
  // système de points de réputation
  reputation: { 
    type: Number, 
    default: 0
  },
  
  createdAt: { 
    type: Date, 
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);
