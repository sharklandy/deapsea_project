// ============================================
// MIDDLEWARE D'AUTHENTIFICATION JWT
// ============================================
// Ce middleware est utilisé sur TOUTES les routes protégées
// Il vérifie que le token JWT est valide avant de laisser passer la requête
// Utilisé dans les 3 microservices (auth, observation, taxonomy)

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

module.exports = function(req, res, next) {
  // 1. RÉCUPÉRATION DU HEADER AUTHORIZATION
  // Format attendu: "Bearer <token>"
  const h = req.headers.authorization;
  
  if (!h) {
    return res.status(401).json({ message: 'En-tête Authorization manquant' });
  }
  
  // 2. EXTRACTION DU TOKEN
  // Séparer "Bearer" et le token réel
  const parts = h.split(' ');
  
  // Vérifier que le format est correct (exactement 2 parties)
  if (parts.length !== 2) {
    return res.status(401).json({ message: 'En-tête Authorization invalide' });
  }
  
  // Le token est la deuxième partie (après "Bearer ")
  const token = parts[1];
  
  try {
    // 3. VÉRIFICATION ET DÉCODAGE DU TOKEN
    // jwt.verify() vérifie:
    // - Que le token n'a pas été modifié (signature valide)
    // - Que le token n'a pas expiré (si expiration configurée)
    // - Que le token a été signé avec notre JWT_SECRET
    const payload = jwt.verify(token, JWT_SECRET);
    
    // 4. INJECTION DES DONNÉES UTILISATEUR DANS LA REQUÊTE
    // Ajouter l'ID et le rôle de l'utilisateur dans req.user
    // Ces données seront accessibles dans toutes les routes protégées
    req.user = { 
      id: payload.id,     // ID MongoDB de l'utilisateur
      role: payload.role  // Rôle (USER, EXPERT, ADMIN)
    };
    
    // 5. PASSAGE À LA ROUTE SUIVANTE
    // Si le token est valide, continuer vers la route demandée
    next();
    
  } catch (err) {
    // 6. GESTION DES ERREURS DE TOKEN
    // jwt.verify() peut lever plusieurs erreurs:
    // - TokenExpiredError: le token a expiré
    // - JsonWebTokenError: le token est malformé ou invalide
    // - NotBeforeError: le token n'est pas encore valide
    return res.status(401).json({ message: 'Token invalide' });
  }
};
