const jwt = require('jsonwebtoken');
const pool = require('../db/connection'); // Pour vérifier si l'utilisateur existe

const protect = async (req, res, next) => {
  let token;

  // Vérifie si un token est présent dans le header de la requête
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]; // Extrait le token

      // Vérifie et décode le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Récupère l'utilisateur à partir de la base de données grâce à l'ID dans le token
      const [profiles] = await pool.execute('SELECT id, username, email FROM profiles WHERE id = ?', [decoded.userId]);

      if (profiles.length === 0) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      req.user = profiles[0]; // Attache les informations de l'utilisateur à l'objet requête
      next(); // Passe au prochain middleware ou à la fonction de route
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };