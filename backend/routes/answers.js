// Ce fichier gère toutes les routes liées aux réponses (CRUD, listing, acceptation, etc.)

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const pool = require('../db/connection');
const { protect } = require('../middleware/auth');

// @desc    Créer une nouvelle réponse à une question
// @access  Privé (utilisateur connecté)
router.post('/', protect, async (req, res) => {
  // Indice : récupère content, question_id depuis req.body
  // Utilise req.user.id pour l'auteur
  const { content, question_id } = req.body;
  const author_id = req.user.id;

  // Validation 
  if (!content || !question_id || question_id.length !== 36) {
    return res.status(400).json({
        message: "Veuillez fournir un contenu valide et l'ID de la question."
    });
  }
  const answer_id = uuidv4();
  try {
    // ---1. Creer la reponse dans la table answers ---
    const insertQuery = `
        INSERT INTO answers (id, content, question_id, author_id)
        VALUES (?, ?, ?, ?)
    `;
    await pool.query(insertQuery, [answer_id, content, question_id, author_id]); 
    // ---2. Retourne la reponse creee ---
    const [createdAnswer] = await pool.query(`
        SELECT 
            a.id, a.content, a.question_id, a.votes, a.is_accepted, a.created_at, a.updated_at,
            JSON_OBJECT('id', p.id, 'username', p.username, 'avatar_url', p.avatar_url, 'reputation', p.reputation) AS author
        FROM answers a
        JOIN profiles p ON a.author_id = p.id
        WHERE a.id = ?
    `, [answer_id]);
        
    const responseData = {
        ...createdAnswer,
        author: JSON.parse(createdAnswer.author) // parse le JSON string en objet
    };
    return res.status(201).json(responseData);
    
  } catch (error) {
    console.error("Erreur lors de la création de la réponse :", error);
        
    // Si l'erreur est due à une clé étrangère non trouvée (question_id invalide)
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
         return res.status(404).json({ 
            message: "Question introuvable. Impossible de créer la réponse.",
            error: error.message 
        });
    }
        
    return res.status(500).json({ 
        message: "Une erreur interne est survenue lors de la création de la réponse.",
        error: error.message 
    });
  }

});

// @desc    Lister toutes les réponses d'une question
// @access  Public
router.get('/:questionId', async (req, res) => {
  // Indice : récupère toutes les réponses pour une question donnée (avec auteur)
  const { questionId } = req.params; 
    
    if (!questionId || questionId.length !== 36) {
        return res.status(400).json({ 
            message: "L'ID de la question est invalide." 
        });
    }

    try {
        // Requête pour récupérer toutes les réponses liées à questionId, avec les infos de l'auteur.
        // Triage : Les réponses acceptées en premier, puis par votes décroissants, puis par date.
        const answersQuery = `
            SELECT 
                a.id, a.content, a.question_id, a.votes, a.is_accepted, a.created_at, a.updated_at,
                JSON_OBJECT('id', p.id, 'username', p.username, 'avatar_url', p.avatar_url, 'reputation', p.reputation) AS author
            FROM answers a
            JOIN profiles p ON a.author_id = p.id
            WHERE a.question_id = ?
            ORDER BY a.is_accepted DESC, a.votes DESC, a.created_at ASC
        `;

        const answersResult = await pool.query(answersQuery, [questionId]);
        
        // Mapper et parser les objets Auteur
        const answers = answersResult.map(a => ({
            ...a,
            author: JSON.parse(a.author)
        }));

        // Code 200 OK
        return res.status(200).json(answers);

    } catch (error) {
        console.error(`Erreur lors de la récupération des réponses pour la question ${questionId}:`, error);
        return res.status(500).json({ 
            message: "Une erreur interne est survenue lors de la liste des réponses.",
            error: error.message 
        });
    }
});

// @desc    Modifier une réponse (seulement par l'auteur)
// @access  Privé
router.put('/:id', protect, async (req, res) => {
  // Indice : vérifie que req.user.id === author_id
  // Mets à jour content si besoin
   const { id } = req.params;
    const { content } = req.body;
    const user_id = req.user.id; // L'UUID de l'utilisateur connecté

    // 1. Validation de base
    if (!content || content.trim() === '') {
        return res.status(400).json({ 
            message: "Le contenu de la réponse ne peut pas être vide." 
        });
    }

    try {
        // --- 1. Vérification de l'auteur et existence de la réponse ---
        
        // Récupérer l'auteur actuel de la réponse
        const [answerResult] = await pool.query(
            'SELECT author_id, is_accepted FROM answers WHERE id = ?', 
            [id]
        );

        if (answerResult.length === 0) {
            return res.status(404).json({ message: "Réponse non trouvée." });
        }

        const { author_id, is_accepted } = answerResult[0];

        // Vérification d'autorisation (403 Forbidden)
        if (author_id !== user_id) {
            return res.status(403).json({ message: "Accès refusé. Vous n'êtes pas l'auteur de cette réponse." });
        }
        
        // Optionnel : Empêcher la modification si la réponse est acceptée
        if (is_accepted) {
            // Ici, nous supposons qu'une réponse acceptée peut toujours être modifiée.
        }

        // --- 2. Mise à jour du contenu ---
        const updateQuery = `
            UPDATE answers 
            SET content = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        await pool.query(updateQuery, [content, id]);

        // --- 3. Retourner la réponse mise à jour (incluant l'auteur) ---
        
        // Réutilise la requête de récupération pour inclure l'auteur après la mise à jour
        const [updatedAnswerResult] = await pool.query(`
            SELECT 
                a.id, a.content, a.question_id, a.votes, a.is_accepted, a.created_at, a.updated_at,
                JSON_OBJECT('id', p.id, 'username', p.username, 'avatar_url', p.avatar_url, 'reputation', p.reputation) AS author
            FROM answers a
            JOIN profiles p ON a.author_id = p.id
            WHERE a.id = ?
        `, [id]);
        
        const responseData = {
            ...updatedAnswerResult,
            author: JSON.parse(updatedAnswerResult.author)
        };
        
        // Code 200 OK
        return res.status(200).json(responseData);

    } catch (error) {
        console.error(`Erreur lors de la modification de la réponse ${id}:`, error);
        return res.status(500).json({ 
            message: "Une erreur interne est survenue lors de la modification de la réponse.",
            error: error.message 
        });
    }
});

// @route   DELETE /api/answers/:id
// @desc    Supprimer une réponse (seulement par l'auteur)
// @access  Privé
router.delete('/:id', protect, async (req, res) => {
  // Indice : vérifie que req.user.id === author_id
  // Supprime la réponse
   const { id } = req.params;
    const user_id = req.user.id; // L'UUID de l'utilisateur connecté

    try {
        // --- 1. Vérification de l'auteur et existence de la réponse ---
        
        // On utilise la même vérification que pour le PUT
        const [answerResult] = await pool.query(
            'SELECT author_id FROM answers WHERE id = ?', 
            [id]
        );

        if (answerResult.length === 0) {
            return res.status(404).json({ message: "Réponse non trouvée." });
        }

        const author_id = answerResult[0].author_id;

        // Vérification d'autorisation (403 Forbidden)
        if (author_id !== user_id) {
            return res.status(403).json({ message: "Accès refusé. Vous n'êtes pas l'auteur de cette réponse." });
        }

        // --- 2. Suppression de la réponse ---
        
        // La suppression dans 'answers' déclenchera la suppression automatique des votes associés (si on a une clé étrangère ON DELETE CASCADE sur la table 'votes').
        const deleteQuery = 'DELETE FROM answers WHERE id = ?';
        const [result] = await pool.query(deleteQuery, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Échec de la suppression, réponse non trouvée." });
        }

        // --- 3. Retourner la confirmation ---
        
        // Code 204 No Content pour une suppression réussie
        return res.status(204).send();

    } catch (error) {
        console.error(`Erreur lors de la suppression de la réponse ${id}:`, error);
        return res.status(500).json({ 
            message: "Une erreur interne est survenue lors de la suppression de la réponse.",
            error: error.message 
        });
    }
});

// @desc    Marquer une réponse comme acceptée (seulement par l'auteur de la question)
// @access  Privé
router.patch('/:id/accept', protect, async (req, res) => {
  // Indice : vérifie que l'utilisateur connecté est l'auteur de la question liée à la réponse
  const { id: answer_id } = req.params;
    const user_id = req.user.id; // L'UUID de l'utilisateur connecté

    let connection;

    try {
        // Obtenir une connexion pour la transaction
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // --- 1. Récupérer l'ID de la question et l'auteur de la question ---
        const [answerInfo] = await connection.query(
            `
            SELECT 
                a.question_id, 
                q.author_id AS question_author_id
            FROM answers a
            JOIN questions q ON a.question_id = q.id
            WHERE a.id = ?
            `,
            [answer_id]
        );

        if (answerInfo.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: "Réponse non trouvée." });
        }

        const { question_id, question_author_id } = answerInfo[0];

        // --- 2. Vérification d'autorisation (Doit être l'auteur de la question) ---
        if (question_author_id !== user_id) {
            await connection.rollback();
            return res.status(403).json({ 
                message: "Accès refusé. Seul l'auteur de la question peut accepter une réponse." 
            });
        }
        
        // --- 3. Désactiver toutes les réponses acceptées précédentes pour cette question ---
        
        const resetQuery = `
            UPDATE answers
            SET is_accepted = FALSE
            WHERE question_id = ? AND is_accepted = TRUE
        `;
        await connection.query(resetQuery, [question_id]);

        // --- 4. Marquer la réponse actuelle comme acceptée ---
        
        const acceptQuery = `
            UPDATE answers
            SET is_accepted = TRUE
            WHERE id = ?
        `;
        const [updateResult] = await connection.query(acceptQuery, [answer_id]);

        if (updateResult.affectedRows === 0) {
             // Théoriquement impossible si on passe la 404, mais une sécurité
             await connection.rollback();
             return res.status(500).json({ message: "Erreur lors de la mise à jour du statut d'acceptation." });
        }
        
        // Valider la transaction : les deux étapes de mise à jour sont validées ensemble
        await connection.commit();

        // --- 5. Retourner la réponse acceptée (ou un statut 200) ---
        
        // Optionnel : Récupérer la réponse complète pour la renvoyer
        const [finalAnswer] = await pool.query(`
            SELECT 
                a.id, a.content, a.question_id, a.votes, a.is_accepted, a.created_at, a.updated_at,
                JSON_OBJECT('id', p.id, 'username', p.username, 'avatar_url', p.avatar_url, 'reputation', p.reputation) AS author
            FROM answers a
            JOIN profiles p ON a.author_id = p.id
            WHERE a.id = ?
        `, [answer_id]);

        const responseData = {
            ...finalAnswer,
            author: JSON.parse(finalAnswer.author)
        };
        
        // Code 200 OK
        return res.status(200).json(responseData);

    } catch (error) {
        // Annuler la transaction en cas d'erreur
        if (connection) {
            await connection.rollback();
        }
        
        console.error(`Erreur lors de l'acceptation de la réponse ${answer_id}:`, error);
        return res.status(500).json({ 
            message: "Une erreur interne est survenue lors de la mise à jour du statut d'acceptation.",
            error: error.message 
        });
    } finally {
        // Relâcher la connexion
        if (connection) {
            connection.release();
        }
    }
});

module.exports = router;
