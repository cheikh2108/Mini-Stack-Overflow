// backend/routes/tags.js
// Route pour récupérer la liste des tags populaires (tous les tags avec leur nombre d'utilisation)

const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// @route   GET /api/tags
// @desc    Récupérer tous les tags avec leur nombre d'utilisation (popularité)
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Récupère tous les tags et le nombre de questions associées à chaque tag
    const [rows] = await pool.query(`
      SELECT t.id, t.name, t.color, t.description, COUNT(qt.question_id) as usage_count
      FROM tags t
      LEFT JOIN question_tags qt ON t.id = qt.tag_id
      GROUP BY t.id, t.name, t.color, t.description
      ORDER BY usage_count DESC, t.name ASC
    `);
    res.json({ tags: rows });
  } catch (error) {
    console.error('Erreur lors de la récupération des tags :', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des tags.' });
  }
});

module.exports = router;
