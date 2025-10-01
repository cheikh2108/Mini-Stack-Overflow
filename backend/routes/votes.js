// Ce fichier gère toutes les routes liées aux votes (questions et réponses)

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const pool = require('../db/connection');
const { protect } = require('../middleware/auth');

// @route   POST /api/votes
// @desc    Voter (upvote ou downvote) sur une question ou une réponse
// @access  Privé (utilisateur connecté)
router.post('/', protect, async (req, res) => {
  // Indice : récupère votable_id, vote_type (1 ou -1), votable_type ('question' ou 'answer') depuis req.body
  // Utilise req.user.id pour l'utilisateur
  const { votable_id, vote_type, votable_type } = req.body;
    const user_id = req.user.id; // L'UUID de l'utilisateur connecté

    // 1. Validation des données
    if (!votable_id || !vote_type || (vote_type !== 1 && vote_type !== -1) || (votable_type !== 'question' && votable_type !== 'answer')) {
        return res.status(400).json({ 
            message: "Données de vote invalides. vote_type doit être 1 ou -1, votable_type 'question' ou 'answer'." 
        });
    }

    // Déterminer la table et la colonne primaire cibles
    const targetTable = votable_type === 'question' ? 'questions' : 'answers';
    let connection; 

    try {
        connection = await pool.getConnection(); 
        await connection.beginTransaction();

        // --- 1. & 2. Vérification et gestion du vote existant ---
        
        // Requête pour trouver un vote existant de cet utilisateur sur cette entité
        const [existingVote] = await connection.query(
            'SELECT id, vote_type FROM votes WHERE user_id = ? AND votable_id = ?', 
            [user_id, votable_id]
        );

        let oldVoteType = 0;
        let newVoteType = vote_type;
        let finalVotesDelta = 0;

        if (existingVote.length > 0) {
            // Un vote existe déjà
            const oldVote = existingVote[0];
            oldVoteType = oldVote.vote_type;

            if (oldVoteType === newVoteType) {
                // L'utilisateur clique à nouveau sur le même vote (Annulation du vote)
                
                // Supprimer l'entrée de la table 'votes'
                await connection.query('DELETE FROM votes WHERE id = ?', [oldVote.id]);
                newVoteType = 0; // Marque comme suppression
                
                finalVotesDelta = -oldVoteType; 
            
            } else {
                // L'utilisateur change son vote (ex: de +1 à -1)
                
                // Mettre à jour l'entrée de la table 'votes'
                await connection.query(
                    'UPDATE votes SET vote_type = ? WHERE id = ?', 
                    [newVoteType, oldVote.id]
                );
                
                finalVotesDelta = newVoteType - oldVoteType; 
            }
        } else {
            // Aucun vote existant (Insertion du vote)
            
            // Insérer un nouveau vote
            const new_vote_id = uuidv4();
            await connection.query(
                'INSERT INTO votes (id, user_id, votable_id, vote_type) VALUES (?, ?, ?, ?)', 
                [new_vote_id, user_id, votable_id, vote_type]
            );
            
            // Delta = nouveau vote, par ex. +1
            finalVotesDelta = newVoteType;
        }

        // --- 3. Mettre à jour le compteur de votes dans la table cible ---
        
        const updateCounterQuery = `
            UPDATE ${targetTable}
            SET votes = votes + ?
            WHERE id = ?
        `;
        const [updateResult] = await connection.query(updateCounterQuery, [finalVotesDelta, votable_id]);

        if (updateResult.affectedRows === 0) {
            await connection.rollback();
            // On peut renvoyer 404 si la question/réponse n'existe pas
            return res.status(404).json({ message: `${targetTable} non trouvé.` });
        }

        // --- 4. Retourner le nouveau total de votes ---
        
        const [finalCountResult] = await connection.query(
            `SELECT votes FROM ${targetTable} WHERE id = ?`, 
            [votable_id]
        );
        const newTotalVotes = finalCountResult[0].votes;

        await connection.commit();

        return res.status(200).json({ 
            votable_id: votable_id, 
            new_vote_type: newVoteType, 
            total_votes: newTotalVotes 
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error(`Erreur de transaction lors du vote :`, error);
        return res.status(500).json({ 
            message: "Une erreur interne est survenue lors du traitement du vote.",
            error: error.message 
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// @route   DELETE /api/votes/:id
// @desc    Supprimer un vote (annuler son vote)
// @access  Privé
router.delete('/:id', protect, async (req, res) => {
  // Indice : supprime le vote par son id (et vérifie que c'est bien l'utilisateur connecté)
  // Mets à jour le compteur de votes dans la table concernée
  const { id: vote_id } = req.params;
    const user_id = req.user.id;
    let connection;

    try {
        connection = await pool.getConnection(); 
        await connection.beginTransaction();

        // --- 1. Récupérer l'info du vote pour vérification et calcul ---
        const [voteResult] = await connection.query(
            'SELECT user_id, votable_id, vote_type FROM votes WHERE id = ?', 
            [vote_id]
        );

        if (voteResult.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: "Vote non trouvé." });
        }

        const { user_id: vote_owner_id, votable_id, vote_type } = voteResult[0];
        
        // Vérification d'autorisation (403 Forbidden)
        if (vote_owner_id !== user_id) {
            await connection.rollback();
            return res.status(403).json({ message: "Accès refusé. Vous n'êtes pas l'auteur de ce vote." });
        }

        // Déterminer la table cible (on doit vérifier si c'est une question ou une réponse)
        // Note: idéalement, la table votes contiendrait votable_type pour simplifier cette vérification,
        // mais nous devons le déduire en vérifiant l'existence dans les tables questions/answers.
        let targetTable = null;
        const [qCheck] = await connection.query('SELECT 1 FROM questions WHERE id = ?', [votable_id]);
        if (qCheck.length > 0) {
            targetTable = 'questions';
        } else {
            const [aCheck] = await connection.query('SELECT 1 FROM answers WHERE id = ?', [votable_id]);
            if (aCheck.length > 0) {
                targetTable = 'answers';
            } else {
                // L'entité votée n'existe plus (cas rare, mais géré)
                await connection.rollback();
                return res.status(404).json({ message: "L'entité votée n'existe plus." });
            }
        }
        
        // --- 2. Supprimer le vote ---
        await connection.query('DELETE FROM votes WHERE id = ?', [vote_id]);

        // --- 3. Mettre à jour le compteur de votes ---
        const votesDelta = -vote_type; 
        
        const updateCounterQuery = `
            UPDATE ${targetTable}
            SET votes = votes + ?
            WHERE id = ?
        `;
        await connection.query(updateCounterQuery, [votesDelta, votable_id]);
        
        // --- 4. Retourner le nouveau total de votes (optionnel, mais utile) ---
        const [finalCountResult] = await connection.query(
            `SELECT votes FROM ${targetTable} WHERE id = ?`, 
            [votable_id]
        );
        const newTotalVotes = finalCountResult[0].votes;

        await connection.commit();

        // Code 200 OK (avec les nouvelles informations) ou 204 No Content
        return res.status(200).json({ 
            message: "Vote annulé avec succès.",
            total_votes: newTotalVotes
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error(`Erreur de transaction lors de la suppression du vote ${vote_id}:`, error);
        return res.status(500).json({ 
            message: "Une erreur interne est survenue lors de l'annulation du vote.",
            error: error.message 
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

module.exports = router;
