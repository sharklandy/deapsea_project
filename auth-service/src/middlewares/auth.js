// middleware pour vérifier le token jwt
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

module.exports = function(req, res, next) {
  const h = req.headers.authorization;
  
  if (!h) {
    return res.status(401).json({ message: 'En-tête Authorization manquant' });
  }
  
  // extraire le token du header
  const parts = h.split(' ');
  
  if (parts.length !== 2) {
    return res.status(401).json({ message: 'En-tête Authorization invalide' });
  }
  
  const token = parts[1];
  
  try {
    // vérifier et décoder le token
    const payload = jwt.verify(token, JWT_SECRET);
    
    // ajouter les infos user dans la requête
    req.user = { 
      id: payload.id,
      role: payload.role
    };
    
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
