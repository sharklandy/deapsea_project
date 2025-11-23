const mongoose = require('mongoose');

const SubSpeciesSchema = new mongoose.Schema({
  speciesId: { type: String, required: true }, // ID from observation-service
  name: { type: String, required: true },
  characteristics: { type: String },
  familyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Family' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SubSpecies', SubSpeciesSchema);
