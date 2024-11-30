const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3000;
const webPush = require('web-push');
const Subscription = require('./src/models/subscription.model');
const cron = require('node-cron');


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

  try {
    const user = await User.findOne({ token });
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable.' });

    let userSubscription = await Subscription.findOne({ user: user._id });
    if (!userSubscription) {
      userSubscription = new Subscription({ user: user._id, subscription });
      await userSubscription.save();
    } else {
      userSubscription.subscription = subscription;
      await userSubscription.save();
    }

    res.status(200).json({ message: 'Abonnement enregistré avec succès.' });
  } catch (err) {
    console.error('Erreur lors de l\'enregistrement de l\'abonnement :', err);
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement de l\'abonnement.' });
  }
});

// API pour vérifier le statut de souscription d'un utilisateur
app.get('/api/subscription-status/:token', async (req, res) => {
  const { token } = req.params; // Récupération du paramètre "token"

  try {
    console.log('Requête pour le token:', token);

    // Recherchez l'utilisateur en utilisant le token
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable.' });
    }

    // Recherchez la souscription pour cet utilisateur
    const subscription = await Subscription.findOne({ user: user._id });
    if (!subscription) {
      return res.status(200).json({ isSubscribed: false });
    }

    res.status(200).json({ isSubscribed: true });
  } catch (err) {
    console.error('Erreur lors de la vérification du statut de souscription :', err);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

app.delete('/api/unsubscribe/:token', async (req, res) => {
  const { token } = req.params; // Récupère le paramètre "token"
  try {
    console.log('Requête pour désabonnement, token reçu :', token);

    // Trouver l'utilisateur par le token
    const user = await User.findOne({ token });
    if (!user) {
      console.error('Utilisateur introuvable pour le token:', token);
      return res.status(404).json({ error: 'Utilisateur introuvable.' });
    }

    // Supprimer l'abonnement lié à cet utilisateur
    await Subscription.deleteOne({ user: user._id });
    console.log('Abonnement supprimé pour l\'utilisateur:', user._id);

    res.status(200).json({ message: 'Souscription supprimée avec succès.' });
  } catch (err) {
    console.error('Erreur lors de la suppression de l\'abonnement :', err);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'abonnement.' });
  }
});



app.post('/api/test-notification', async (req, res) => {
  const { token } = req.body;

  try {
    const user = await User.findOne({ token });
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable.' });

    const subscription = await Subscription.findOne({ user: user._id });
    if (!subscription) return res.status(404).json({ error: 'Abonnement introuvable.' });

    const payload = JSON.stringify({
      notification: {
        title: 'Ma notification d\'exemple',
        body: 'Voici le corps de ma notification',
        icon: 'assets/icons/icon-384x384.png', // Chemin vers votre icône
        actions: [
          { action: 'action1', title: 'Action personnalisée' },
          { action: 'action2', title: 'Une autre action' },
        ],
        data: {
          onActionClick: {
            default: { operation: 'openWindow', url: "http://localhost:4200/notifications" },
            action1: {
              operation: 'focusLastFocusedOrOpen',
              url: '/signin',
            },
            action2: {
              operation: 'navigateLastFocusedOrOpen',
              url: '/signin',
            },
          },
        },
      },
    });

    await webPush.sendNotification(subscription.subscription, payload);

    res.status(200).json({ message: 'Notification envoyée avec succès.' });
  } catch (err) {
    console.error('Erreur lors de l\'envoi de la notification :', err);
    res.status(500).json({ error: 'Erreur lors de l\'envoi de la notification.' });
  }
});


app.get('/api/reminders/:token', async (req, res) => {
  const { token } = req.params;

  try {
    // Rechercher l'utilisateur par token
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable.' });
    }

    // Rechercher les rappels de l'utilisateur
    let reminders = await Reminder.find({ user: user._id }).sort({ scheduledTime: 1 });

    // Si aucun rappel trouvé, initialiser une liste vide de rappels
    if (!reminders.length) {
      console.log(`Aucun rappel trouvé pour l'utilisateur ${user._id}. Initialisation...`);
      const initialReminder = new Reminder({ user: user._id, medicationName: '', scheduledTime: null });
      await initialReminder.save();

      reminders = [initialReminder];
    }

    // Retourner les rappels (ou un rappel initialisé)
    res.status(200).json(reminders);
  } catch (err) {
    console.error('Erreur lors de la récupération des rappels :', err);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});


app.post('/api/posology', async (req, res) => {
  try {
    const { userId, medicationName, scheduledTime } = req.body;

    if (!userId || !medicationName || !scheduledTime) {
      return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    const posology = new Posology({
      user: userId,
      medicationName,
      scheduledTime,
    });

    await posology.save();
    res.status(201).json({ message: 'Posologie ajoutée avec succès.' });
  } catch (err) {
    console.error('Erreur lors de l\'ajout de la posologie :', err);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

cron.schedule('* * * * *', async () => {
  console.log('Vérification des rappels de médicaments...');

  const now = new Date();
  const threeMinutesAgo = new Date();
  threeMinutesAgo.setMinutes(threeMinutesAgo.getMinutes() - 3);

  try {
    // Étape 1 : Récupérer toutes les posologies non prises ou nécessitant un rappel
    const reminders = await Posology.find({
      $or: [
        { scheduledTime: { $lte: now }, taken: false }, // Rappels initiaux
        { scheduledTime: { $lte: threeMinutesAgo }, taken: false, reminded: true }, // Rappels manqués
      ],
    });

    for (const reminder of reminders) {
      // Étape 2 : Trouver la souscription de l'utilisateur
      const userSubscription = await Subscription.findOne({ user: reminder.user });
      if (!userSubscription) {
        console.log(`Aucune souscription trouvée pour l'utilisateur ${reminder.user}`);
        continue;
      }

      // Déterminer le type de notification
      const isReminder = reminder.reminded || false;
      const payload = JSON.stringify({
        notification: {
          title: isReminder ? 'Rappel important' : 'Rappel de médicament',
          body: isReminder
            ? `Vous n'avez pas confirmé si vous avez pris votre médicament : ${reminder.medicationName}`
            : `Il est temps de prendre votre médicament : ${reminder.medicationName}`,
          icon: 'assets/icons/icon-384x384.png',
          actions: [
            { action: 'confirm', title: 'Pris' },
            { action: 'remind', title: 'Rappeler plus tard' },
          ],
          data: {
            reminderId: reminder._id,
          },
        },
      });

      // Étape 3 : Envoyer la notification
      await webPush.sendNotification(userSubscription.subscription, payload);
      console.log(`Notification envoyée pour ${reminder.medicationName} à l'utilisateur ${reminder.user}`);

      // Étape 4 : Marquer comme rappelé ou notifier
      if (isReminder) {
        // Si c'est un rappel, il ne sera pas rappelé à nouveau
        await Posology.updateOne({ _id: reminder._id }, { $set: { reminded: false } });
      } else {
        // Si c'est la première notification, activer le rappel
        await Posology.updateOne({ _id: reminder._id }, { $set: { reminded: true } });
      }
    }
  } catch (err) {
    console.error('Erreur lors de l\'envoi des rappels :', err);
  }
});

//pour gérer les actions prises après réception d'une notification.
app.post('/api/notification-response', async (req, res) => {
  try {
    const { reminderId, action } = req.body;

    const reminder = await Posology.findById(reminderId);
    if (!reminder) {
      return res.status(404).json({ error: 'Rappel introuvable.' });
    }

    if (action === 'confirm') {
      // L'utilisateur a confirmé avoir pris le médicament
      await Posology.updateOne({ _id: reminderId }, { $set: { taken: true, reminded: false } });
      console.log(`Le médicament ${reminder.medicationName} a été pris.`);
    } else if (action === 'remind') {
      // Rappeler l'utilisateur plus tard (dans 5 minutes)
      const newReminderTime = new Date();
      newReminderTime.setMinutes(newReminderTime.getMinutes() + 5); // Ajouter 5 minutes
      await Posology.updateOne({ _id: reminderId }, { $set: { scheduledTime: newReminderTime, reminded: false } });
      console.log(`Un rappel supplémentaire a été planifié pour ${reminder.medicationName}.`);
    }

    res.status(200).json({ message: 'Action enregistrée avec succès.' });
  } catch (err) {
    console.error('Erreur lors du traitement de la réponse de notification :', err);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});





// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
