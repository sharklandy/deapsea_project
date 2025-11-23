const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const isAdmin = require('../middlewares/isAdmin');
const User = require('../models/User');

router.patch('/:id/role', auth, isAdmin, async (req, res) => {
  const { role } = req.body;
  if (!['USER','EXPERT','ADMIN'].includes(role)) return res.status(400).json({ message: 'Rôle invalide' });
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
  if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
  res.json(user);
});

module.exports = router;
