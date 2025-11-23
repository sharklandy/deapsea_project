const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const isAdmin = require('../middlewares/isAdmin');
const User = require('../models/User');

// Lister tous les utilisateurs
router.get('/users', auth, isAdmin, async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

// Modifier le rôle d'un utilisateur
router.patch('/users/:id/role', auth, isAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    
    // Vérifier que le rôle est valide
    if (!['USER', 'EXPERT', 'ADMIN'].includes(role)) {
      return res.status(400).json({ message: 'Rôle invalide. Valeurs autorisées: USER, EXPERT, ADMIN' });
    }

    // Trouver et mettre à jour l'utilisateur
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    user.role = role;
    await user.save();

    res.json({ 
      message: 'Rôle modifié avec succès', 
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
