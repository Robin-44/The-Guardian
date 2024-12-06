const mongoose = require('mongoose');

const SurveyResponseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: String,
  userAge: Number,
  userGender: String,
  userWeight: Number,
  userSize: Number,
  userBloodType: String,
  userComments: String,
});

module.exports = mongoose.model('SurveyResponse', SurveyResponseSchema);