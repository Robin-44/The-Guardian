const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  posology: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Posology',
    required: true,
  },  
  taken: {
    type: Boolean,
    default: false, 
  },
  reminded: {
    type: Boolean,
    default: false, // Notification initiale envoyée
  },
  resendNotified: {
    type: Boolean,
    default: false, // Notification de renvoi envoyée
  },
  confirmationTime: {
    type: Date,
    default: null,
  },
});

module.exports = mongoose.model('Reminder', reminderSchema);
