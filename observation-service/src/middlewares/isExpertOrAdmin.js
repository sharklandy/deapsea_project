// middleware pour vérifier que l'utilisateur est expert ou admin
module.exports = function(req, res, next) {
  if (!req.user) return res.status(401).json({ message: 'Non autorisé' });
  if (!['EXPERT', 'ADMIN'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Réservé aux experts et administrateurs' });
  }
  next();
};
