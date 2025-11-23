require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const usersRoutes = require('./routes/users');
const reputationRoutes = require('./routes/reputation');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/users', usersRoutes);
app.use('/users', reputationRoutes);

const PORT = process.env.PORT || 4000;
const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/deepsea_auth';

mongoose.connect(MONGO).then(() => {
  console.log('Auth-service connected to MongoDB');
  app.listen(PORT, () => console.log('Auth-service running on port', PORT));
}).catch(err => {
  console.error('Auth-service Mongo connection error:', err);
});
