const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Species = require('../models/Species');

// Create species (unique name enforced)
router.post('/', auth, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Nom requis' });
    if (!description) return res.status(400).json({ message: 'Description requise' });
    if (description.length < 10) return res.status(400).json({ message: 'La description doit contenir au moins 10 caractères' });
    const exists = await Species.findOne({ name });
    if (exists) return res.status(409).json({ message: 'Ce nom d\'espèce existe déjà' });
    const s = await Species.create({ authorId: req.user.id, name, description });
    res.status(201).json(s);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.get('/', async (req, res) => {
  const { sortBy } = req.query;
  let list;
  
  if (sortBy === 'rarity') {
    // Sort by rarity score descending (rarest first)
    list = await Species.find().sort({ rarityScore: -1 });
  } else {
    list = await Species.find();
  }
  
  res.json(list);
});

router.get('/:id', async (req, res) => {
  const s = await Species.findById(req.params.id);
  if (!s) return res.status(404).json({ message: 'Espèce introuvable' });
  res.json(s);
});

// Get observations for a species
router.get('/:id/observations', async (req, res) => {
  const Observation = require('../models/Observation');
  const list = await Observation.find({ speciesId: req.params.id });
  res.json(list);
});

module.exports = router;
