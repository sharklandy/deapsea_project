const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Update user reputation (called by observation-service)
router.post('/:id/reputation', async (req, res) => {
  try {
    const { points } = req.body;
    if (points === undefined) return res.status(400).json({ message: 'Points requis' });
    
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    
    // Update reputation
    user.reputation += points;
    
    // Auto-promote to EXPERT if reputation >= 10 and currently USER
    if (user.reputation >= 10 && user.role === 'USER') {
      user.role = 'EXPERT';
    }
    
    // Auto-demote to USER if reputation < 10 and currently EXPERT
    if (user.reputation < 10 && user.role === 'EXPERT') {
      user.role = 'USER';
    }
    
    await user.save();
    res.json({ 
      userId: user._id, 
      reputation: user.reputation, 
      role: user.role,
      promoted: user.role === 'EXPERT' && user.reputation >= 10
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
