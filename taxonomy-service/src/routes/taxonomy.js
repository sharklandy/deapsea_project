// ============================================
// ROUTES: TAXONOMY (Statistiques et Classification)
// ============================================
// Service de taxonomie centralisé qui:
// - Agrège les données des autres services
// - Calcule des statistiques globales
// - Extrait des mots-clés des descriptions
// - Fournit une hiérarchie de classification (Familles, Sous-espèces, Branches évolutives)

const express = require('express');
const router = express.Router();
const axios = require('axios');
const Family = require('../models/Family');
const SubSpecies = require('../models/SubSpecies');
const EvolutionaryBranch = require('../models/EvolutionaryBranch');

// URL du service d'observations (communication inter-services)
const OBSERVATION_SERVICE_URL = process.env.OBSERVATION_SERVICE_URL || 'http://observation-service:5000';

// ============================================
// ROUTE GET: Statistiques et classification globales
// ============================================
// Endpoint principal du taxonomy-service
// Agrège les données de observation-service et calcule des statistiques avancées
router.get('/stats', async (req, res) => {
  try {
    // ===== ÉTAPE 1: RÉCUPÉRATION DES ESPÈCES =====
    // Appel HTTP GET vers observation-service pour obtenir toutes les espèces
    const speciesResponse = await axios.get(`${OBSERVATION_SERVICE_URL}/species`);
    const species = speciesResponse.data;

    // ===== ÉTAPE 2: ANALYSE PAR ESPÈCE =====
    // Pour chaque espèce, on récupère ses observations et on calcule:
    // - Nombre total d'observations
    // - Nombre d'observations validées
    // - Extraction de mots-clés
    const statsPromises = species.map(async (sp) => {
      try {
        // 2.1 RÉCUPÉRATION DES OBSERVATIONS de cette espèce
        const obsResponse = await axios.get(`${OBSERVATION_SERVICE_URL}/species/${sp._id}/observations`);
        const observations = obsResponse.data;
        
        // 2.2 COMPTAGE DES OBSERVATIONS VALIDÉES
        // Filtre uniquement celles avec status === 'VALIDATED'
        const validatedCount = observations.filter(o => o.status === 'VALIDATED').length;
        
        // 2.3 EXTRACTION DES MOTS-CLÉS
        // Algorithme simple basé sur regex:
        // - Concatène toutes les descriptions
        // - Passe en minuscules
        // - Extrait les mots de 5+ lettres (avec accents français)
        const keywords = observations
          .map(o => o.description)
          .join(' ')
          .toLowerCase()
          .match(/\b[a-zàâäéèêëïîôùûüÿç]{5,}\b/g) || [];  // Regex: mots ≥5 lettres
        
        // 2.4 COMPTAGE DE LA FRÉQUENCE DES MOTS-CLÉS
        // Crée un objet { mot: fréquence }
        const keywordFreq = {};
        keywords.forEach(k => {
          keywordFreq[k] = (keywordFreq[k] || 0) + 1;
        });
        
        // 2.5 SÉLECTION DES TOP 3 MOTS-CLÉS
        // Tri par fréquence décroissante, puis prend les 3 premiers
        const topKeywords = Object.entries(keywordFreq)
          .sort((a, b) => b[1] - a[1])  // Tri décroissant par fréquence
          .slice(0, 3)                   // Prend les 3 premiers
          .map(([word]) => word);        // Extrait seulement le mot (pas la fréquence)

        // 2.6 RETOUR DES STATISTIQUES POUR CETTE ESPÈCE
        return {
          speciesId: sp._id,
          speciesName: sp.name,
          totalObservations: observations.length,
          validatedObservations: validatedCount,
          rarityScore: sp.rarityScore,  // Score provenant de Species.updateRarityScore()
          topKeywords
        };
      } catch (err) {
        // En cas d'erreur pour une espèce, retourne des valeurs par défaut
        console.error(`Erreur pour espèce ${sp._id}:`, err.message);
        return {
          speciesId: sp._id,
          speciesName: sp.name,
          totalObservations: 0,
          validatedObservations: 0,
          rarityScore: sp.rarityScore,
          topKeywords: []
        };
      }
    });

    // Attente de toutes les promesses en parallèle
    const speciesStats = await Promise.all(statsPromises);

    // ===== ÉTAPE 3: CALCUL DES STATISTIQUES GLOBALES =====
    const totalSpecies = species.length;
    const totalObservations = speciesStats.reduce((sum, s) => sum + s.totalObservations, 0);
    // Moyenne d'observations par espèce (arrondie à 2 décimales)
    const avgObservationsPerSpecies = totalSpecies > 0 ? (totalObservations / totalSpecies).toFixed(2) : 0;

    // ===== ÉTAPE 4: RÉCUPÉRATION DE LA CLASSIFICATION HIÉRARCHIQUE =====
    // Récupère les données de taxonomie depuis MongoDB (taxonomy-service)
    const families = await Family.find();
    const subSpecies = await SubSpecies.find().populate('familyId');  // Peuple la référence familyId
    const evolutionaryBranches = await EvolutionaryBranch.find();

    // ===== ÉTAPE 5: CONSTRUCTION DE LA RÉPONSE JSON =====
    res.json({
      // STATISTIQUES GLOBALES
      globalStats: {
        totalSpecies,
        totalObservations,
        avgObservationsPerSpecies: parseFloat(avgObservationsPerSpecies)
      },
      
      // STATISTIQUES PAR ESPÈCE (triées par nombre d'observations décroissant)
      speciesStats: speciesStats.sort((a, b) => b.totalObservations - a.totalObservations),
      
      // CLASSIFICATION HIÉRARCHIQUE
      classification: {
        // FAMILLES: Groupes principaux d'espèces
        families: families.map(f => ({
          id: f._id,
          name: f.name,
          description: f.description,
          // Compte le nombre de sous-espèces liées à cette famille
          subSpeciesCount: subSpecies.filter(s => 
            s.familyId && s.familyId._id.toString() === f._id.toString()
          ).length
        })),
        
        // SOUS-ESPÈCES: Variantes d'une espèce principale
        subSpecies: subSpecies.map(s => ({
          id: s._id,
          name: s.name,
          speciesId: s.speciesId,
          familyName: s.familyId ? s.familyId.name : null  // Nom de la famille parente
        })),
        
        // BRANCHES ÉVOLUTIVES: Groupements phylogénétiques
        evolutionaryBranches: evolutionaryBranches.map(b => ({
          id: b._id,
          name: b.name,
          description: b.description,
          speciesCount: b.speciesIds.length  // Nombre d'espèces dans cette branche
        }))
      }
    });
  } catch (err) {
    console.error('Erreur /taxonomy/stats:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

module.exports = router;
