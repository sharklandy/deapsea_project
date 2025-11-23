require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const speciesRoutes = require('./routes/species');
const observationRoutes = require('./routes/observations');
const adminRoutes = require('./routes/admin');
const expertRoutes = require('./routes/expert');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/species', speciesRoutes);
app.use('/observations', observationRoutes);
app.use('/admin', adminRoutes);
app.use('/expert', expertRoutes);

const PORT = process.env.PORT || 5000;
const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/deepsea_obs';

mongoose.connect(MONGO).then(() => {
  console.log('Observation-service connected to MongoDB');
  app.listen(PORT, () => console.log('Observation-service running on port', PORT));
}).catch(err => {
  console.error('Observation-service Mongo connection error:', err);
});
