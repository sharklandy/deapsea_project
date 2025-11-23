const mongoose = require('mongoose');
const Species = require('../models/Species');
const Observation = require('../models/Observation');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/observation-db';

// IDs fictifs pour les auteurs (à remplacer par de vrais IDs après la création des users)
const ADMIN_ID = new mongoose.Types.ObjectId();
const EXPERT1_ID = new mongoose.Types.ObjectId();
const EXPERT2_ID = new mongoose.Types.ObjectId();
const USER1_ID = new mongoose.Types.ObjectId();
const USER2_ID = new mongoose.Types.ObjectId();
const USER3_ID = new mongoose.Types.ObjectId();

const speciesData = [
  {
    name: 'Luminexus Abyssalis',
    authorId: EXPERT1_ID,
    description: 'Créature bioluminescente aux tentacules translucides émettant une lumière bleutée hypnotique',
    observations: [
      {
        authorId: USER1_ID,
        description: 'Observé à 3000m de profondeur, émettant des pulsations lumineuses régulières',
        dangerLevel: 2,
        status: 'VALIDATED',
        validatedBy: EXPERT1_ID
      },
      {
        authorId: USER2_ID,
        description: 'Groupe de 5 spécimens entourant un submersible, comportement non agressif',
        dangerLevel: 1,
        status: 'VALIDATED',
        validatedBy: EXPERT2_ID
      }
    ]
  },
  {
    name: 'Cthulhidae Profundus',
    authorId: EXPERT2_ID,
    description: 'Prédateur tentaculaire massif aux yeux multiples, considéré comme extrêmement dangereux',
    observations: [
      {
        authorId: USER3_ID,
        description: 'Attaque d\'un submersible robotisé à 5000m, tentacules mesurant plus de 15 mètres',
        dangerLevel: 5,
        status: 'VALIDATED',
        validatedBy: EXPERT1_ID
      },
      {
        authorId: USER1_ID,
        description: 'Traces d\'attaque sur équipement sous-marin, ventouses de 30cm de diamètre',
        dangerLevel: 5,
        status: 'PENDING'
      }
    ]
  },
  {
    name: 'Crystallis Serpentis',
    authorId: USER1_ID,
    description: 'Serpent des abysses au corps semi-transparent avec des cristaux bioluminescents',
    observations: [
      {
        authorId: USER2_ID,
        description: 'Spécimen de 8 mètres observé près des sources hydrothermales',
        dangerLevel: 3,
        status: 'VALIDATED',
        validatedBy: EXPERT2_ID
      }
    ]
  },
  {
    name: 'Vampyrus Marinus',
    authorId: EXPERT1_ID,
    description: 'Créature vampire des profondeurs se nourrissant par siphon sanguin',
    observations: [
      {
        authorId: USER3_ID,
        description: 'Attaque sur banc de poissons des profondeurs, technique de chasse coordonnée',
        dangerLevel: 4,
        status: 'VALIDATED',
        validatedBy: EXPERT1_ID
      },
      {
        authorId: USER2_ID,
        description: 'Spécimen isolé, comportement d\'embuscade, camouflage parfait',
        dangerLevel: 4,
        status: 'PENDING'
      }
    ]
  },
  {
    name: 'Phantasma Gelatinosa',
    authorId: USER2_ID,
    description: 'Méduse fantôme des grands fonds, corps translucide avec organes visibles',
    observations: [
      {
        authorId: USER1_ID,
        description: 'Colonie de 20 spécimens dérivant à 2500m, déplacement synchronisé',
        dangerLevel: 1,
        status: 'VALIDATED',
        validatedBy: EXPERT2_ID
      },
      {
        authorId: USER3_ID,
        description: 'Contact avec filaments urticants, paralysie temporaire observée',
        dangerLevel: 2,
        status: 'VALIDATED',
        validatedBy: EXPERT1_ID
      }
    ]
  },
  {
    name: 'Titanicus Chelonia',
    authorId: EXPERT2_ID,
    description: 'Tortue abyssale géante à carapace minéralisée, espèce ancestrale rare',
    observations: [
      {
        authorId: USER2_ID,
        description: 'Spécimen massif de 4 mètres, carapace couverte d\'organismes symbiotiques',
        dangerLevel: 2,
        status: 'VALIDATED',
        validatedBy: EXPERT2_ID
      }
    ]
  },
  {
    name: 'Electrophis Voltaicus',
    authorId: USER3_ID,
    description: 'Anguille électrique des abysses capable de décharges de 1000 volts',
    observations: [
      {
        authorId: USER1_ID,
        description: 'Décharge électrique détectée par capteurs, paralysie d\'équipement électronique',
        dangerLevel: 4,
        status: 'PENDING'
      },
      {
        authorId: USER2_ID,
        description: 'Chasse en groupe observée, coordination des décharges électriques',
        dangerLevel: 5,
        status: 'PENDING'
      }
    ]
  },
  {
    name: 'Nebulosus Octopodis',
    authorId: EXPERT1_ID,
    description: 'Pieuvre des brumes capable de produire un nuage d\'encre bioluminescente',
    observations: [
      {
        authorId: USER3_ID,
        description: 'Mécanisme de défense observé: nuage lumineux aveuglant les prédateurs',
        dangerLevel: 2,
        status: 'VALIDATED',
        validatedBy: EXPERT1_ID
      }
    ]
  },
  {
    name: 'Abyssodon Megalodon',
    authorId: EXPERT2_ID,
    description: 'Descendant évolutif du mégalodon adapté aux grandes profondeurs',
    observations: [
      {
        authorId: USER1_ID,
        description: 'Mâchoire de 2 mètres retrouvée, dents de 20cm, marques récentes',
        dangerLevel: 5,
        status: 'VALIDATED',
        validatedBy: EXPERT2_ID
      },
      {
        authorId: USER3_ID,
        description: 'Silhouette massive détectée par sonar à 6000m, taille estimée à 20 mètres',
        dangerLevel: 5,
        status: 'PENDING'
      }
    ]
  },
  {
    name: 'Symbioticus Luminaris',
    authorId: USER1_ID,
    description: 'Organisme colonial symbiotique émettant une lumière coordonnée',
    observations: [
      {
        authorId: USER2_ID,
        description: 'Colonie formant des motifs lumineux complexes, communication possible',
        dangerLevel: 1,
        status: 'VALIDATED',
        validatedBy: EXPERT1_ID
      }
    ]
  },
  {
    name: 'Spinosus Draconus',
    authorId: EXPERT1_ID,
    description: 'Dragon des profondeurs avec épines venimeuses et nageoires membraneuses',
    observations: [
      {
        authorId: USER3_ID,
        description: 'Venin paralysant identifié, effet durant plusieurs heures',
        dangerLevel: 4,
        status: 'PENDING'
      }
    ]
  },
  {
    name: 'Glacialis Crustaceus',
    authorId: USER2_ID,
    description: 'Crustacé des zones froides abyssales, exosquelette cristallin',
    observations: [
      {
        authorId: USER1_ID,
        description: 'Adaptation au froid extrême observée, métabolisme ralenti',
        dangerLevel: 1,
        status: 'VALIDATED',
        validatedBy: EXPERT2_ID
      }
    ]
  }
];

async function seedObservations() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connexion MongoDB établie');

    // Supprimer les données existantes
    await Species.deleteMany({});
    await Observation.deleteMany({});
    console.log('🗑️  Données existantes supprimées');

    let totalSpecies = 0;
    let totalObservations = 0;

    // Créer les espèces et leurs observations
    for (const speciesInfo of speciesData) {
      // Créer l'espèce
      const species = new Species({
        name: speciesInfo.name,
        authorId: speciesInfo.authorId
      });
      await species.save();
      totalSpecies++;
      console.log(`✅ Espèce créée: ${species.name}`);

      // Créer les observations pour cette espèce
      for (const obsData of speciesInfo.observations) {
        const observation = new Observation({
          speciesId: species._id,
          authorId: obsData.authorId,
          description: obsData.description,
          dangerLevel: obsData.dangerLevel,
          status: obsData.status,
          validatedBy: obsData.validatedBy || null,
          validatedAt: obsData.status === 'VALIDATED' ? new Date() : null
        });
        await observation.save();
        totalObservations++;
        console.log(`   📝 Observation créée: ${obsData.status} - Danger: ${obsData.dangerLevel}/5`);
      }
    }

    console.log('\n🎉 Seeding terminé avec succès!');
    console.log(`📊 Statistiques:`);
    console.log(`   - ${totalSpecies} espèces créées`);
    console.log(`   - ${totalObservations} observations créées`);
    console.log(`\n💡 Conseil: Utilisez GET /species pour voir toutes les espèces`);
    console.log(`💡 Conseil: Utilisez GET /species/:id/observations pour voir les observations d'une espèce`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    process.exit(1);
  }
}

seedObservations();
