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
    host: 'localhost', 
    user: 'root',
    password: 'root',
    database: 'the_guardian'
});

// Vérification de la connexion à MySQL
db.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à MySQL:', err);
        return;
    }
    console.log('Connecté à MySQL en local.');
});

// Endpoint pour ajouter un utilisateur
app.post('/api/add-user', (req, res) => {
    const { userId } = req.body;  // Récupérer l'email de l'utilisateur envoyé depuis le frontend

    // Vérifier si la connexion est ouverte avant de faire la requête
    if (!db._socket || db._socket.destroyed) {
        console.error("La connexion MySQL est fermée.");
        return res.status(500).send('Erreur de connexion à la base de données.');
    }

    // Insertion de l'utilisateur dans la table 'users'
    const query = `INSERT IGNORE INTO users (user_id) VALUES (?)`;
    db.query(query, [userId], (err) => {
        if (err) {
            console.error('Erreur lors de l\'ajout de l\'utilisateur :', err);
            return res.status(500).send('Erreur serveur');
        }

        // Ajouter un statut par défaut dans la table 'survey_status'
        const statusQuery = `INSERT IGNORE INTO survey_status (user_id) VALUES (?)`;
        db.query(statusQuery, [userId], (statusErr) => {
            if (statusErr) {
                console.error('Erreur lors de l\'ajout du statut :', statusErr);
                return res.status(500).send('Erreur serveur');
            }

            res.status(200).send('Utilisateur ajouté avec succès');
        });
    });
});

// Lancer le serveur Express
app.listen(port, () => {
    console.log(`Serveur backend démarré sur http://localhost:${port}`);
});
