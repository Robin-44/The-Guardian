const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3000;
const webPush = require('web-push');
const cron = require('node-cron');
const { auth } = require('express-oauth2-jwt-bearer');
const authConfig = require('./auth_config.json');


// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connecté à MongoDB'))
    .catch((err) => console.error('Erreur de connexion à MongoDB :', err));

// Importer les modèles
const User = require('./src/models/user.model.js');
const SurveyStatus = require('./src/models/survey_status.model.js');
const SurveyResponse = require('./src/models/survey_response.model.js');
const Posology = require('./src/models/posology.model.js');
const Subscription = require('./src/models/subscription.model');
const Reminder = require('./src/models/reminder.model.js');

// API pour l'authentification de l'utilisateur
app.post('/api/auth-user', async (req, res) => {
    const { token } = req.body;

    try {
        const user = await User.findOneAndUpdate(
            { token },
            { token },
            { upsert: true, new: true }
        );

        let surveyStatus = await SurveyStatus.findOne({ user: user._id });
        if (!surveyStatus) {
            surveyStatus = new SurveyStatus({ user: user._id, survey_completed: false });
            await surveyStatus.save();
        }

        res.status(200).json({ surveyCompleted: surveyStatus.survey_completed });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur lors de l\'authentification de l\'utilisateur.' });
    }
});

// API pour soumettre les données du formulaire
app.post('/api/submit-survey', async (req, res) => {
    const {
        token,
        userName,
        userAge,
        userGender,
        medicationName,
        medicationDosage,
        medicationForm,
        frequency,
        medicationDate,
        reminderTime
    } = req.body;

    try {
        const user = await User.findOne({ token });
        if (!user) return res.status(404).json({ error: 'Utilisateur introuvable.' });

        const surveyResponse = new SurveyResponse({
            user: user._id,
            userName,
            userAge,
            userGender,
            medicationName,
            medicationDosage,
            medicationForm,
            frequency,
            medicationDate,
            reminderTime,
        });

        await surveyResponse.save();

        await SurveyStatus.updateOne({ user: user._id }, { survey_completed: true });

        res.status(200).json({ message: 'Formulaire soumis avec succès.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur lors de la soumission du formulaire.' });
    }
});

// Configuration des clés VAPID
webPush.setVapidDetails(
    'mailto:zawady02@gmail.com',
    'BFkqMe1Z27lVdZcX8yRf-1qPsS5YdCTBZblt6hn7-s4AOGFYNosXKFU1Z35jO_RhjNEVIm4NrAnrByq-tlD3Vsc',
    'T_89Dq2oFl48Zg9YYrlYnLiLn-bGznqf_0ggzKxJsJ8'
);


// API pour s'abonner aux notifications
app.post('/api/subscribe', async (req, res) => {
    const { token, subscription } = req.body;

    if (!token || !subscription) {
        return res.status(400).json({ error: 'Token et subscription sont requis.' });
    }

    try {
        // Vérifiez si une souscription existe déjà pour cet utilisateur
        let userSubscription = await Subscription.findOne({ user: token });
        if (!userSubscription) {
            // Créez une nouvelle souscription si elle n'existe pas
            userSubscription = new Subscription({ user: token, subscription });
            await userSubscription.save();
        } else {
            // Mettez à jour la souscription existante
            userSubscription.subscription = subscription;
            await userSubscription.save();
        }

        console.log('Souscription enregistrée avec succès :', userSubscription);
        res.status(200).json({ message: 'Souscription enregistrée avec succès.' });
    } catch (err) {
        console.error('Erreur lors de l\'enregistrement de la souscription :', err);
        res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
});


// API pour vérifier le statut de souscription d'un utilisateur
app.get('/api/subscription-status/:token', async (req, res) => {
    const { token } = req.params;

    try {
        // Vérifiez si une souscription existe pour cet utilisateur
        const subscription = await Subscription.findOne({ user: token });
        res.status(200).json({ isSubscribed: !!subscription });
    } catch (err) {
        console.error('Erreur lors de la vérification de souscription :', err);
        res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
});


// API pour se desabonner des notifications 
app.delete('/api/unsubscribe/:token', async (req, res) => {
    const { token } = req.params;

    try {
        // Supprimez la souscription associée à ce token
        const result = await Subscription.deleteOne({ user: token });
        if (result.deletedCount > 0) {
            console.log(`Souscription supprimée pour l'utilisateur : ${token}`);
            res.status(200).json({ message: 'Souscription supprimée avec succès.' });
        } else {
            res.status(404).json({ error: 'Aucune souscription trouvée pour cet utilisateur.' });
        }
    } catch (err) {
        console.error('Erreur lors de la suppression de la souscription :', err);
        res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
});

app.get('/api/reminder/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Récupérer le rappel et peupler les détails de la posologie
        const reminder = await Reminder.findById(id).populate('posology');
        if (!reminder) {
            return res.status(404).json({ error: 'Rappel introuvable.' });
        }

        res.status(200).json(reminder);
    } catch (err) {
        console.error('Erreur lors de la récupération du rappel :', err);
        res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
});

app.post('/api/reminder/:id/action', async (req, res) => {
    const { id } = req.params;
    const { action } = req.body;

    try {
        const reminder = await Reminder.findById(id);
        if (!reminder) {
            return res.status(404).json({ error: 'Rappel introuvable.' });
        }

        if (action === 'confirm') {
            reminder.taken = true;
            reminder.confirmationTime = new Date();
        } else if (action === 'ignore') {
            reminder.taken = false; // Peut-être déjà `false` par défaut
        } else {
            return res.status(400).json({ error: 'Action non valide.' });
        }

        await reminder.save();
        res.status(200).json({ message: 'Action effectuée avec succès.', reminder });
    } catch (err) {
        console.error('Erreur lors de la mise à jour du rappel :', err);
        res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
});


// API pour enregistrer une posologie et un rappel
app.post('/api/posology', async (req, res) => {
    try {
        const { userId, medicationName, scheduledTime } = req.body;

        if (!userId || !medicationName || !scheduledTime) {
            return res.status(400).json({ error: 'Tous les champs sont requis.' });
        }

        // scheduledTime est reçu en UTC et stocké directement
        const posology = new Posology({
            user: userId,
            medicationName,
            scheduledTime: new Date(scheduledTime), // Enregistré tel quel (UTC)
        });

        await posology.save();

        const reminder = new Reminder({
            posology: posology._id,
            user: userId,
        });

        await reminder.save();

        res.status(201).json({ message: 'Posologie et rappel ajoutés avec succès.' });
    } catch (err) {
        console.error('Erreur lors de l\'ajout de la posologie :', err);
        res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
});


const moment = require('moment-timezone');

// Cron pour vérifier les rappels toutes les minutes

cron.schedule('* * * * *', async () => {
    console.log('Vérification des rappels...');

    // Heure actuelle en UTC
    const nowUTC = moment.utc();
    console.log(`Heure actuelle UTC : ${nowUTC.format()}`);

    // Heure actuelle en Europe/Paris
    const nowParis = nowUTC.clone().tz('Europe/Paris');
    console.log(`Heure actuelle Europe/Paris : ${nowParis.format()}`);


    try {
        // Récupérez les rappels non pris depuis MongoDB
        const reminders = await Reminder.find({ taken: false }).populate('posology');
        console.log(`Nombre de rappels récupérés : ${reminders.length}`);

        for (const reminder of reminders) {
            if (!reminder.posology || !reminder.posology.scheduledTime) {
                console.error(`Posology invalide pour le rappel : ${reminder._id}`);
                continue;
            }

            // heure prevue du rappel 
            const scheduledTimeParis = moment(reminder.posology.scheduledTime).subtract(1, 'hours');
            console.log(`Rappel prévu pour (UTC ajusté -1h) : ${scheduledTimeParis.format()}`);


            // Si l'heure prévue est passée de 3 minutes ou plus
            if (scheduledTimeParis.isSameOrBefore(nowUTC) && !reminder.reminded) {

                console.log(`Rappel initial pour le médicament : ${reminder.posology.medicationName}`);

                // Recherchez la souscription associée à l'utilisateur
                const subscription = await Subscription.findOne({ user: reminder.posology.user });
                if (!subscription) {
                    console.log(`Aucune souscription trouvée pour l'utilisateur : ${reminder.posology.user}`);
                    continue;
                }

                // Préparer et envoyer la notification
                const payload = JSON.stringify({
                    notification: {
                        title: 'Rappel de médicament',
                        body: `Il est temps de prendre votre médicament : ${reminder.posology.medicationName}`,
                        data: {
                            reminderId: reminder._id.toString(),
                            action: 'openModal'
                        },
                    },
                });

                try {
                    await webPush.sendNotification(subscription.subscription, payload);
                    console.log(`Notification initiale envoyée pour : ${reminder.posology.medicationName}`);
                    console.log(`Reminder ID envoyé dans la notification : ${reminder._id}`);
                    // Marquer le rappel comme "notifié"
                    reminder.reminded = true;
                    await reminder.save();
                } catch (err) {
                    console.error(`Erreur lors de l'envoi de la notification initiale : ${err.message}`);
                }
            }
            else if (scheduledTimeParis.isAfter(nowParis)) {
                // Cas : La date prévue n'est pas encore atteinte
                console.log(`Rappel ignoré : prévu pour ${scheduledTimeParis.format()}, heure actuelle ${nowParis.format()}`);
            }

            // Cas 2 : Renvoi du rappel après 3 minutes si aucune action n'a été prise
            const timeDifference = nowParis.diff(scheduledTimeParis, 'minutes');
            if (timeDifference >= 3 && !reminder.taken && !reminder.resendNotified) {
                console.log(`Renvoi du rappel pour le médicament : ${reminder.posology.medicationName}`);
                console.log(`Reminder ID envoyé dans la notification : ${reminder._id}`);

                // Recherchez la souscription associée à l'utilisateur
                const subscription = await Subscription.findOne({ user: reminder.posology.user });
                if (!subscription) {
                    console.log(`Aucune souscription trouvée pour l'utilisateur : ${reminder.posology.user}`);
                    continue;
                }

                // Préparer et envoyer la notification
                const payload = JSON.stringify({
                    notification: {
                        title: 'Rappel de médicament',
                        body: `N'oubliez pas de prendre votre médicament : ${reminder.posology.medicationName}`,
                        data: {
                            reminderId: reminder._id.toString(),
                            action: 'openModal'
                        },
                    },
                });

                try {
                    await webPush.sendNotification(subscription.subscription, payload);
                    console.log(`Notification de renvoi envoyée pour : ${reminder.posology.medicationName}`);
                    // Marquer le rappel comme "renvoyé"
                    reminder.resendNotified = true;
                    await reminder.save();
                } catch (err) {
                    console.error(`Erreur lors du renvoi de la notification : ${err.message}`);
                }
            }
        }
    } catch (err) {
        console.error('Erreur lors de la récupération ou de l\'envoi des rappels :', err);
    }
});


app.get('/api/user-posologies/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        // Récupérer toutes les posologies pour cet utilisateur
        const posologies = await Posology.find({ user: userId });

        if (!posologies.length) {
            return res.status(404).json({ error: 'Aucune posologie trouvée pour cet utilisateur.' });
        }

        // Récupérer tous les rappels associés à ces posologies
        const posologyIds = posologies.map((posology) => posology._id);
        const reminders = await Reminder.find({ posology: { $in: posologyIds } });

        // Joindre les données des rappels aux posologies
        const result = posologies.map((posology) => {
            const reminder = reminders.find((rem) => rem.posology.toString() === posology._id.toString());
            return {
                ...posology.toObject(),
                taken: reminder ? reminder.taken : null, // Si aucun rappel, mettre `null`
            };
        });

        res.status(200).json(result);
    } catch (err) {
        console.error('Erreur lors de la récupération des posologies :', err);
        res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
});

app.delete('/api/posologies/:id', async (req, res) => {
    const { id } = req.params;
    console.log('ID de la posologie à supprimer :', id); // Ajout du log
    try {
        const deletedPosology = await Posology.findByIdAndDelete(id);
        if (!deletedPosology) {
            return res.status(404).json({ error: 'Posologie non trouvée.' });
        }
        res.status(200).json({ message: 'Posologie supprimée avec succès.' });
    } catch (err) {
        console.error('Erreur lors de la suppression de la posologie :', err);
        res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
});

// API pour mettre à jour une posologie
app.put('/api/posologies/:id', async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
        const updatedPosology = await Posology.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedPosology) {
            return res.status(404).json({ error: 'Posologie non trouvée.' });
        }

        res.status(200).json(updatedPosology);
    } catch (err) {
        console.error('Erreur lors de la mise à jour de la posologie :', err);
        res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
});

// Route pour récupérer les rappels d'un utilisateur
app.get('/api/affichage/user/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        // Trouver toutes les posologies liées à l'utilisateur
        const posologies = await Posology.find({ user: userId });

        if (!posologies || posologies.length === 0) {
            return res.status(404).json({ error: 'Aucune posologie trouvée pour cet utilisateur.' });
        }

        // Extraire les IDs des posologies trouvées
        const posologyIds = posologies.map((posology) => posology._id);

        // Trouver tous les reminders liés à ces posologies
        const reminders = await Reminder.find({ posology: { $in: posologyIds } }).populate('posology');

        if (!reminders || reminders.length === 0) {
            return res.status(404).json({ error: 'Aucun rappel trouvé pour cet utilisateur.' });
        }

        res.status(200).json(reminders);
    } catch (err) {
        console.error('Erreur lors de la récupération des rappels :', err);
        res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
});

app.get('/api/survey-responses/:userToken', async (req, res) => {
    const userToken = decodeURIComponent(req.params.userToken); // Décoder l'ID utilisateur
  
    try {
      // Recherchez l'utilisateur dans la base de données
      const user = await User.findOne({ token: userToken });
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur introuvable.' });
      }
  
      // Utilisez l'_id de l'utilisateur pour récupérer les réponses
      const responses = await SurveyResponse.find({ user: user._id });
  
      if (!responses.length) {
        return res.status(404).json({ error: 'Aucune réponse trouvée pour cet utilisateur.' });
      }
  
      res.status(200).json(responses);
    } catch (err) {
      console.error('Erreur lors de la récupération des réponses :', err);
      res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
  });

app.put('/api/survey-response/:id', async (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;

    try {
        const surveyResponse = await SurveyResponse.findByIdAndUpdate(
            id,
            updatedData,
            { new: true } // Retourne l'objet mis à jour
        );

        if (!surveyResponse) {
            return res.status(404).json({ message: 'Réponse introuvable.' });
        }

        res.status(200).json(surveyResponse);
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la réponse :', error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
});

app.delete('/api/delete-user-data', async (req, res) => {
    try {
      const userId = req.userId; // Supposez que vous récupérez l'ID utilisateur via un middleware d'authentification.
  
      // Supprimez les données liées à l'utilisateur
      await Promise.all([
        SurveyResponse.deleteMany({ user: userId }),
        Reminder.deleteMany({ "posology.user": userId }),
        Posology.deleteMany({ user: userId }),
        Subscription.deleteMany({ user: userId }),
      ]);
  
      res.status(200).json({ message: "Données utilisateur supprimées avec succès." });
    } catch (err) {
      console.error("Erreur lors de la suppression des données utilisateur :", err);
      res.status(500).json({ error: "Erreur interne du serveur." });
    }
  });

  
// Démarrer le serveur
app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});

// Gestion des routes non trouvées
app.use((req, res) => {
    res.status(404).json({ error: 'Route introuvable.' });
});