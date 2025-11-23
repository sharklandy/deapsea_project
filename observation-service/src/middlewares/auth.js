// middleware pour vérifier le token jwt
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

module.exports = function(req, res, next) {
  const h = req.headers.authorization;
  if (!h) return res.status(401).json({ message: 'En-tête Authorization manquant' });
  const parts = h.split(' ');
  if (parts.length !== 2) return res.status(401).json({ message: 'En-tête Authorization invalide' });
  const token = parts[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide' });
  }
};
