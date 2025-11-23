const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const isExpertOrAdmin = require('../middlewares/isExpertOrAdmin');
const ActionHistory = require('../models/ActionHistory');

// GET /expert/species/:id/history - Get species action history (EXPERT/ADMIN)
router.get('/species/:id/history', auth, isExpertOrAdmin, async (req, res) => {
  try {
    const history = await ActionHistory.find({ 
      targetType: 'OBSERVATION',
      targetId: req.params.id
    }).sort({ createdAt: -1 });

    // Also get all actions related to observations of this species
    const Observation = require('../models/Observation');
    const observations = await Observation.find({ speciesId: req.params.id });
    const observationIds = observations.map(o => o._id);

    const obsHistory = await ActionHistory.find({
      targetType: 'OBSERVATION',
      targetId: { $in: observationIds }
    }).sort({ createdAt: -1 });

    res.json({
      speciesId: req.params.id,
      totalActions: obsHistory.length,
      actions: obsHistory
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
