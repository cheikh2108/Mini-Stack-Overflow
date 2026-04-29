// backend/server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config(); // Charger les variables d'environnement dès le début

// Importer les routes
const authRoutes = require('./routes/auth');
const questionRoutes = require('./routes/questions');
const answerRoutes = require('./routes/answers');
const voteRoutes = require('./routes/votes');
const tagRoutes = require('./routes/tags');
const statsRoutes = require('./routes/stats'); // Ajoute cette ligne pour importer les routes stats
// Importer les middlewares
const { protect } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001; 
const frontendDistPath = path.join(__dirname, '../frontend/dist');

const corsOrigins = [process.env.FRONTEND_URL, ...(process.env.CORS_ORIGINS || '').split(',')]
  .map(origin => origin && origin.trim())
  .filter(Boolean);

// Middleware global
app.use(cors(corsOrigins.length > 0 ? { origin: corsOrigins } : undefined)); // Active CORS pour toutes les requêtes
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});
app.use(express.json()); // Permet de parser le corps des requêtes en JSON
app.use(express.urlencoded({ extended: true })); // Permet de parser les données de formulaire

// Connexion à la base de données (le fichier connection.js gère son propre log de connexion)
require('./db/connection'); 

// Définition des routes de l'API
app.use('/api/auth', authRoutes); // Routes d'authentification
app.use('/api/questions', questionRoutes); // Routes des questions
app.use('/api/answers', answerRoutes); // Routes des réponses
app.use('/api/votes', voteRoutes); // Routes des votes
app.use('/api/tags', tagRoutes); // Routes des tags
app.use('/api/stats', statsRoutes); // Routes des stats

if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));

  app.get(/^\/(?!api).*/, (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    return res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// Exemple de route protégée (pour plus tard)
// app.get('/api/protected', protect, (req, res) => {
//   res.json({ message: `Bienvenue ${req.user.username}, vous êtes authentifié! Votre ID est ${req.user.id}` });
// });

// Endpoint de santé pour le backend
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API Backend de Mini Stack Overflow en cours d\'exécution !' });
});

// Gestionnaire d'erreurs global (pour les erreurs non gérées dans les routes)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke on the server!' });
});

// Lancement du serveur Express
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access the API at http://localhost:${PORT}`);
});