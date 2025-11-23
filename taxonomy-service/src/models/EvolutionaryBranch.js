const mongoose = require('mongoose');

const EvolutionaryBranchSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  speciesIds: [{ type: String }], // IDs from observation-service
  commonAncestor: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EvolutionaryBranch', EvolutionaryBranchSchema);
