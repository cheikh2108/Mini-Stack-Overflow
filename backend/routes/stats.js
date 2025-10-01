// backend/routes/stats.js
// Route pour retourner les statistiques globales du site

const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// @route   GET /api/stats
// @desc    Récupérer les statistiques globales (total questions, taux de résolution, tags actifs)
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Nombre total de questions
    const [[{ total_questions }]] = await pool.query('SELECT COUNT(*) AS total_questions FROM questions');
    // Nombre de questions résolues (au moins une réponse acceptée)
    const [[{ resolved }]] = await pool.query('SELECT COUNT(DISTINCT question_id) AS resolved FROM answers WHERE is_accepted = TRUE');
    // Nombre de tags actifs (utilisés au moins une fois)
    const [[{ active_tags }]] = await pool.query('SELECT COUNT(DISTINCT tag_id) AS active_tags FROM question_tags');
    // Taux de résolution
    const resolution = total_questions > 0 ? Math.round((resolved / total_questions) * 100) : 0;
    res.json({
      total: total_questions,
      resolution,
      actifs: active_tags
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des stats :', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des stats.' });
  }
});

module.exports = router;
