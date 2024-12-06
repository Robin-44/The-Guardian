const mongoose = require('mongoose');

const SurveyStatusSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  survey_completed: { type: Boolean, default: false },
});

module.exports = mongoose.model('SurveyStatus', SurveyStatusSchema);
