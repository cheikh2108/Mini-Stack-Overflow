// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid'); // Pour générer des UUID
const pool = require('../db/connection'); // Votre module de connexion à la BDD

// @route   POST /api/auth/register
// @desc    Enregistrer un nouvel utilisateur
// @access  Public
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  // Validation simple des champs
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const profileId = uuidv4(); // Génère un UUID unique pour le nouveau profil

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Hache le mot de passe

    // Insérer le nouvel utilisateur dans la table 'profiles'
    await pool.execute(
      'INSERT INTO profiles (id, username, email, password_hash) VALUES (?, ?, ?, ?)',
      [profileId, username, email, hashedPassword]
    );

    // Génération du token JWT
    const token = jwt.sign(
      { userId: profileId, username: username }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    res.status(201).json({ 
      message: 'User registered successfully!',
      token,
      user: { id: profileId, username, email }
    });

  } catch (error) {
    console.error("Registration error:", error);
    if (error.code === 'ER_DUP_ENTRY') { // Gère l'erreur si l'email ou le username existe déjà
      return res.status(409).json({ message: 'Username or Email already exists' });
    }
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Connecter un utilisateur
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body; // La connexion se fera par email

  // Validation simple des champs
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Recherche l'utilisateur par son email dans la table 'profiles'
    const [users] = await pool.execute('SELECT id, username, email, password_hash FROM profiles WHERE email = ?', [email]);
    const user = users[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials (user not found)' });
    }

    // Compare le mot de passe fourni avec le mot de passe haché stocké
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials (wrong password)' });
    }

    // Génération du token JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Logged in successfully', token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router;