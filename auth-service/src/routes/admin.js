const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const isAdmin = require('../middlewares/isAdmin');
const User = require('../models/User');

router.get('/users', auth, isAdmin, async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

module.exports = router;
