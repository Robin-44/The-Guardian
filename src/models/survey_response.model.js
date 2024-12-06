const mongoose = require('mongoose');

const SurveyResponseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: String,
  userAge: Number,
  userGender: String,
  medicationName: String,
  medicationDosage: String,
  medicationForm: String,
  frequency: String,
  medicationDate: Date,
  reminderTime: String,
});

module.exports = mongoose.model('SurveyResponse', SurveyResponseSchema);
  