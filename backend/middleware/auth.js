const jwt = require('jsonwebtoken');
const pool = require('../db/connection'); // Pour vérifier si l'utilisateur existe

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  const token = authHeader.slice(7).trim();

  if (!token || token === 'null' || token === 'undefined') {
    return res.status(401).json({ message: 'Not authorized, invalid token' });
  }

  try {
    // Vérifie et décode le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Récupère l'utilisateur à partir de la base de données grâce à l'ID dans le token
    const [profiles] = await pool.execute('SELECT id, username, email FROM profiles WHERE id = ?', [decoded.userId]);

    if (profiles.length === 0) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    req.user = profiles[0]; // Attache les informations de l'utilisateur à l'objet requête
    return next(); // Passe au prochain middleware ou à la fonction de route
  } catch (error) {
    // Log court pour éviter d'inonder le terminal avec la stack complète.
    console.warn('Token verification error:', error.message);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

module.exports = { protect };