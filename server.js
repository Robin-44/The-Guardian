const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;  

// Configurer CORS pour permettre les connexions depuis localhost:4200
app.use(cors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Utiliser body-parser pour parser le corps des requêtes en JSON
app.use(bodyParser.json());

// Connexion à la base de données MySQL locale
const db = mysql.createConnection({
    host: '127.0.0.1', 
    user: 'root',
    password: 'root',
    database: 'the_guardian',
    port: 3306         // Port MySQL par défaut
});

db.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à MySQL :');
        console.error('Message :', err.message); 
        console.error('Code :', err.code);      
        console.error('Host :', db.config.host);
        console.error('Port :', db.config.port);
        console.error('Utilisateur :', db.config.user);
        return;
    }
    console.log('Connecté à MySQL.');
});


app.post('/api/auth-user', (req, res) => {
    const { userId } = req.body;

    // Démarrer une transaction
    db.beginTransaction((transactionErr) => {
        if (transactionErr) {
            console.error('Erreur lors du démarrage de la transaction :', transactionErr);
            return res.status(500).json({ error: 'Erreur lors du démarrage de la transaction' });
        }

        // Insérer ou mettre à jour l'utilisateur dans "users"
        const userQuery = `
            INSERT INTO users (user_id) VALUES (?)
            ON DUPLICATE KEY UPDATE user_id = VALUES(user_id)
        `;
        db.query(userQuery, [userId], (userErr) => {
            if (userErr) {
                console.error('Erreur lors de l\'insertion ou mise à jour dans users :', userErr);
                return db.rollback(() => {
                    res.status(500).json({ error: 'Erreur lors de l\'ajout de l\'utilisateur' });
                });
            }

            // Insérer ou mettre à jour dans "survey_status"
            const statusQuery = `
                INSERT INTO survey_status (user_id, survey_completed)
                VALUES (?, 0)
                ON DUPLICATE KEY UPDATE survey_completed = survey_completed
            `;
            db.query(statusQuery, [userId], (statusErr) => {
                if (statusErr) {
                    console.error('Erreur lors de l\'insertion ou mise à jour dans survey_status :', statusErr);
                    return db.rollback(() => {
                        res.status(500).json({ error: 'Erreur lors de l\'ajout ou mise à jour du statut' });
                    });
                }

                // Vérifier le statut de survey_completed
                const checkQuery = `
                    SELECT survey_completed FROM survey_status WHERE user_id = ?
                `;
                db.query(checkQuery, [userId], (checkErr, results) => {
                    if (checkErr) {
                        console.error('Erreur lors de la vérification du statut :', checkErr);
                        return db.rollback(() => {
                            res.status(500).json({ error: 'Erreur lors de la vérification du statut' });
                        });
                    }

                    if (results.length > 0) {
                        // Renvoyer le statut survey_completed
                        const surveyCompleted = results[0].survey_completed;

                        // Valider la transaction avant de renvoyer la réponse
                        db.commit((commitErr) => {
                            if (commitErr) {
                                console.error('Erreur lors de la validation de la transaction :', commitErr);
                                return db.rollback(() => {
                                    res.status(500).json({ error: 'Erreur lors de la validation de la transaction' });
                                });
                            }

                            console.log('Utilisateur et statut traités avec succès.');
                            res.status(200).json({ surveyCompleted });
                        });
                    } else {
                        console.error('Utilisateur introuvable dans survey_status.');
                        return db.rollback(() => {
                            res.status(404).json({ error: 'Utilisateur introuvable dans survey_status' });
                        });
                    }
                });
            });
        });
    });
});

app.post('/api/submit-survey', (req, res) => {
    const {
        userId, userName, userAge, userGender,
        medicationName, medicationDosage, medicationForm,
        frequency, exactTime, reminderTime, token
    } = req.body;

    // Validation des données
    if (!userId || !token || !userName || !medicationName || !frequency || !exactTime || !reminderTime) {
        console.error('Données manquantes dans la requête.');
        return res.status(400).json({ error: 'Données manquantes ou invalides dans la requête.' });
    }

    console.log('Données reçues :', req.body); // Log pour vérifier les données reçues

    // Démarrer une transaction
    db.beginTransaction((transactionErr) => {
        if (transactionErr) {
            console.error('Erreur lors du démarrage de la transaction :', transactionErr);
            return res.status(500).json({ error: 'Erreur lors du démarrage de la transaction.' });
        }

        // Requête d'insertion ou de mise à jour
        const insertSurveyQuery = `
    INSERT INTO survey_responses (
        user_id, user_name, user_age, user_gender,
        medication_name, medication_dosage, medication_form,
        frequency,medication_date, reminder_time, token, 
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
        user_name = VALUES(user_name),
        user_age = VALUES(user_age),
        user_gender = VALUES(user_gender),
        medication_name = VALUES(medication_name),
        medication_dosage = VALUES(medication_dosage),
        medication_form = VALUES(medication_form),
        frequency = VALUES(frequency),
        medication_date = VALUES(medication_date)
        reminder_time = VALUES(reminder_time),
        token = VALUES(token),
`;

db.query(
    insertSurveyQuery,
    [
        userId, userName, userAge || null, userGender || null,
        medicationName, medicationDosage || null, medicationForm || null,
        frequency,, medicationDate || null, reminderTime, token
    ],
    (insertErr, insertResult) => {
        if (insertErr) {
            console.error('Erreur lors de l\'insertion dans survey_responses :', insertErr);
            return db.rollback(() => {
                res.status(500).json({ error: 'Erreur lors de l\'insertion des données.' });
            });
        }

        console.log('Données insérées dans survey_responses :', insertResult);

        // Mise à jour du statut dans survey_status
        const updateStatusQuery = `
            UPDATE survey_status
            SET survey_completed = 1
            WHERE user_id = ?
        `;
        db.query(updateStatusQuery, [userId], (updateErr, updateResult) => {
            if (updateErr) {
                console.error('Erreur lors de la mise à jour du statut :', updateErr);
                return db.rollback(() => {
                    res.status(500).json({ error: 'Erreur lors de la mise à jour du statut.' });
                });
            }

            console.log('Résultat de la mise à jour du statut :', updateResult);

            // Valider la transaction
            db.commit((commitErr) => {
                if (commitErr) {
                    console.error('Erreur lors de la validation de la transaction :', commitErr);
                    return db.rollback(() => {
                        res.status(500).json({ error: 'Erreur lors de la validation de la transaction.' });
                    });
                }

                console.log('Transaction réussie. Données enregistrées.');
                res.status(200).json({ message: 'Données enregistrées et statut mis à jour avec succès.' });
            });
        });
    }
);
    });
});



// Lancer le serveur Express
app.listen(port, () => {
    console.log(`Serveur backend démarré sur http://localhost:${port}`);
});
