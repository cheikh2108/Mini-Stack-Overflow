// Ce fichier gère toutes les routes liées aux questions (CRUD, listing, etc.)

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const pool = require('../db/connection');
const { protect } = require('../middleware/auth');


router.post('/', protect, async (req, res) => {
    const { title, content, tags } = req.body;
    const author_id = req.user.id;

    // Validation de base
    if (!title || !content || !Array.isArray(tags) || tags.length === 0) {
        return res.status(400).json({
            message: "Veuillez fournir un titre, un contenu et au moins un tag."
        });
    }

    const question_id = uuidv4();
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();
        // Créer la question
        const questionQuery = `
            INSERT INTO questions (id, title, content, author_id)
            VALUES (?, ?, ?, ?)
        `;
        await connection.query(questionQuery, [question_id, title, content, author_id]);

        // Ajouter les liaisons avec les tags
        if (tags.length > 0) {
            const tag_values = tags.map(tag_id => [question_id, tag_id]);
            const tagQuery = `
                INSERT INTO question_tags (question_id, tag_id)
                VALUES ?
            `;
            await connection.query(tagQuery, [tag_values]);
        }
        await connection.commit();
        // Retourner la question créée
        const [createdQuestionRows] = await connection.query(`
            SELECT 
                q.id, q.title, q.content, q.views, q.votes, q.created_at, q.updated_at,
                JSON_OBJECT('id', p.id, 'username', p.username, 'avatar_url', p.avatar_url) AS author,
                (SELECT CONCAT('[', GROUP_CONCAT(JSON_OBJECT('id', t.id, 'name', t.name, 'color', t.color)), ']')
                 FROM question_tags qt
                 JOIN tags t ON qt.tag_id = t.id
                 WHERE qt.question_id = q.id) AS tags
            FROM questions q
            JOIN profiles p ON q.author_id = p.id
            WHERE q.id = ?
        `, [question_id]);
        return res.status(201).json(createdQuestionRows[0]);
    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Erreur de transaction lors de la creation de la question :", error);
        return res.status(500).json({
            message: "Une erreur est survenue lors de la creation de la question.",
            error: error.message
        });
    } finally {
        if (connection) connection.release();
    }
});
// @desc    Lister toutes les questions (avec pagination et tags associés)

router.get('/', async (req, res) => {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const tagFilter = req.query.tag;

    try {
        let questionsQuery;
        let queryParams = [];
        let countQuery;
        let countParams = [];

        if (tagFilter) {
            // Filtrer par tag (par nom de tag)
            questionsQuery = `
                SELECT
                    q.id, q.title, q.content, q.views, q.votes, q.created_at, q.updated_at,
                    JSON_OBJECT('id', p.id, 'username', p.username, 'avatar_url', p.avatar_url) AS author,
                    CONCAT('[', GROUP_CONCAT(JSON_OBJECT('id', t.id, 'name', t.name, 'color', t.color)), ']') AS tags
                FROM questions q
                JOIN profiles p ON q.author_id = p.id
                JOIN question_tags qt ON q.id = qt.question_id
                JOIN tags t ON qt.tag_id = t.id
                WHERE t.name = ?
                GROUP BY q.id
                ORDER BY q.created_at DESC
                LIMIT ? OFFSET ?
            `;
            queryParams = [tagFilter, limit, offset];
            countQuery = `
                SELECT COUNT(DISTINCT q.id) AS total_count
                FROM questions q
                JOIN question_tags qt ON q.id = qt.question_id
                JOIN tags t ON qt.tag_id = t.id
                WHERE t.name = ?
            `;
            countParams = [tagFilter];
        } else {
            // Pas de filtre tag, toutes les questions
            questionsQuery = `
                SELECT
                    q.id, q.title, q.content, q.views, q.votes, q.created_at, q.updated_at,
                    JSON_OBJECT('id', p.id, 'username', p.username, 'avatar_url', p.avatar_url) AS author,
                    CONCAT('[', GROUP_CONCAT(JSON_OBJECT('id', t.id, 'name', t.name, 'color', t.color)), ']') AS tags
                FROM questions q
                JOIN profiles p ON q.author_id = p.id
                LEFT JOIN question_tags qt ON q.id = qt.question_id
                LEFT JOIN tags t ON qt.tag_id = t.id
                GROUP BY q.id
                ORDER BY q.created_at DESC
                LIMIT ? OFFSET ?
            `;
            queryParams = [limit, offset];
            countQuery = 'SELECT COUNT(id) AS total_count FROM questions';
            countParams = [];
        }

        const [totalResults] = await pool.query(countQuery, countParams);
        const totalCount = totalResults[0].total_count;
        const totalPages = Math.ceil(totalCount / limit);
        const [questions] = await pool.query(questionsQuery, queryParams);

        const responseData = {
            pagination: {
                totalCount: totalCount,
                totalPages: totalPages,
                currentPage: page,
                limit: limit

            },
            questions: questions.map(q => ({
                ...q,
                tags: q.tags ? JSON.parse(q.tags) : [] // Convertir la chaîne JSON en tableau
            }))
            
        };
    } catch (error) {
        console.error("Erreur lors de la récupération des questions :", error);
        return res.status(500).json({ 
            message: "Une erreur interne est survenue lors de la liste des questions.",
            error: error.message 
        });
    }

});

// @desc    Récupérer une question par son id (avec tags et auteur)
router.get('/:id', async (req, res) => {
  // Indice : récupère la question, ses tags et l'auteur
   // 1. Récupération de l'ID depuis les paramètres de l'URL
    const { id } = req.params; 

    // Validation de base de l'ID (on s'attend à un UUID)
    if (!id || id.length !== 36) {
        return res.status(400).json({ 
            message: "L'ID de la question est invalide." 
        });
    }

    try {
        // --- 1. Incrémenter le compteur de vues (views) ---
        // On fait une mise à jour simple avant de récupérer les données
        await pool.query(
            'UPDATE questions SET views = views + 1 WHERE id = ?', 
            [id]
        );

        // --- 2. Requête pour récupérer la question, l'auteur et les tags ---
        const questionQuery = `
            SELECT
                q.id, q.title, q.content, q.views, q.votes, q.created_at, q.updated_at,
                -- Joindre les informations de l'auteur (Profile)
                JSON_OBJECT('id', p.id, 'username', p.username, 'avatar_url', p.avatar_url, 'reputation', p.reputation) AS author,
                -- Agréger tous les tags associés
                CONCAT('[', GROUP_CONCAT(JSON_OBJECT('id', t.id, 'name', t.name, 'color', t.color)), ']') AS tags
            FROM questions q
            JOIN profiles p ON q.author_id = p.id
            -- LEFT JOIN pour récupérer les tags
            LEFT JOIN question_tags qt ON q.id = qt.question_id
            LEFT JOIN tags t ON qt.tag_id = t.id
            WHERE q.id = ?
            GROUP BY q.id
        `;

        // Exécution de la requête
        const result = await pool.query(questionQuery, [id]);
        
        // Si aucune ligne n'est retournée, la question n'existe pas
        if (result.length === 0) {
            return res.status(404).json({ 
                message: "Question non trouvée." 
            });
        }
        
        // Récupérer le résultat unique
        const question = result[0];

        // --- 3. Former la réponse ---
        
        // Si le JSON_ARRAYAGG ne trouve rien (question sans tag), il retourne potentiellement [null] ou null
        const tagsData = question.tags 
            ? JSON.parse(question.tags) 
            : null;
        
        // Filtrer les tags pour s'assurer qu'on n'a pas [null] si la question n'a pas de tag
        const finalTags = (Array.isArray(tagsData) && tagsData[0] !== null) 
            ? tagsData 
            : [];


        const responseData = {
            ...question,
            // Remplacer la chaîne JSON brute par l'objet/tableau parsé
            author: JSON.parse(question.author),
            tags: finalTags,
            // S'assurer que 'views' est l'entier mis à jour
            views: question.views + 1
        };

        return res.status(200).json(responseData);

    } catch (error) {
        console.error(`Erreur lors de la récupération de la question ${id}:`, error);
        return res.status(500).json({ 
            message: "Une erreur interne est survenue lors de la récupération de la question.",
            error: error.message 
        });
    }
});

// @desc    Modifier une question (seulement par l'auteur)
router.put('/:id', protect, async (req, res) => {
  // Indice : vérifie que req.user.id === author_id
  // Mets à jour title, content, tags si besoin
  const { id } = req.params;
    const { title, content, tags } = req.body;
    const user_id = req.user.id; // L'UUID de l'utilisateur connecté

    // 1. Validation des données
    if (!title || !content || !Array.isArray(tags)) {
        return res.status(400).json({ 
            message: "Veuillez fournir un titre, un contenu et un tableau de tags valides." 
        });
    }

    let connection; 

    try {
        // Obtenir une connexion pour la transaction
        connection = await pool.getConnection(); 
        await connection.beginTransaction();

        // --- 1. Vérification de l'auteur ---
        
        // Récupérer l'auteur actuel de la question
        const [questionResult] = await connection.query(
            'SELECT author_id FROM questions WHERE id = ?', 
            [id]
        );

        if (questionResult.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: "Question non trouvée." });
        }

        const author_id = questionResult[0].author_id;

        // Vérification d'autorisation (Autorisation 403 Forbidden)
        if (author_id !== user_id) {
            await connection.rollback();
            return res.status(403).json({ message: "Accès refusé. Vous n'êtes pas l'auteur de cette question." });
        }

        // --- 2. Mise à jour de la question (title, content) ---
        const updateQuestionQuery = `
            UPDATE questions 
            SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        await connection.query(updateQuestionQuery, [title, content, id]);

        // --- 3. Mise à jour des tags associés ---
        
        // a) Suppression des liaisons existantes
        await connection.query('DELETE FROM question_tags WHERE question_id = ?', [id]);
        
        // b) Ajout des nouvelles liaisons, seulement s'il y a des tags
        if (tags.length > 0) {
            const tag_values = tags.map(tag_id => [id, tag_id]);
            const insertTagsQuery = `
                INSERT INTO question_tags (question_id, tag_id)
                VALUES ?
            `;
            // Utilisation d'une insertion multiple
            await connection.query(insertTagsQuery, [tag_values]);
        }

        // Si tout s'est bien passé, on valide la transaction
        await connection.commit();

        // --- 4. Retourner la question mise à jour (comme dans la route GET /:id) ---
        
        // Exécuter la requête de récupération pour obtenir le résultat complet formaté en JSON
        const updatedQuestionResult = await pool.query(`
            SELECT
                q.id, q.title, q.content, q.views, q.votes, q.created_at, q.updated_at,
                JSON_OBJECT('id', p.id, 'username', p.username, 'avatar_url', p.avatar_url) AS author,
                (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', t.id, 'name', t.name, 'color', t.color))
                 FROM question_tags qt
                 JOIN tags t ON qt.tag_id = t.id
                 WHERE qt.question_id = q.id) AS tags
            FROM questions q
            JOIN profiles p ON q.author_id = p.id
            WHERE q.id = ?
            GROUP BY q.id
        `, [id]);
        
        // On renvoie la question (formatée comme dans la route GET /:id)
        const updatedQuestion = updatedQuestionResult[0];
        const tagsData = updatedQuestion.tags ? JSON.parse(updatedQuestion.tags) : null;
        
        const responseData = {
            ...updatedQuestion,
            author: JSON.parse(updatedQuestion.author),
            tags: (Array.isArray(tagsData) && tagsData[0] !== null) ? tagsData : []
        };
        
        return res.status(200).json(responseData);

    } catch (error) {
        // Annuler la transaction en cas d'erreur
        if (connection) {
            await connection.rollback();
        }
        
        console.error(`Erreur de transaction lors de la modification de la question ${id}:`, error);
        return res.status(500).json({ 
            message: "Une erreur interne est survenue lors de la modification de la question.",
            error: error.message 
        });
    } finally {
        // Relâcher la connexion
        if (connection) {
            connection.release();
        }
    }
});

// @desc    Supprimer une question (seulement par l'auteur)
router.delete('/:id', protect, async (req, res) => {
  // Indice : vérifie que req.user.id === author_id
  // Supprime la question et les liaisons
    const { id } = req.params;
    const user_id = req.user.id; // L'UUID de l'utilisateur connecté

    let connection; 

    try {
        // Obtenir une connexion pour la transaction (bonne pratique même pour un DELETE)
        connection = await pool.getConnection(); 
        await connection.beginTransaction();

        // --- 1. Vérification de l'auteur et existence de la question ---
        
        // Récupérer l'auteur actuel de la question
        const [questionResult] = await connection.query(
            'SELECT author_id FROM questions WHERE id = ?', 
            [id]
        );

        if (questionResult.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: "Question non trouvée." });
        }

        const author_id = questionResult[0].author_id;

        // Vérification d'autorisation (Autorisation 403 Forbidden)
        if (author_id !== user_id) {
            await connection.rollback();
            return res.status(403).json({ message: "Accès refusé. Vous n'êtes pas l'auteur de cette question." });
        }

        // --- 2. Suppression de la question ---
        
        const deleteQuery = 'DELETE FROM questions WHERE id = ?';
        const [result] = await connection.query(deleteQuery, [id]);

        // Vérification pour être sûr qu'une ligne a bien été affectée
        if (result.affectedRows === 0) {
            // Bien que théoriquement impossible si on passe la vérif 404, c'est une sécurité
            await connection.rollback();
            return res.status(404).json({ message: "Échec de la suppression, question non trouvée." });
        }

        // Si tout s'est bien passé, on valide la transaction
        await connection.commit();

        // --- 3. Retourner la confirmation ---
        
        return res.status(204).send(); 

    } catch (error) {
        // Annuler la transaction en cas d'erreur
        if (connection) {
            await connection.rollback();
        }
        
        console.error(`Erreur de transaction lors de la suppression de la question ${id}:`, error);
        return res.status(500).json({ 
            message: "Une erreur interne est survenue lors de la suppression de la question.",
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
