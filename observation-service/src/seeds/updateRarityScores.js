const mongoose = require('mongoose');
const Species = require('../models/Species');
const Observation = require('../models/Observation');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/observation-db';

async function updateAllRarityScores() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connexion MongoDB établie');

    const allSpecies = await Species.find();
    console.log(`\n📊 Mise à jour de ${allSpecies.length} espèces...`);

    for (const species of allSpecies) {
      await species.updateRarityScore();
      console.log(`✅ ${species.name}: rarityScore = ${species.rarityScore.toFixed(2)}`);
    }

    console.log('\n🎉 Tous les rarityScores ont été mis à jour!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

updateAllRarityScores();
