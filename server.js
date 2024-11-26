const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connecté à MongoDB'))
  .catch((err) => console.error('Erreur de connexion à MongoDB :', err));

// Importer les modèles
const User = require('./models/user.model.js');
const SurveyStatus = require('./models/survey_status.model.js');
const SurveyResponse = require('./models/survey_response.model.js');

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

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
