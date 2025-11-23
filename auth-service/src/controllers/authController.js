// imports pour l'authentification
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const SALT_ROUNDS = 10;

// créer un nouveau compte utilisateur
exports.register = async (req, res) => {
  try {
    const { email, username, password, role } = req.body;
    
    if (!email || !username || !password) {
      return res.status(400).json({ message: 'Champs manquants' });
    }
    
    // validation du rôle
    const allowedRoles = ['USER', 'EXPERT', 'ADMIN'];
    const userRole = role && allowedRoles.includes(role) ? role : 'USER';
    
    // vérifier si l'utilisateur existe déjà
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) {
      return res.status(409).json({ message: 'Utilisateur déjà existant' });
    }
    
    // hasher le mot de passe
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    
    // les experts commencent avec 10 points de réputation
    const initialReputation = userRole === 'EXPERT' ? 10 : 0;
    
    // créer l'utilisateur en base
    const user = await User.create({ 
      email, 
      username, 
      password: hash,
      role: userRole,
      reputation: initialReputation 
    });
    
    // générer le token jwt
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET);
    
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

// connecter un utilisateur existant
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Champs manquants' });
    }
    
    // trouver l'utilisateur
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }
    
    // vérifier le mot de passe
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }
    
    // générer le token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET);
    
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

// récupérer les infos de l'utilisateur connecté
exports.me = async (req, res) => {
  try {
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
