// backend/server.js
const express = require('express');
const cors = require('cors');
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

// Middleware global
app.use(cors()); // Active CORS pour toutes les requêtes
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

// Exemple de route protégée (pour plus tard)
// app.get('/api/protected', protect, (req, res) => {
//   res.json({ message: `Bienvenue ${req.user.username}, vous êtes authentifié! Votre ID est ${req.user.id}` });
// });

// Route de test simple pour vérifier que le serveur est démarré
app.get('/', (req, res) => {
  res.send('API Backend de Mini Stack Overflow en cours d\'exécution !');
});

// Gestionnaire d'erreurs global (pour les erreurs non gérées dans les routes)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke on the server!');
});

// Lancement du serveur Express
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access the API at http://localhost:${PORT}`);
});