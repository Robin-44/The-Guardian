  const express = require('express');
  const mongoose = require('mongoose');
  const bodyParser = require('body-parser');
  const cors = require('cors');
  require('dotenv').config();

  const app = express();
  const port = 3000;
  const webPush = require('web-push');
  const Subscription = require('./src/models/subscription.model');
  const Reminder = require('./src/models/reminder.model.js');
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


  app.get('/api/reminders/:token', async (req, res) => {
    const { token } = req.params;
  
    try {
      const user = await User.findOne({ token });
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur introuvable.' });
      }
  
      // Récupérez les rappels en peuplant le champ posology
      const reminders = await Reminder.find({ user: user._id }).populate('posology');
  
      if (!reminders.length) {
        return res.status(200).json([]);
      }
  
      res.status(200).json(reminders);
    } catch (err) {
      console.error('Erreur lors de la récupération des rappels :', err);
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
  
      const posology = new Posology({
        user: userId,
        medicationName,
        scheduledTime: new Date(scheduledTime), // Déjà en UTC depuis le frontend
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
  

  // Cron pour vérifier les rappels
  cron.schedule('* * * * *', async () => {
    console.log('Vérification des rappels de médicaments...');
    const now = new Date();
    console.log(`Heure actuelle UTC : ${now.toISOString()}`);

    const rawReminders = await Reminder.find({ taken: false });
    console.log('Rappels bruts récupérés :', rawReminders);
  
    try {
      const reminders = await Reminder.find({
        taken: false,
        'posology.scheduledTime': { $lte: now }, // Comparaison en UTC
      }).populate('posology');

      console.log(`Rappels récupérés : ${reminders.length}`);
  
      for (const reminder of reminders) {
        const userSubscription = await Subscription.findOne({ user: reminder.user });
  
        if (!userSubscription) {
          console.log(`Aucune souscription trouvée pour l'utilisateur ${reminder.user}`);
          continue;
        }
  
        const payload = JSON.stringify({
          notification: {
            title: 'Rappel de médicament',
            body: `Il est temps de prendre votre médicament : ${reminder.posology.medicationName}`,
            actions: [
              { action: 'confirm', title: 'Pris' },
              { action: 'remind', title: 'Rappeler plus tard' },
            ],
            data: { reminderId: reminder._id },
          },
        });
  
        console.log(`Envoi de la notification pour ${reminder.posology.medicationName}...`);
  
        try {
          await webPush.sendNotification(userSubscription.subscription, payload);
          console.log(`Notification envoyée pour ${reminder.posology.medicationName}.`);
  
          reminder.reminded = true;
          await reminder.save();
        } catch (err) {
          console.error(`Erreur lors de l'envoi de la notification : ${err.message}`);
        }
      }
    } catch (err) {
      console.error('Erreur lors de la récupération ou de l\'envoi des rappels :', err);
    }
  });
  
  
  

  // Gestion des réponses aux notifications
  app.post('/api/notification-response', async (req, res) => {
    try {
      const { reminderId, action } = req.body;

      const reminder = await Reminder.findById(reminderId).populate('posology');
      if (!reminder) return res.status(404).json({ error: 'Rappel introuvable.' });

      if (action === 'confirm') {
        reminder.taken = true;
        reminder.confirmationTime = new Date().toISOString(); // Enregistrer en UTC
        await reminder.save();
        console.log(`Le médicament ${reminder.posology.medicationName} a été confirmé comme pris.`);
      } else if (action === 'remind') {
        const newReminderTime = new Date();
        newReminderTime.setMinutes(newReminderTime.getMinutes() + 5);
        reminder.posology.scheduledTime = newReminderTime.toISOString(); // Replanifier en UTC
        await reminder.posology.save();
        console.log(`Un rappel supplémentaire a été planifié pour ${reminder.posology.medicationName}.`);
      }

      res.status(200).json({ message: 'Action enregistrée avec succès.' });
    } catch (err) {
      console.error('Erreur lors du traitement de la réponse de notification :', err);
      res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
  });

  app.post('/api/test-notification', async (req, res) => {
    const { token } = req.body; // Le token de l'utilisateur pour lequel envoyer une notification
  
    try {
      // Rechercher l'utilisateur dans la base de données
      const user = await User.findOne({ token });
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur introuvable.' });
      }
  
      // Récupérer l'abonnement de l'utilisateur
      const subscription = await Subscription.findOne({ user: user._id });
      if (!subscription || !subscription.subscription) {
        return res.status(404).json({ error: 'Abonnement introuvable pour cet utilisateur.' });
      }
  
      // Construire le contenu de la notification
      const payload = JSON.stringify({
        notification: {
          title: 'Notification de test',
          body: 'Ceci est une notification de test pour vérifier les envois.',
          icon: 'assets/icons/icon-384x384.png',
          actions: [
            { action: 'view', title: 'Voir' },
            { action: 'dismiss', title: 'Ignorer' },
          ],
          data: {
            onActionClick: {
              default: { operation: 'openWindow', url: "http://localhost:4200/notifications" },
              view: {
                operation: 'focusLastFocusedOrOpen',
                url: '/view',
              },
              dismiss: {
                operation: 'close',
              },
            },
          },
        },
      });
  
      // Envoyer la notification via Web Push
      await webPush.sendNotification(subscription.subscription, payload);
      console.log(`Notification de test envoyée à l'utilisateur : ${user._id}`);
  
      // Répondre avec un message de succès
      res.status(200).json({ message: 'Notification de test envoyée avec succès.' });
    } catch (err) {
      console.error('Erreur lors de l\'envoi de la notification de test :', err);
      res.status(500).json({ error: 'Erreur lors de l\'envoi de la notification de test.' });
    }
  });
  

  // Démarrer le serveur
  app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
  });
