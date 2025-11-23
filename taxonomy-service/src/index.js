const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const taxonomyRoutes = require('./routes/taxonomy');

const app = express();
const PORT = process.env.PORT || 6000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/taxonomy-db';

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Taxonomy Service - MongoDB connecté'))
  .catch(err => console.error('❌ Erreur MongoDB:', err));

// Routes
app.use('/taxonomy', taxonomyRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'taxonomy-service' });
});

app.listen(PORT, () => {
  console.log(`🌊 Taxonomy Service démarré sur le port ${PORT}`);
});
