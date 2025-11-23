// ============================================
// IMPORTS ET CONFIGURATION
// ============================================
const bcrypt = require('bcryptjs');        // Librairie pour hasher les mots de passe de manière sécurisée
const jwt = require('jsonwebtoken');       // Librairie pour créer et vérifier les tokens JWT
const User = require('../models/User');    // Modèle Mongoose pour interagir avec la collection users

// Clé secrète pour signer les JWT (en production, utiliser une variable d'environnement sécurisée)
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
// Nombre de rounds de salage pour bcrypt (10 = compromis sécurité/performance)
const SALT_ROUNDS = 10;

// ============================================
// ROUTE: POST /auth/register
// RÔLE: Créer un nouveau compte utilisateur
// ============================================
exports.register = async (req, res) => {
  try {
    // 1. EXTRACTION DES DONNÉES du body de la requête
    const { email, username, password, role } = req.body;
    
    // 2. VALIDATION DES CHAMPS OBLIGATOIRES
    // Si un des champs essentiels manque, retourner une erreur 400
    if (!email || !username || !password) {
      return res.status(400).json({ message: 'Champs manquants' });
    }
    
    // 3. VALIDATION DU RÔLE
    // Liste des rôles autorisés dans le système
    const allowedRoles = ['USER', 'EXPERT', 'ADMIN'];
    // Si le rôle fourni est valide, l'utiliser, sinon par défaut = USER
    const userRole = role && allowedRoles.includes(role) ? role : 'USER';
    
    // 4. VÉRIFICATION DE L'UNICITÉ (email ou username)
    // Rechercher si un utilisateur existe déjà avec cet email OU ce username
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) {
      return res.status(409).json({ message: 'Utilisateur déjà existant' });
    }
    
    // 5. HASHAGE DU MOT DE PASSE
    // Utiliser bcrypt pour hasher le mot de passe avant de le stocker en base
    // SALT_ROUNDS = 10 (10 tours de salage, plus = plus sécurisé mais plus lent)
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    
    // 6. INITIALISATION DE LA RÉPUTATION
    // Les EXPERT commencent avec 10 points de réputation (seuil pour valider)
    // Les autres (USER, ADMIN) commencent à 0
    const initialReputation = userRole === 'EXPERT' ? 10 : 0;
    
    // 7. CRÉATION DE L'UTILISATEUR EN BASE
    // Sauvegarder le nouvel utilisateur avec mot de passe hashé
    const user = await User.create({ 
      email, 
      username, 
      password: hash,        // Mot de passe hashé (jamais en clair)
      role: userRole,        // Rôle validé
      reputation: initialReputation 
    });
    
    // 8. GÉNÉRATION DU TOKEN JWT
    // Créer un token contenant l'ID et le rôle de l'utilisateur
    // Ce token sera utilisé pour authentifier les requêtes suivantes
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET);
    
    // 9. RÉPONSE AVEC LE TOKEN ET LES INFOS UTILISATEUR
    // Retourner 201 (Created) avec le token et les données publiques de l'utilisateur
    res.status(201).json({ 
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        reputation: user.reputation
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ============================================
// ROUTE: POST /auth/login
// RÔLE: Authentifier un utilisateur existant
// ============================================
exports.login = async (req, res) => {
  try {
    // 1. EXTRACTION DES IDENTIFIANTS
    const { email, password } = req.body;
    
    // 2. VALIDATION DES CHAMPS OBLIGATOIRES
    if (!email || !password) {
      return res.status(400).json({ message: 'Champs manquants' });
    }
    
    // 3. RECHERCHE DE L'UTILISATEUR PAR EMAIL
    const user = await User.findOne({ email });
    if (!user) {
      // Si l'utilisateur n'existe pas, retourner une erreur générique pour la sécurité
      // (ne pas révéler si l'email existe ou non)
      return res.status(401).json({ message: 'Identifiants invalides' });
    }
    
    // 4. VÉRIFICATION DU MOT DE PASSE
    // Comparer le mot de passe en clair avec le hash stocké en base
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }
    
    // 5. GÉNÉRATION DU TOKEN JWT
    // Créer un nouveau token pour cette session
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET);
    
    // 6. RÉPONSE AVEC LE TOKEN
    // Retourner le token et les informations utilisateur (sans le mot de passe)
    res.json({ 
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        reputation: user.reputation
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ============================================
// ROUTE: GET /auth/me
// RÔLE: Récupérer les infos de l'utilisateur connecté
// PROTECTION: Middleware auth (vérifie le token JWT)
// ============================================
exports.me = async (req, res) => {
  try {
    // req.user.id est ajouté par le middleware auth après vérification du token
    // select('-password') exclut le champ password de la réponse
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
